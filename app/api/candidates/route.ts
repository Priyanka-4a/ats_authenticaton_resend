import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';  // Assuming Prisma is configured in `lib/prisma`

// POST: Create a new candidate
export async function POST(request: Request) {
  const { name } = await request.json();

  if (!name) {
    return NextResponse.json({ message: "Candidate name is required" }, { status: 400 });
  }

  try {
    const newCandidate = await prisma.candidate.create({
      data: { name },  // Prisma model name should match the schema
    });

    return NextResponse.json(newCandidate, { status: 201 });
  } catch (error) {
    console.error("Error creating candidate:", error);
    return NextResponse.json({ message: "Failed to create candidate" }, { status: 500 });
  }
}

// GET: Fetch all candidates with ID and name
export async function GET() {
  try {
    const candidates = await prisma.candidate.findMany({
      select: { id: true, name: true, createdAt: true },  // Fetch the id, name, and createdAt
    });

    return NextResponse.json(candidates, { status: 200 });
  } catch (error) {
    console.error("Error fetching candidates:", error);
    return NextResponse.json({ message: "Failed to fetch candidates" }, { status: 500 });
  }
}
