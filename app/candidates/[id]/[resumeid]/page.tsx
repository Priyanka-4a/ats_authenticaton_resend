import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import GeneratedResumeTable from './GeneratedResumeTable';
import Link from 'next/link';

async function getCandidateWithResume(candidateId: number, resumeId: number) {
  try {
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      include: {
        resumes: true,
        atsScores: true,
        generatedResumes: {
          where: { resumeId: resumeId },
          include: {
            generatedATSScores: true,
          },
        },
      },
    });
    return candidate;
  } catch (error) {
    console.error('Database query error:', error);
    return null;
  }
}

export default async function CandidateResumePage({ params }: { params: { id: string; resumeid: string } }) {
  const candidateId = parseInt(params.id);
  const resumeId = parseInt(params.resumeid);
  const candidate = await getCandidateWithResume(candidateId, resumeId);

  if (!candidate) {
    return redirect('/candidates/not-found');
  }

  if (candidate.generatedResumes.length === 0) {
    return redirect(`/candidates/${candidateId}/${resumeId}/no-generated-resume`);
  }

  // Convert dates to strings to pass to the client component
  const candidateSerialized = {
    ...candidate,
    resumes: candidate.resumes.map((resume) => ({
      ...resume,
      uploadedAt: resume.uploadedAt.toISOString(),
    })),
    scores: candidate.atsScores.map((score) => ({
      ...score,
      createdAt: score.createdAt.toISOString(),
    })),
    generatedResumes: candidate.generatedResumes.map((generatedResume) => ({
      ...generatedResume,
      uploadedAt: generatedResume.uploadedAt.toISOString(),
      generatedATSScores: generatedResume.generatedATSScores.map((generatedScore) => ({
        ...generatedScore,
        createdAt: generatedScore.createdAt.toISOString(),
      })),
    })),
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{candidate.name}'s Profile</h1>
      </div>
      <GeneratedResumeTable candidate={candidateSerialized} />
      <Link href={`/candidates/${candidateId}`} className="text-blue-500 mt-4 block">
    Go Back
    </Link>
    </div>
  );
}
