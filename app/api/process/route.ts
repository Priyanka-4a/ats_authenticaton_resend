import { ATSCompatibilityResult } from "@/types";
import { createOpenAiPrompt } from "@/utils/create-openai-prompt";
import { NextRequest, NextResponse } from "next/server";

const openaiApiKey = process.env.OPENAI_API_KEY;

if (!openaiApiKey) {
  throw new Error("Missing required environment variable: OPENAI_API_KEY");
}

async function fetchAtsAnalysisFromOpenAI(prompt: string): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openaiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch data from OpenAI: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// Function to parse ATS score from the OpenAI response
function parseAtsCompatibilityScore(openAiResponse: string): number {
  const atsCompatibilityScoreMatch = openAiResponse.match(
    /ATS\s*Score.*?(\d{1,3})/i
  );
  return atsCompatibilityScoreMatch && atsCompatibilityScoreMatch[1]
    ? parseInt(atsCompatibilityScoreMatch[1], 10)
    : 0;
}

export async function POST(request: NextRequest) {
  try {
    const { jobDescription, resumeTexts, fileNames, weights } =
      await request.json();

    if (
      !jobDescription ||
      !resumeTexts ||
      resumeTexts.length === 0 ||
      !fileNames ||
      fileNames.length === 0
    ) {
      return NextResponse.json(
        { error: "Job description, resume texts, or file names are missing." },
        { status: 400 }
      );
    }

    const atsCompatibilityResults: ATSCompatibilityResult[] = [];

    for (let i = 0; i < resumeTexts.length; i++) {
      const resumeText = resumeTexts[i];
      const fileName = fileNames[i];
      const prompt = createOpenAiPrompt(resumeText, jobDescription, weights);
      const openAiResponse = await fetchAtsAnalysisFromOpenAI(prompt);

      const atsCompatibilityScore = parseAtsCompatibilityScore(openAiResponse);

      atsCompatibilityResults.push({
        fileName,
        atsCompatibilityScore,
        summary: openAiResponse,
      });
    }

    return NextResponse.json({ atsCompatibilityResults });
  } catch (error) {
    console.error("Error processing ATS request:", error);
    return NextResponse.json(
      { error: "Failed to process the ATS scores." },
      { status: 500 }
    );
  }
}
