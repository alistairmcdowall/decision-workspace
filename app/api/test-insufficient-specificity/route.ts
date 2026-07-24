import { NextResponse } from "next/server";
import { reframer } from "../../engine/reframer";
import type { DecisionContext } from "../../engine/types";

function buildContext(prompt: string): DecisionContext {
  return {
    prompt,
    decision: { subject: "unclear", kind: "GENERAL" },
    facts: { userStated: { subject: "unclear" }, assumedForSlice: {} },
    panel: {},
  };
}

export async function GET() {
  const [noCandidates, oneCandidate, multipleCandidates] = await Promise.all([
    reframer(buildContext("Which smartphone should I buy?")),
    reframer(buildContext("Should I buy the iPhone 15 Pro?")),
    reframer(buildContext("Should I buy the iPhone 15 Pro, the Galaxy S24 Ultra, or the Pixel 8?")),
  ]);

  return NextResponse.json({
    noCandidatesNamed: noCandidates.reframer,
    oneCandidateNamed: oneCandidate.reframer,
    multipleCandidatesNamed: multipleCandidates.reframer,
  });
}