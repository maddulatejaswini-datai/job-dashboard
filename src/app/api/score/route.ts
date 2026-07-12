import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { extractText } from "unpdf";
import { jobs } from "@/lib/jobs";

export const runtime = "nodejs";

const MAX_RESUME_CHARS = 15000;
const MAX_PDF_BYTES = 8 * 1024 * 1024;

const ScoreResponseSchema = z.object({
  scores: z.array(
    z.object({
      id: z.string(),
      fitScore: z.number(),
      reason: z.string(),
    })
  ),
});

async function extractResumeText(formData: FormData): Promise<string | { error: string }> {
  const file = formData.get("file");
  const pastedText = formData.get("resumeText");

  if (file instanceof File && file.size > 0) {
    if (file.type !== "application/pdf") {
      return { error: "Please upload a PDF file." };
    }
    if (file.size > MAX_PDF_BYTES) {
      return { error: "PDF is too large (max 8MB)." };
    }

    try {
      const buffer = new Uint8Array(await file.arrayBuffer());
      const { text } = await extractText(buffer, { mergePages: true });
      return text;
    } catch (err) {
      console.error("PDF parse failed:", err);
      return { error: "Couldn't read that PDF. Try a different file or paste the text instead." };
    }
  }

  if (typeof pastedText === "string" && pastedText.trim()) {
    return pastedText;
  }

  return { error: "Upload a PDF or paste your resume text." };
}

export async function POST(request: NextRequest) {
  try {
    return await handleScoreRequest(request);
  } catch (err) {
    console.error("Unhandled error in /api/score:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

async function handleScoreRequest(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form submission." }, { status: 400 });
  }

  const extracted = await extractResumeText(formData);
  if (typeof extracted !== "string") {
    return NextResponse.json({ error: extracted.error }, { status: 400 });
  }

  const resumeText = extracted.trim().slice(0, MAX_RESUME_CHARS);
  if (resumeText.length < 30) {
    return NextResponse.json(
      { error: "That resume looks too short to score. Try pasting the full text." },
      { status: 400 }
    );
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      {
        error:
          "Server is missing an ANTHROPIC_API_KEY. Add one to .env.local and restart the dev server.",
      },
      { status: 500 }
    );
  }

  const client = new Anthropic();

  const jobsForPrompt = jobs.map((job) => ({
    id: job.id,
    title: job.title,
    company: job.company,
    location: job.location,
    description: job.description,
  }));

  try {
    const response = await client.messages.parse({
      model: "claude-opus-4-8",
      max_tokens: 4096,
      output_config: {
        format: zodOutputFormat(ScoreResponseSchema),
        effort: "medium",
      },
      system:
        "You score how well a candidate fits open job postings based on their resume. " +
        "For each job listed, give an integer fitScore from 0 (no fit) to 100 (excellent fit) " +
        "based on how well the candidate's skills, experience level, and domain background match the " +
        "job description. Be honest and differentiate between jobs - do not give every job a similar score. " +
        "Give a one-sentence, specific reason for each score that references something concrete from the resume. " +
        "Never invent experience, skills, or years of experience the resume doesn't support.",
      messages: [
        {
          role: "user",
          content:
            `Resume:\n"""\n${resumeText}\n"""\n\n` +
            `Score this candidate's fit for each of these jobs. Return a score for every job id.\n\n` +
            JSON.stringify(jobsForPrompt, null, 2),
        },
      ],
    });

    const parsed = response.parsed_output;
    if (!parsed) {
      return NextResponse.json({ error: "Couldn't score your resume. Please try again." }, { status: 502 });
    }

    const clamped = parsed.scores.map((score) => ({
      ...score,
      fitScore: Math.max(0, Math.min(100, Math.round(score.fitScore))),
    }));

    return NextResponse.json({ scores: clamped });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Scoring failed. Please try again." }, { status: 502 });
  }
}
