const multer = require('multer');
const { spawn } = require('child_process');
const path = require('path');

// Multer configuration for file uploads (uploads go into `public/uploads`)
const upload = multer({
  storage: multer.diskStorage({
    destination: './public/uploads',  // Store uploaded files in the "uploads" folder
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  }),
});

// Disable Next.js bodyParser to handle multer's file upload
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper function to handle `multer` logic with a Promise wrapper
const runMiddleware = (req, res, fn) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // Run the `multer` middleware to handle file upload
      await runMiddleware(req, res, upload.single('resume'));

      // Extract additional form fields
      const { job_description, recruiter_prompt, api_key, provider, model } = req.body;

      if (!req.file || !job_description || !recruiter_prompt || !api_key || !provider || !model) {
        return res.status(400).json({ error: 'Please fill all fields and upload the required files.' });
      }

      // Prepare arguments for the Python script
      const pythonArgs = [
        path.join(process.cwd(), 'backend', 'app.py'),  // Path to the Python script
        req.file.path,                                 // Resume file path
        job_description,                               // Job description
        recruiter_prompt,                              // Recruiter prompt
        api_key,                                       // API key
        provider,                                      // Provider
        model                                          // Model
      ];

      // Spawn a child process to run the Python script
      const pythonProcess = spawn('python3', pythonArgs);

      let pythonOutput = '';

      // Capture Python script output (file path)
      pythonProcess.stdout.on('data', (data) => {
        pythonOutput += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
      });

      // Once the process is done
      pythonProcess.on('close', (code) => {
        if (code === 0) {
          const processedResumePath = pythonOutput.trim();  // Path to the generated resume file

          // Since app.py already moves the file, we directly send the file path
          res.status(200).json({ filePath: `/generated/${path.basename(processedResumePath)}` });
        } else {
          res.status(500).json({ error: 'Python script failed.' });
        }
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Something went wrong!' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
