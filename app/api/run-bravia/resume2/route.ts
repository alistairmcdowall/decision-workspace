import { NextResponse } from "next/server";
import { runBraviaSlicePhase3 } from "../../../engine/runBraviaSlice";
import { buildStructuredReport } from "../../../engine/presentation/structuredReport";
import type { DecisionContext } from "../../../engine/types";

export async function POST(request: Request) {
  const body = await request.json();
  const contextFromPhase2 = body.context as DecisionContext;
  const secondAnswer = body.selectedAnswer as string;

  const finalContext = await runBraviaSlicePhase3(contextFromPhase2, secondAnswer);
  const report = buildStructuredReport(finalContext);

  return NextResponse.json({ status: "complete", report, fullContext: finalContext });
}