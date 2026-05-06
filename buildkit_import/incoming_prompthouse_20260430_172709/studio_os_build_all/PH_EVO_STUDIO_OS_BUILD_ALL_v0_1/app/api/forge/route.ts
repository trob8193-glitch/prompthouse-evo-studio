import { NextResponse } from "next/server";
import { SAMPLE_MISSION } from "@/lib/studio/constants";
import { compileAppSpec, compilePromptSpec, createQAReport, createReviewPacket, createVibeSpec } from "@/lib/studio/pipeline";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const rawIdea = body.rawIdea ?? SAMPLE_MISSION.userIntent;

  const vibe = createVibeSpec(SAMPLE_MISSION, rawIdea);
  const prompt = compilePromptSpec(SAMPLE_MISSION, vibe);
  const app = compileAppSpec(SAMPLE_MISSION, vibe, prompt);
  const qa = createQAReport(SAMPLE_MISSION);
  const review = createReviewPacket(SAMPLE_MISSION);

  return NextResponse.json({ mission: SAMPLE_MISSION, vibe, prompt, app, qa, review });
}
