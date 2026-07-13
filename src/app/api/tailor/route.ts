import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { jobs } from "@/lib/jobs";

export const runtime = "nodejs";

const MAX_RESUME_CHARS = 15000;

const TailorResponseSchema = z.object({
  tailoredResume: z.string(),
  coverLetter: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    return await handleTailorRequest(request);
  } catch (err) {
    console.error("Unhandled error in /api/tailor:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

async function handleTailorRequest(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { resumeText, jobId } = (body ?? {}) as { resumeText?: unknown; jobId?: unknown };

  if (typeof resumeText !== "string" || resumeText.trim().length < 30) {
    return NextResponse.json({ error: "Upload or paste your resume first." }, { status: 400 });
  }
  if (typeof jobId !== "string") {
    return NextResponse.json({ error: "Missing job id." }, { status: 400 });
  }

  const job = jobs.find((j) => j.id === jobId);
  if (!job) {
    return NextResponse.json({ error: "Job not found." }, { status: 404 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "Server is missing an ANTHROPIC_API_KEY." },
      { status: 500 }
    );
  }

  const trimmedResume = resumeText.trim().slice(0, MAX_RESUME_CHARS);
  const client = new Anthropic();

  const response = await client.messages.parse({
    model: "claude-opus-4-8",
    max_tokens: 6000,
    output_config: {
      format: zodOutputFormat(TailorResponseSchema),
      effort: "medium",
    },
    system:
      "You write tailored job application materials. Given a candidate's resume and a specific job posting, " +
      "produce (1) a tailored version of their resume, reorganized and reworded to emphasize the experience most " +
      "relevant to this job, and (2) a short, specific cover letter. " +
      "Rules: Never invent employers, titles, skills, metrics, or years of experience that are not present in the " +
      "original resume. You may reorder, re-emphasize, and rephrase real content, and describe it using terms " +
      "closer to the job posting's language where that's an honest match. Do not fabricate anything. " +
      "Format the tailored resume as plain text with clear section headers and \"- \" bullet points, no markdown " +
      "asterisks or headers. Keep the cover letter under 300 words, 3-4 short paragraphs, addressed to \"Dear " +
      "Hiring Team\" (no recipient name is available), and reference the company and role by name.",
    messages: [
      {
        role: "user",
        content:
          `Candidate's resume:\n"""\n${trimmedResume}\n"""\n\n` +
          `Job to tailor for:\n${JSON.stringify(
            {
              title: job.title,
              company: job.company,
              location: job.location,
              description: job.description,
            },
            null,
            2
          )}`,
      },
    ],
  });

  const parsed = response.parsed_output;
  if (!parsed) {
    return NextResponse.json(
      { error: "Couldn't generate tailored materials. Please try again." },
      { status: 502 }
    );
  }

  return NextResponse.json(parsed);
}
