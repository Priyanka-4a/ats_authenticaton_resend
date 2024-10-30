import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { prisma } from "@/lib/prisma";
import { Buffer } from "buffer";

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
    const { candidateId, fileName, fileBuffer, jobDescription, JobBuffer, Jobfilename } = await request.json();

    // Log request data for debugging
    console.log("Received request data:", {
      candidateId,
      fileName,
      fileBuffer: fileBuffer ? "Buffer exists" : "No buffer",
      jobDescription,
      JobBuffer: JobBuffer ? "Buffer exists" : "No buffer",
      Jobfilename
    });

    if (!fileName || !fileBuffer || !jobDescription) {
      console.error("Missing required fields:", { fileName, fileBuffer, jobDescription });
      return NextResponse.json(
        { error: "Missing file name, file buffer, or job description" },
        { status: 400 }
      );
    }

    // Convert the base64-encoded buffer back to binary format for the resume
    const resumeBuffer = Buffer.from(fileBuffer, "base64");

    // Upload resume to S3
    const resumeUploadParams = {
      Bucket: resumeBucketName,
      Key: fileName,
      Body: resumeBuffer,
    };

    // Set up parameters and upload job description to S3 if it exists
    let jobDescriptionFileUrl = null;
    if (JobBuffer && Jobfilename) {
      const jobDescriptionBuffer = Buffer.from(JobBuffer, "base64");
      const jobDescriptionUploadParams = {
        Bucket: jobDescriptionBucketName,
        Key: Jobfilename,
        Body: jobDescriptionBuffer,
      };
      await s3Client.send(new PutObjectCommand(jobDescriptionUploadParams));
      jobDescriptionFileUrl = `https://${jobDescriptionBucketName}.s3.${process.env.S3_BUCKET_REGION}.amazonaws.com/${Jobfilename}`;
    }

    // Upload resume to S3 and get URL
    await s3Client.send(new PutObjectCommand(resumeUploadParams));
    const resumeFileUrl = `https://${resumeBucketName}.s3.${process.env.S3_BUCKET_REGION}.amazonaws.com/${fileName}`;

    // Save resume metadata in the database, including job description URL if available
    const createdResume = await prisma.resume.create({
      data: {
        Resumefilename: fileName,
        ResumefileUrl: resumeFileUrl,
        JobDescriptionfileUrl: jobDescriptionFileUrl,
        JobDescription: jobDescription,
        candidateId: parseInt(candidateId, 10),
      },
    });

    return NextResponse.json({
      message: "Resume and job description uploaded successfully",
      resumeFileUrl,
      jobDescriptionFileUrl,
      jobDescription,
      resumeId: createdResume.id
    });

  } catch (error) {
    console.error("Error processing upload request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}