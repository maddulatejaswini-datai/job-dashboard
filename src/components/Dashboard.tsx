"use client";

import { useMemo, useState } from "react";
import { Job, ScoreResult } from "@/lib/types";
import ResumeUpload from "./ResumeUpload";
import JobCard from "./JobCard";
import TailorModal from "./TailorModal";

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

  const scoreById = useMemo(() => {
    const map = new Map<string, ScoreResult>();
    scores?.forEach((s) => map.set(s.id, s));
    return map;
  }, [scores]);

  const displayJobs = useMemo(() => {
    if (!scores) return jobs;
    return [...jobs].sort((a, b) => {
      const scoreA = scoreById.get(a.id)?.fitScore ?? -1;
      const scoreB = scoreById.get(b.id)?.fitScore ?? -1;
      return scoreB - scoreA;
    });
  }, [jobs, scores, scoreById]);

  return (
    <>
      <div className="mb-8">
        <ResumeUpload onScored={handleScored} />
        {resumeLabel && (
          <p className="mt-3 text-sm text-[#6B5F4F]">
            Showing matches for <span className="font-medium text-[#3B342A]">{resumeLabel}</span>.{" "}
            <button
              type="button"
              onClick={() => {
                setScores(null);
                setResumeLabel(null);
                setResumeText(null);
              }}
              className="underline decoration-[#DCCFB8] underline-offset-2 hover:text-[#3B342A]"
            >
              Try a different resume
            </button>
          </p>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {displayJobs.map((job) => {
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
