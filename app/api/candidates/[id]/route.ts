import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const candidateId = parseInt(params.id);
  const userId = session.user.id;

  if (isNaN(candidateId)) {
    console.error("Invalid candidate ID provided:", params.id);
    return NextResponse.json({ message: 'Invalid candidate ID' }, { status: 400 });
  }

  try {
    console.log(`Fetching candidate with ID ${candidateId} for user ID ${userId}`);

    const candidate = await prisma.candidate.findFirst({
      where: {
        id: candidateId,
        userId,
      },
      include: {
        resumes: true,
        atsScores: true,
      },
    });

    if (!candidate) {
      console.error(`No candidate found with ID ${candidateId} for user ID ${userId}`);
      return NextResponse.json({ message: 'Candidate not found or not associated with the user' }, { status: 404 });
    }

    console.log("Candidate data retrieved successfully:", candidate);
    return NextResponse.json(candidate, { status: 200 });
  } catch (error) {
    console.error("Error fetching candidate:", error);
    return NextResponse.json({ message: `Failed to fetch candidate: ${error.message}` }, { status: 500 });
  }
}
