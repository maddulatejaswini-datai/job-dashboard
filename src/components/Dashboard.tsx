"use client";

import { useMemo, useState } from "react";
import { Job, ScoreResult } from "@/lib/types";
import ResumeUpload from "./ResumeUpload";
import JobCard from "./JobCard";
import TailorModal from "./TailorModal";

const FIT_THRESHOLD = 65;

export default function Dashboard({ jobs }: { jobs: Job[] }) {
  const [scores, setScores] = useState<ScoreResult[] | null>(null);
  const [resumeLabel, setResumeLabel] = useState<string | null>(null);
  const [resumeText, setResumeText] = useState<string | null>(null);
  const [tailorJob, setTailorJob] = useState<Job | null>(null);

  function handleScored(newScores: ScoreResult[], label: string, text: string) {
    setScores(newScores);
    setResumeLabel(label);
    setResumeText(text);
  }

  function reset() {
    setScores(null);
    setResumeLabel(null);
    setResumeText(null);
  }

  const scoreById = useMemo(() => {
    const map = new Map<string, ScoreResult>();
    scores?.forEach((s) => map.set(s.id, s));
    return map;
  }, [scores]);

  const matchedJobs = useMemo(() => {
    if (!scores) return [];
    return jobs
      .map((job) => ({ job, score: scoreById.get(job.id) }))
      .filter((entry): entry is { job: Job; score: ScoreResult } =>
        entry.score !== undefined && entry.score.fitScore >= FIT_THRESHOLD
      )
      .sort((a, b) => b.score.fitScore - a.score.fitScore);
  }, [jobs, scores, scoreById]);

  return (
    <>
      <div className="mb-8">
        <ResumeUpload onScored={handleScored} jobCount={jobs.length} />
        {resumeLabel && (
          <p className="mt-3 text-sm text-[#6B5F4F]">
            Showing matches for <span className="font-medium text-[#3B342A]">{resumeLabel}</span>.{" "}
            <button
              type="button"
              onClick={reset}
              className="underline decoration-[#DCCFB8] underline-offset-2 hover:text-[#3B342A]"
            >
              Try a different resume
            </button>
          </p>
        )}
      </div>

      {scores && (
        <p className="mb-4 text-sm text-[#6B5F4F]">
          {matchedJobs.length} of {jobs.length} postings score {FIT_THRESHOLD}+ for this resume.
        </p>
      )}

      {scores && matchedJobs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#DCCFB8] bg-[#FBF6EC] p-8 text-center">
          <p className="text-sm text-[#6B5F4F]">
            None of the {jobs.length} current postings scored {FIT_THRESHOLD}+ for this resume.
            Try a different resume, or refresh the job pool for fresher postings.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {(scores ? matchedJobs.map((m) => m.job) : []).map((job) => {
            const score = scoreById.get(job.id);
            return (
              <JobCard
                key={job.id}
                job={job}
                fitScore={score?.fitScore}
                reason={score?.reason}
                hasResume={!!resumeText}
                onTailorApply={setTailorJob}
              />
            );
          })}
        </div>
      )}

      {tailorJob && resumeText && (
        <TailorModal
          job={tailorJob}
          resumeText={resumeText}
          onClose={() => setTailorJob(null)}
        />
      )}
    </>
  );
}
