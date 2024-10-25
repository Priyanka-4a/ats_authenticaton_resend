import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const jobUrl = searchParams.get('jobUrl');

  if (!jobUrl) {
    return NextResponse.json({ error: 'Missing jobUrl' }, { status: 400 });
  }

  try {
    // Fetch the content from the provided jobUrl
    const response = await fetch(jobUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'text/plain',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: `Failed to fetch job description: ${response.statusText}` }, { status: response.status });
    }

    const text = await response.text();
    return NextResponse.json({ jobDescription: text });
  } catch (error) {
    return NextResponse.json({ error: 'Server error while fetching job description' }, { status: 500 });
  }
}
