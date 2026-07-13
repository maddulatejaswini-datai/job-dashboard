"use client";

import { useRef, useState } from "react";
import { ScoreResult } from "@/lib/types";

type Mode = "upload" | "paste";

export default function ResumeUpload({
  onScored,
}: {
  onScored: (scores: ScoreResult[], resumeLabel: string, resumeText: string) => void;
}) {
  const [mode, setMode] = useState<Mode>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canSubmit =
    !isSubmitting && ((mode === "upload" && file) || (mode === "paste" && pastedText.trim().length > 0));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    setError(null);

    const formData = new FormData();
    let label = "your resume";
    if (mode === "upload" && file) {
      formData.append("file", file);
      label = file.name;
    } else {
      formData.append("resumeText", pastedText);
      label = "your pasted resume";
    }

    try {
      const res = await fetch("/api/score", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      onScored(data.scores, label, data.resumeText);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-[#EBE1D3] bg-[#FFFDFA] p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-[#3B342A]">Find your best matches</h2>
      <p className="mt-1 text-sm text-[#6B5F4F]">
        Upload your resume and we&apos;ll score how well it fits each posting below.
      </p>

      <div className="mt-4 flex gap-1 rounded-full bg-[#F1E9DB] p-1 text-sm font-medium w-fit">
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={`rounded-full px-4 py-1.5 transition-colors ${
            mode === "upload" ? "bg-white text-[#3B342A] shadow-sm" : "text-[#8A7A68]"
          }`}
        >
          Upload PDF
        </button>
        <button
          type="button"
          onClick={() => setMode("paste")}
          className={`rounded-full px-4 py-1.5 transition-colors ${
            mode === "paste" ? "bg-white text-[#3B342A] shadow-sm" : "text-[#8A7A68]"
          }`}
        >
          Paste text
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-4">
        {mode === "upload" ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer rounded-xl border-2 border-dashed border-[#DCCFB8] bg-[#FBF6EC] px-4 py-8 text-center transition-colors hover:border-[#B5673A]"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <p className="text-sm text-[#6B5F4F]">
              {file ? (
                <span className="font-medium text-[#3B342A]">{file.name}</span>
              ) : (
                <>
                  <span className="font-medium text-[#B5673A]">Click to upload</span> a PDF resume
                </>
              )}
            </p>
          </div>
        ) : (
          <textarea
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder="Paste your resume text here..."
            rows={8}
            className="w-full resize-none rounded-xl border border-[#DCCFB8] bg-[#FBF6EC] p-4 text-sm text-[#3B342A] outline-none placeholder:text-[#B0A08C] focus:border-[#B5673A]"
          />
        )}

        {error && <p className="mt-3 text-sm text-[#B14A3C]">{error}</p>}

        <div className="mt-4 flex items-center justify-between gap-4">
          <p className="text-xs text-[#9C8B78]">
            Your resume is used only to score this page and isn&apos;t stored.
          </p>
          <button
            type="submit"
            disabled={!canSubmit}
            className="shrink-0 rounded-full bg-[#B5673A] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#9B5530] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Scoring..." : "Find my matches"}
          </button>
        </div>
      </form>
    </div>
  );
}
