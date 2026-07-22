import { NextResponse } from "next/server";
import { runBraviaSlicePhase2 } from "../../../engine/runBraviaSlice";
import { buildStructuredReport } from "../../../engine/presentation/structuredReport";
import type { DecisionContext } from "../../../engine/types";

export async function POST(request: Request) {
  const body = await request.json();
  const contextFromPhase1 = body.context as DecisionContext;
  const selectedAnswer = body.selectedAnswer as string;

  const result = await runBraviaSlicePhase2(contextFromPhase1, selectedAnswer);

  if (result.status === "complete") {
    const report = buildStructuredReport(result.context);
    return NextResponse.json({ status: "complete", report, fullContext: result.context });
  }

  return NextResponse.json({
    status: "awaiting_second_answer",
    context: result.context,
    clarifier: result.context.clarifier,
  });
}