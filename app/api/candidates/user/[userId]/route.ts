import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { userId: string } }) {
  const session = await getServerSession(authOptions);

  // Check if user is authenticated
  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // Verify that the userId from the session matches the requested userId in the URL
  const authenticatedUserId = session.user.id;
  const requestedUserId = params.userId;

  if (authenticatedUserId !== requestedUserId) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  try {
    console.log(`Fetching candidates for user ID ${requestedUserId}`);

    // Fetch all candidates associated with the authenticated user
    const candidates = await prisma.candidate.findMany({
      where: {
        userId: requestedUserId,
      },
      include: {
        resumes: true,
        atsScores: true,
      },
    });

    // Return an error message if no candidates are found
    if (candidates.length === 0) {
      console.error(`No candidates found for user ID ${requestedUserId}`);
      return NextResponse.json({ message: 'No candidates found' }, { status: 404 });
    }

    console.log("Candidates data retrieved successfully:", candidates);
    return NextResponse.json({ candidates }, { status: 200 });
  } catch (error) {
    console.error("Error fetching candidates:", error);
    return NextResponse.json({ message: `Failed to fetch candidates: ${error.message}` }, { status: 500 });
  }
}
