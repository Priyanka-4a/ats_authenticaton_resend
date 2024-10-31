import { NextResponse } from 'next/server';
<<<<<<< HEAD
import { prisma } from '@/lib/prisma';  // Assuming Prisma is configured in `lib/prisma`

// POST: Create a new candidate
export async function POST(request: Request) {
  const { name } = await request.json();

=======
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
>>>>>>> development
  if (!name) {
    return NextResponse.json({ message: "Candidate name is required" }, { status: 400 });
  }

  try {
    const newCandidate = await prisma.candidate.create({
<<<<<<< HEAD
      data: { name },  // Prisma model name should match the schema
=======
      data: {
        name,
        user: {
          connect: { id: session.user.id }, // Associate the candidate with the logged-in user
        },
      },
>>>>>>> development
    });

    return NextResponse.json(newCandidate, { status: 201 });
  } catch (error) {
    console.error("Error creating candidate:", error);
    return NextResponse.json({ message: "Failed to create candidate" }, { status: 500 });
  }
}

<<<<<<< HEAD
// GET: Fetch all candidates with ID and name
export async function GET() {
  try {
    const candidates = await prisma.candidate.findMany({
      select: { id: true, name: true, createdAt: true },  // Fetch the id, name, and createdAt
=======
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
>>>>>>> development
    });

    return NextResponse.json(candidates, { status: 200 });
  } catch (error) {
    console.error("Error fetching candidates:", error);
    return NextResponse.json({ message: "Failed to fetch candidates" }, { status: 500 });
  }
}
