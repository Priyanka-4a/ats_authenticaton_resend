export type Weights = {
  skills_matching: number;
  experience: number;
  education: number;
  keyword_usage: number;
  certifications: number;
  achievements: number;
  job_stability: number;
  cultural_fit: number;
};

export type ATSCompatibilityResult = {
  atsCompatibilityScore: number;
  summary: string;
  fileName: string;
};
