import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma"; // Adjust the import path based on your project structure

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const candidateId = searchParams.get('candidateId');
  const resumeId = searchParams.get('resumeId');
  const generatedResumeId = searchParams.get('generatedResumeId'); // Match parameter name with URL

  if (!candidateId || !resumeId) {
    return NextResponse.json({ error: 'Missing candidateId or resumeId' }, { status: 400 });
  }

  try {
    let responseData;

    if (generatedResumeId) {
      const generatedResume = await prisma.generated_Resume.findFirst({
        where: {
          id: parseInt(generatedResumeId),
          candidateId: parseInt(candidateId),
          resumeId: parseInt(resumeId),
        },
        select: {
          Resumefilename: true,
          ResumefileUrl: true,
          JobDescription: true,
        },
      });

      if (!generatedResume) {
        return NextResponse.json({ error: 'Generated resume not found' }, { status: 404 });
      }

      console.log("Generated Resumefilename:", generatedResume.Resumefilename);

      responseData = {
        resumefilename: generatedResume.Resumefilename,
        resumeUrl: generatedResume.ResumefileUrl,
        jobDescription: generatedResume.JobDescription,
      };
    } else {
      const resume = await prisma.resume.findFirst({
        where: {
          id: parseInt(resumeId),
          candidateId: parseInt(candidateId),
        },
        select: {
          Resumefilename: true,
          ResumefileUrl: true,
          JobDescription: true,
        },
      });

      if (!resume) {
        return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
      }

      responseData = {
        resumefilename: resume.Resumefilename,
        resumeUrl: resume.ResumefileUrl,
        jobDescription: resume.JobDescription,
      };
    }

    return NextResponse.json(responseData);
  } catch (error) {
    return NextResponse.json({ error: 'Server error while fetching resume data' }, { status: 500 });
  }
}
