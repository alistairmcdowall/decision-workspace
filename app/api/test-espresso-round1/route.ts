import { NextResponse } from "next/server";
import { runBraviaSlicePhase1, runBraviaSlicePhase2 } from "../../engine/runBraviaSlice";
import { espressoMachineDecisionContext } from "../../engine/testFixtures";

export async function GET() {
  const phase1Context = await runBraviaSlicePhase1(espressoMachineDecisionContext);

  const result = await runBraviaSlicePhase2(phase1Context, "Ease of use / forgiving technique");

  if (result.status === "complete") {
    return NextResponse.json({ status: "complete", fullContext: result.context });
  }

  return NextResponse.json({
    status: "awaiting_second_answer",
    clarifier: result.context.clarifier,
    fullContext: result.context,
  });
}