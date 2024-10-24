import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Assuming Prisma is configured in `lib/prisma`

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const candidateId = parseInt(params.id);
  if (isNaN(candidateId)) {
    return NextResponse.json({ message: 'Invalid candidate ID' }, { status: 400 });
  }

  try {
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      include: {
        resumes: true, // Include resumes
        atsScores: true,  // Include ATS scores (correct field name)
      },
    });

    if (!candidate) {
      return NextResponse.json({ message: 'Candidate not found' }, { status: 404 });
    }

    return NextResponse.json(candidate, { status: 200 });
  } catch (error) {
    console.error("Error fetching candidate:", error);
    return NextResponse.json({ message: 'Failed to fetch candidate' }, { status: 500 });
  }
}
