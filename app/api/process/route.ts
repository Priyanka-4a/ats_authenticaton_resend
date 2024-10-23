import { ATSCompatibilityResult } from "@/types";
import { createOpenAiPrompt } from "@/utils/create-openai-prompt";
import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { prisma } from "@/lib/prisma"; // Assuming Prisma is set up in `lib/prisma`

const openaiApiKey = process.env.OPENAI_API_KEY;
const s3Client = new S3Client({
  region: process.env.S3_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
});
const bucketName = process.env.CANDIDATE_RESUMES;

if (!openaiApiKey) {
  throw new Error("Missing required environment variable: OPENAI_API_KEY");
}

async function fetchAtsAnalysisFromOpenAI(prompt: string): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openaiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch data from OpenAI: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// Function to parse ATS score from the OpenAI response
function parseAtsCompatibilityScore(openAiResponse: string): number {
  const atsCompatibilityScoreMatch = openAiResponse.match(
    /ATS\s*Score.*?(\d{1,3})/i
  );
  return atsCompatibilityScoreMatch && atsCompatibilityScoreMatch[1]
    ? parseInt(atsCompatibilityScoreMatch[1], 10)
    : 0;
}

// Function to upload a resume to S3
async function uploadResumeToS3(file: Buffer, fileName: string) {
  const params = {
    Bucket: bucketName,
    Key: fileName, // Use the candidate ID or name for unique filenames
    Body: file,
  };

  try {
    await s3Client.send(new PutObjectCommand(params));
    return `https://${bucketName}.s3.${process.env.S3_BUCKET_REGION}.amazonaws.com/${fileName}`;
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    throw new Error("Failed to upload file to S3");
  }
}

export async function POST(request: NextRequest) {
  try {
    const { jobDescription, resumeTexts, fileNames, weights, candidateId } = await request.json();

    if (
      !jobDescription ||
      !resumeTexts ||
      resumeTexts.length === 0 ||
      !fileNames ||
      fileNames.length === 0 ||
      !candidateId
    ) {
      return NextResponse.json(
        { error: "Job description, resume texts, file names, or candidate ID are missing." },
        { status: 400 }
      );
    }

    // Convert candidateId to an integer
    const candidateIdInt = parseInt(candidateId, 10);

    if (isNaN(candidateIdInt)) {
      return NextResponse.json(
        { error: "Invalid candidate ID format" },
        { status: 400 }
      );
    }

    const atsCompatibilityResults: ATSCompatibilityResult[] = [];

    for (let i = 0; i < resumeTexts.length; i++) {
      const resumeText = resumeTexts[i];
      const fileName = fileNames[i];

      // Create prompt for OpenAI
      const prompt = createOpenAiPrompt(resumeText, jobDescription, weights);
      const openAiResponse = await fetchAtsAnalysisFromOpenAI(prompt);

      // Parse ATS score
      const atsCompatibilityScore = parseAtsCompatibilityScore(openAiResponse);

      // Store ATS score and summary in the database
      await prisma.aTS_Score.create({
        data: {
          score: atsCompatibilityScore,
          summary: openAiResponse,
          candidateId: candidateIdInt, // Use integer ID
        },
      });

      atsCompatibilityResults.push({
        fileName,
        atsCompatibilityScore,
        summary: openAiResponse,
      });
    }

    return NextResponse.json({ atsCompatibilityResults });
  } catch (error) {
    console.error("Error processing ATS request:", error);
    return NextResponse.json(
      { error: "Failed to process the ATS scores." },
      { status: 500 }
    );
  }
}

