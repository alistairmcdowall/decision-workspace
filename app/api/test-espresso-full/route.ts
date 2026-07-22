import { NextResponse } from "next/server";
import { runBraviaSlicePhase1, runBraviaSlicePhase2, runBraviaSlicePhase3 } from "../../engine/runBraviaSlice";
import { espressoMachineDecisionContext } from "../../engine/testFixtures";

export async function GET() {
  const phase1Context = await runBraviaSlicePhase1(espressoMachineDecisionContext);

  const phase2Result = await runBraviaSlicePhase2(phase1Context, "Ease of use / forgiving technique");

  if (phase2Result.status === "complete") {
    return NextResponse.json({ status: "complete", note: "Finished after round 1", fullContext: phase2Result.context });
  }

  const finalContext = await runBraviaSlicePhase3(phase2Result.context, "Control/pour feel");

  return NextResponse.json({ status: "complete", fullContext: finalContext });
}