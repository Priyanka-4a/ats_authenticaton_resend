"use client";
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

export default function ModifyResume() {
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [jobUrl, setJobUrl] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState<string | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [recruiterPrompt, setRecruiterPrompt] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState("");
  const [pdfData, setPdfData] = useState<string | null>(null); 

  const searchParams = useSearchParams();

  const api_key = "";
  const provider = "GPT";
  const model = "gpt-4o";

  useEffect(() => {
    if (searchParams) {
      const resumeUrlParam = searchParams.get('resumeUrl');
      const jobUrlParam = searchParams.get('jobUrl'); 

      if (resumeUrlParam && jobUrlParam) {
        setResumeUrl(resumeUrlParam);
        setJobUrl(jobUrlParam);
        fetchResumeFile(resumeUrlParam);  // Fetch resume file from URL
        fetchJobDescription(jobUrlParam); // Fetch job description text
      } else {
        setError('Invalid resume or job URL');
        setLoading(false);
      }
    }
  }, [searchParams]);

  // Fetch job description text from modifyresume API
  const fetchJobDescription = async (jobUrl: string) => {
    try {
      const response = await fetch(`/api/modifyresume?jobUrl=${encodeURIComponent(jobUrl)}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch job description: ${response.statusText}`);
      }
      const data = await response.json();
      setJobDescription(data.jobDescription);
    } catch (err) {
      setError('Failed to fetch job description');
    } finally {
      setLoading(false);
    }
  };

  // Fetch resume file from resumeUrl
  const fetchResumeFile = async (resumeUrl: string) => {
    try {
      const response = await fetch(resumeUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch resume file');
      }

      const blob = await response.blob();
      const file = new File([blob], 'resume.pdf', { type: blob.type });
      setResumeFile(file); // Set resume file in state
    } catch (error) {
      setError('Failed to load resume file');
    }
  };

  // Handle form submission and send data to the server
  const handleSubmit = async () => {
    // Ensure the recruiterPrompt is provided, and both resumeFile and jobDescription are fetched
    if (!recruiterPrompt || !resumeFile || !jobDescription) {
      setErrorMessage("Please fill all fields and ensure the required files are loaded.");
      return;
    }
  
    setLoading(true);
  
    const formData = new FormData();
    formData.append("resume", resumeFile); // Attach the fetched resume file
    formData.append("job_description", jobDescription); // Attach the fetched job description text
    formData.append("recruiter_prompt", recruiterPrompt);
    formData.append("api_key", api_key);
    formData.append("provider", provider);
    formData.append("model", model);
  
    try {
      const response = await fetch("/api/server", {
        method: "POST",
        body: formData,
      });
  
      if (response.ok) {
        const json = await response.json();
        setPdfData(json.filePath);  // URL of the generated file
      } else {
        const error = await response.json();
        setErrorMessage(error.error || "Failed to generate resume.");
      }
    } catch (error) {
      setErrorMessage("Error submitting the form. Please try again.");
    } finally {
      setLoading(false);
    }
  };  

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center text-black">
        Modify Resume
      </h1>
      <div className="mb-4">
        <label className="block mb-2 text-gray-700"></label>
        <textarea
          value={recruiterPrompt}
          onChange={(e) => setRecruiterPrompt(e.target.value)}
          rows={4}
          className="p-2 block w-full text-sm text-gray-900 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          placeholder="Enter any additional notes or recruiter prompts here..."
        />
      </div>
      <div className="flex justify-center mt-6">
        <button
          onClick={handleSubmit}
          className="bg-black hover:bg-gray-800 text-white font-bold py-2 px-6 rounded"
          disabled={loading}
        >
          {loading ? "Generating Resume..." : "Build Resume"}
        </button>
      </div>
      {errorMessage && <p className="text-red-600 text-center mt-4">{errorMessage}</p>}
      {pdfData && (
        <div className="mt-8">
          <h3 className="text-2xl font-semibold text-center mb-4 text-gray-700">
            Your Generated Resume
          </h3>
          <iframe
            src={pdfData}
            title="Generated Resume"
            className="w-full h-screen border border-gray-300 rounded-lg shadow-sm"
          />
          <div className="flex justify-center mt-4">
            <a
              href={pdfData}
              download="generated_resume.pdf"
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded"
            >
              Download Resume
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
