import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { prisma } from "@/lib/prisma";
import { Buffer } from "buffer";

const s3Client = new S3Client({
  region: process.env.S3_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
});

const generatedResumeBucketName = process.env.CANDIDATE_GENERATED_RESUMES;

if (!generatedResumeBucketName) {
  throw new Error("Missing required environment variables for S3 bucket names");
}

export async function POST(request: NextRequest) {
  try {
    // Parse form data
    const formData = await request.formData();
    const candidateId = formData.get("candidateId")?.toString();
    const resumeId = formData.get("resumeId")?.toString();
    const jobDescription = formData.get("jobDescription")?.toString();
    const resumeFilename = formData.get("resumeFilename")?.toString();
    const pdfFile = formData.get("pdf") as File;

    // Check for missing required fields
    if (!candidateId || !resumeId || !jobDescription || !resumeFilename || !pdfFile) {
      throw new Error("Missing required fields in the request");
    }

    // Convert file to buffer for S3 upload
    const fileBuffer = await pdfFile.arrayBuffer();
    const buffer = Buffer.from(fileBuffer);

    const s3Filename = `${candidateId}_${resumeId}_${resumeFilename}_generated.pdf`;

    // Upload the file to S3
    await s3Client.send(
      new PutObjectCommand({
        Bucket: generatedResumeBucketName,
        Key: s3Filename,
        Body: buffer,
        ContentType: 'application/pdf',
      })
    );

    // Construct the S3 URL for the uploaded file
    const fileUrl = `https://${generatedResumeBucketName}.s3.${process.env.S3_BUCKET_REGION}.amazonaws.com/${s3Filename}`;
    
    // Record the file URL and other data in the database
    const newGeneratedResume = await prisma.generated_Resume.create({
      data: {
        Resumefilename: s3Filename,
        ResumefileUrl: fileUrl,
        JobDescription: jobDescription,
        candidateId: parseInt(candidateId, 10),
        resumeId: parseInt(resumeId, 10),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Resume uploaded to S3 and recorded in the database successfully',
      data: newGeneratedResume,
      createdId: newGeneratedResume.id,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Error uploading resume or updating the database', error: String(error) }, { status: 500 });
  }
}

export const config = {
  api: { bodyParser: false }, // Disable automatic body parsing for form data
};
