import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma"; // Named import for prisma

// POST: Create a new candidate
export async function POST(request: Request) {
  const session = await getServerSession({ req: request, ...authOptions });
  console.log("Session in POST /api/candidates:", session); // Debug session

  if (!session || !session.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { name } = await request.json();
  if (!name) {
    return NextResponse.json({ message: "Candidate name is required" }, { status: 400 });
  }

  try {
    const newCandidate = await prisma.candidate.create({
      data: {
        name,
        user: {
          connect: { id: session.user.id }, // Associate the candidate with the logged-in user
        },
      },
    });

    return NextResponse.json(newCandidate, { status: 201 });
  } catch (error) {
    console.error("Error creating candidate:", error);
    return NextResponse.json({ message: "Failed to create candidate" }, { status: 500 });
  }
}

// GET: Fetch all candidates for the logged-in user
export async function GET(request: Request) {
  const session = await getServerSession({ req: request, ...authOptions });
  console.log("Session in GET /api/candidates:", session); // Debug session

  if (!session || !session.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const candidates = await prisma.candidate.findMany({
      where: { userId: session.user.id }, // Fetch only candidates belonging to the logged-in user
      select: { id: true, name: true, createdAt: true },
    });

    return NextResponse.json(candidates, { status: 200 });
  } catch (error) {
    console.error("Error fetching candidates:", error);
    return NextResponse.json({ message: "Failed to fetch candidates" }, { status: 500 });
  }
}
