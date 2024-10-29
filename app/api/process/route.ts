import { ATSCompatibilityResult } from "@/types";
import { createOpenAiPrompt } from "@/utils/create-openai-prompt";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Assuming Prisma is set up in `lib/prisma`

const openaiApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

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
    const { jobDescription, resumeTexts, fileNames, weights, candidateId, resumeId, flag } = await request.json();
    const atsCompatibilityResults: ATSCompatibilityResult[] = [];
    const fileNamesArray = Array.isArray(fileNames) ? fileNames : [fileNames];

    if (flag === 0) {
      for (let i = 0; i < resumeTexts.length; i++) {
        const resumeText = resumeTexts[i];
        const fileName = fileNamesArray[i];
        
        const prompt = createOpenAiPrompt(resumeText, jobDescription, weights);
        console.log("Generated Prompt for resume:", prompt);
        
        const openAiResponse = await fetchAtsAnalysisFromOpenAI(prompt);
        console.log("OpenAI response:", openAiResponse);

        const atsCompatibilityScore = parseAtsCompatibilityScore(openAiResponse);
        
        await prisma.aTS_Score.create({
          data: {
            score: atsCompatibilityScore,
            summary: openAiResponse,
            candidateId: parseInt(candidateId, 10),
            resumeId: parseInt(resumeId[i], 10),
          },
        });

        atsCompatibilityResults.push({
          fileName,
          atsCompatibilityScore,
          summary: openAiResponse,
        });
      }
    } else if (flag === 1) {
      const resumeText = resumeTexts[0];
      const fileName = fileNamesArray[0];

      const prompt = createOpenAiPrompt(resumeText, jobDescription, weights);
      console.log("Generated Prompt for generated resume:", prompt);

      const openAiResponse = await fetchAtsAnalysisFromOpenAI(prompt);
      console.log("OpenAI response for generated resume:", openAiResponse);

      const atsCompatibilityScore = parseAtsCompatibilityScore(openAiResponse);
      console.log("Parsed ATS score:", atsCompatibilityScore);
      
      await prisma.generated_ATS_Score.create({
        data: {
          score: atsCompatibilityScore,
          summary: openAiResponse,
          candidateId: parseInt(candidateId, 10),
          generatedResumeId: parseInt(resumeId, 10),
        },
      });

      atsCompatibilityResults.push({
        fileName,
        atsCompatibilityScore,
        summary: openAiResponse,
      });
    } else {
      return NextResponse.json(
        { error: "Invalid flag value. Expected 0 or 1." },
        { status: 400 }
      );
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

