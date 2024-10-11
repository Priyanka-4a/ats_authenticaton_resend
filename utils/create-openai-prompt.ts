import { Weights } from "@/types";

export function createOpenAiPrompt(
  resumeText: string,
  jobDescription: string,
  weights: Weights
): string {
  return `
    Please evaluate the following resume against the job description for ATS compatibility based on the following criteria:

    Weights:
    1. **Skills Matching** (${weights.skills_matching}%)
    2. **Experience** (${weights.experience}%)
    3. **Education** (${weights.education}%)
    4. **Keyword Usage** (${weights.keyword_usage}%)
    5. **Certifications** (${weights.certifications}%)
    6. **Achievements** (${weights.achievements}%)
    7. **Job Stability** (${weights.job_stability}%)
    8. **Cultural Fit** (${weights.cultural_fit}%)

    Resume: ${resumeText}
    Job Description: ${jobDescription}

    Please provide an ATS score out of 100 and a summary of your evaluation.
  `;
}
