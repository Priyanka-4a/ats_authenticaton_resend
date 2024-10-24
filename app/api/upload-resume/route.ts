
import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { prisma } from "@/lib/prisma";

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.S3_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
});

const resumeBucketName = process.env.CANDIDATE_RESUMES;
const jobDescriptionBucketName = process.env.CANDIDATE_JOB_DESCRIPTION;

if (!resumeBucketName || !jobDescriptionBucketName) {
  throw new Error("Missing required environment variables for S3 bucket names");
}

export async function POST(request: NextRequest) {
  try {
    const { candidateId, fileName, fileBuffer, jobDescription } = await request.json();

    // Log request data for debugging
    console.log("Received request data:", {
      candidateId,
      fileName,
      fileBuffer: fileBuffer ? "Buffer exists" : "No buffer",
      jobDescription,
    });

    if (!fileName || !fileBuffer || !jobDescription) {
      console.error("Missing required fields:", { fileName, fileBuffer, jobDescription });
      return NextResponse.json(
        { error: "Missing file name, file buffer, or job description" },
        { status: 400 }
      );
    }

    let finalCandidateId = candidateId;

    // If no candidateId is provided, create a new candidate
    if (!candidateId) {
      const newCandidate = await prisma.candidate.create({
        data: {
          name: "New Candidate", // You can replace this with actual candidate data
        },
      });
      finalCandidateId = newCandidate.id;
      console.log("New candidate created with ID:", finalCandidateId);
    } else {
      // Check if candidate exists
      const existingCandidate = await prisma.candidate.findUnique({
        where: { id: parseInt(candidateId, 10) },
      });

      if (!existingCandidate) {
        return NextResponse.json(
          { error: `Candidate with ID ${candidateId} does not exist` },
          { status: 404 }
        );
      }

      finalCandidateId = parseInt(candidateId, 10);
    }

    // Convert the base64-encoded buffer back to binary format for the resume
    const resumeBuffer = Buffer.from(fileBuffer, "base64");

    // Upload resume to S3
    const resumeUploadParams = {
      Bucket: resumeBucketName,
      Key: fileName, // Save using the candidate's ID or a unique identifier
      Body: resumeBuffer,
    };

    // Upload job description to S3
    const jobDescriptionUploadParams = {
      Bucket: jobDescriptionBucketName,
      Key: `${finalCandidateId}_job_description.txt`, // A unique name for the job description file
      Body: jobDescription, // Upload job description as text
    };

    try {
      // Upload resume
      await s3Client.send(new PutObjectCommand(resumeUploadParams));
      const resumeFileUrl = `https://${resumeBucketName}.s3.${process.env.S3_BUCKET_REGION}.amazonaws.com/${fileName}`;

      // Upload job description
      await s3Client.send(new PutObjectCommand(jobDescriptionUploadParams));
      const jobDescriptionFileUrl = `https://${jobDescriptionBucketName}.s3.${process.env.S3_BUCKET_REGION}.amazonaws.com/${finalCandidateId}_job_description.txt`;

      // Save resume metadata in the database
      const createdResume = await prisma.resume.create({
        data: {
          Resumefilename: fileName,
          ResumefileUrl: resumeFileUrl,
          JobDescriptionfileUrl: jobDescriptionFileUrl,
          candidateId: parseInt(finalCandidateId, 10),
        },
      });

      return NextResponse.json({
        message: "Resume and job description uploaded successfully",
        resumeFileUrl,
        jobDescriptionFileUrl,
        resumeId: createdResume.id
      });
    } catch (error) {
      console.error("Error uploading files to S3:", error);
      return NextResponse.json({ error: "Failed to upload files to S3" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error processing upload request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
