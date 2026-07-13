export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  applyUrl: string;
  description: string;
};

export type ScoreResult = {
  id: string;
  fitScore: number;
  reason: string;
};

export type ScoredJob = Job & {
  fitScore: number;
  reason: string;
};

export type TailorResult = {
  tailoredResume: string;
  coverLetter: string;
};
