import { NextResponse } from "next/server";
import { runBraviaSlicePhase1 } from "../../engine/runBraviaSlice";
import { espressoMachineDecisionContext } from "../../engine/testFixtures";

export async function GET() {
  const context = await runBraviaSlicePhase1(espressoMachineDecisionContext);
  return NextResponse.json({ context, clarifier: context.clarifier });
}