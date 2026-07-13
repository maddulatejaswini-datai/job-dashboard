"use client";

import { useEffect, useState } from "react";
import { Job, TailorResult } from "@/lib/types";

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function CopyButton({ text }: { text: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setStatus("copied");
        } catch {
          setStatus("failed");
        }
        setTimeout(() => setStatus("idle"), 1500);
      }}
      className="rounded-full border border-[#DCCFB8] bg-white px-3 py-1 text-xs font-medium text-[#6B5F4F] transition-colors hover:border-[#B5673A] hover:text-[#B5673A]"
    >
      {status === "copied" ? "Copied!" : status === "failed" ? "Couldn't copy" : "Copy"}
    </button>
  );
}

function DownloadButton({ text, filename }: { text: string; filename: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        const blob = new Blob([text], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      }}
      className="rounded-full border border-[#DCCFB8] bg-white px-3 py-1 text-xs font-medium text-[#6B5F4F] transition-colors hover:border-[#B5673A] hover:text-[#B5673A]"
    >
      Download .txt
    </button>
  );
}

function MaterialSection({
  title,
  text,
  filename,
}: {
  title: string;
  text: string;
  filename: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#3B342A]">{title}</h3>
        <div className="flex gap-2">
          <CopyButton text={text} />
          <DownloadButton text={text} filename={filename} />
        </div>
      </div>
      <div className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-xl border border-[#EBE1D3] bg-[#FBF6EC] p-4 text-sm leading-relaxed text-[#3B342A]">
        {text}
      </div>
    </div>
  );
}

export default function TailorModal({
  job,
  resumeText,
  onClose,
}: {
  job: Job;
  resumeText: string;
  onClose: () => void;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState<TailorResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/tailor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeText, jobId: job.id }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(data.error ?? "Something went wrong. Please try again.");
          setResult(null);
          return;
        }
        setResult(data);
        setError(null);
      })
      .catch(() => {
        if (!cancelled) setError("Network error. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [job.id, resumeText, attempt]);

  const companySlug = slugify(job.company);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-[#EBE1D3] px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-[#3B342A]">Tailored application</h2>
            <p className="text-sm text-[#6B5F4F]">
              {job.title} at {job.company}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1 text-[#9C8B78] hover:bg-[#F1E9DB] hover:text-[#3B342A]"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {isLoading && (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#EBE1D3] border-t-[#B5673A]" />
              <p className="text-sm text-[#6B5F4F]">
                Tailoring your resume and cover letter for {job.title} at {job.company}...
              </p>
            </div>
          )}

          {!isLoading && error && (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <p className="text-sm text-[#B14A3C]">{error}</p>
              <button
                type="button"
                onClick={() => {
                  setIsLoading(true);
                  setError(null);
                  setAttempt((n) => n + 1);
                }}
                className="rounded-full bg-[#B5673A] px-4 py-2 text-sm font-medium text-white hover:bg-[#9B5530]"
              >
                Try again
              </button>
            </div>
          )}

          {!isLoading && result && (
            <div className="flex flex-col gap-6">
              <MaterialSection
                title="Tailored Resume"
                text={result.tailoredResume}
                filename={`${companySlug}-tailored-resume.txt`}
              />
              <MaterialSection
                title="Cover Letter"
                text={result.coverLetter}
                filename={`${companySlug}-cover-letter.txt`}
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-[#EBE1D3] bg-[#FBF6EC] px-6 py-4">
          <p className="text-xs text-[#9C8B78]">
            Copy these into the application form, then submit on the employer&apos;s site.
          </p>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-[#DCCFB8] px-4 py-2 text-sm font-medium text-[#6B5F4F] hover:border-[#B5673A] hover:text-[#B5673A]"
            >
              Close
            </button>
            <a
              href={job.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#B5673A] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#9B5530]"
            >
              Open application
              <span aria-hidden>↗</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
