import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { prisma } from "@/lib/prisma";

const s3Client = new S3Client({
  region: process.env.S3_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
});
const bucketName = process.env.CANDIDATE_RESUMES;

export async function POST(request: NextRequest) {
  try {
    const { candidateId, fileName, fileBuffer } = await request.json();

    if (!candidateId || !fileName || !fileBuffer) {
      return NextResponse.json(
        { error: "Missing candidate ID, file name, or file buffer" },
        { status: 400 }
      );
    }

    // Convert candidateId to an integer
    const candidateIdInt = parseInt(candidateId);

    if (isNaN(candidateIdInt)) {
      return NextResponse.json(
        { error: "Invalid candidate ID format" },
        { status: 400 }
      );
    }

    // Convert the base64-encoded buffer back to a binary format
    const buffer = Buffer.from(fileBuffer, "base64");

    // Upload the resume to S3
    const params = {
      Bucket: bucketName,
      Key: fileName, // Save using the candidate's ID or a unique identifier
      Body: buffer,
    };

    try {
      await s3Client.send(new PutObjectCommand(params));
      const fileUrl = `https://${bucketName}.s3.${process.env.S3_BUCKET_REGION}.amazonaws.com/${fileName}`;

      // Save the resume metadata in the database
      await prisma.resume.create({
        data: {
          filename: fileName,
          fileUrl: fileUrl,
          candidateId: candidateIdInt, // Associate with the candidate using the integer ID
        },
      });

      return NextResponse.json({
        message: "Resume uploaded successfully",
        fileUrl,
      });
    } catch (error) {
      console.error("Error uploading file to S3:", error);
      throw new Error("Failed to upload file to S3");
    }
  } catch (error) {
    console.error("Error handling resume upload:", error);
    return NextResponse.json(
      { error: "Failed to upload resume." },
      { status: 500 }
    );
  }
}
