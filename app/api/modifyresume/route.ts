import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma"; // Adjust path based on your project structure

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const candidateId = searchParams.get('candidateId');
  const resumeId = searchParams.get('resumeId');

  if (!candidateId || !resumeId) {
    return NextResponse.json({ error: 'Missing candidateId or resumeId' }, { status: 400 });
  }

  try {
    const resume = await prisma.resume.findFirst({
      where: {
        id: parseInt(resumeId),
        candidateId: parseInt(candidateId),
      },
      select: {
        ResumefileUrl: true,
        JobDescription: true,
      },
    });

    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    return NextResponse.json({
      resumeUrl: resume.ResumefileUrl,
      jobDescription: resume.JobDescription,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Server error while fetching resume data' }, { status: 500 });
  }
}
