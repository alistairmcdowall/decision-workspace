import { NextResponse } from "next/server";
import { guardian } from "../../engine/guardian";
import { pragmatist } from "../../engine/pragmatist";
import { empathiser } from "../../engine/empathiser";
import { reframer } from "../../engine/reframer";
import { landscape } from "../../engine/landscape";
import type { DecisionContext } from "../../engine/types";

const jagAloneContext: DecisionContext = {
  prompt: "Should I buy a used Jaguar XJ 3.0 V6 (2013-2015)?",
  decision: { subject: "used Jaguar XJ 3.0 V6 (2013-2015)", kind: "PURCHASE" },
  facts: { userStated: { subject: "used Jaguar XJ 3.0 V6 (2013-2015)" }, assumedForSlice: {} },
  panel: {},
};

const lexusAloneContext: DecisionContext = {
  prompt: "Should I buy a used Lexus GS450 (2013-2015)?",
  decision: { subject: "used Lexus GS450 (2013-2015)", kind: "PURCHASE" },
  facts: { userStated: { subject: "used Lexus GS450 (2013-2015)" }, assumedForSlice: {} },
  panel: {},
};

async function runAlone(context: DecisionContext) {
  let c = await reframer(context);
  c = await landscape(c);

  const [g, p, e] = await Promise.all([guardian(c), pragmatist(c), empathiser(c)]);

  return { guardian: g.panel?.guardian, pragmatist: p.panel?.pragmatist, empathiser: e.panel?.empathiser };
}

export async function GET() {
  const [jagResult, lexusResult] = await Promise.all([
    runAlone(jagAloneContext),
    runAlone(lexusAloneContext),
  ]);

  return NextResponse.json({ jagAlone: jagResult, lexusAlone: lexusResult });
}