import { Job } from "@/lib/types";
import FitScore from "./FitScore";

export default function JobCard({
  job,
  fitScore,
  reason,
}: {
  job: Job;
  fitScore?: number;
  reason?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-6 rounded-2xl border border-[#EBE1D3] bg-[#FFFDFA] p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="min-w-0">
        <h2 className="truncate text-lg font-semibold text-[#3B342A]">
          {job.title}
        </h2>
        <p className="mt-1 text-sm text-[#6B5F4F]">{job.company}</p>
        <p className="mt-0.5 text-sm text-[#9C8B78]">{job.location}</p>
        {reason && <p className="mt-2 text-sm italic text-[#8A7A68]">{reason}</p>}
        <a
          href={job.applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#B5673A] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#9B5530]"
        >
          Apply
          <span aria-hidden>→</span>
        </a>
      </div>

      {fitScore !== undefined && <FitScore score={fitScore} />}
    </div>
  );
}
