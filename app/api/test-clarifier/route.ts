import { reframer } from "../../engine/reframer";
import { landscape } from "../../engine/landscape";
import { guardian } from "../../engine/guardian";
import { pragmatist } from "../../engine/pragmatist";
import { empathiser } from "../../engine/empathiser";
import { auditor } from "../../engine/auditor";
import { clarifier } from "../../engine/clarifier";
import {
  lexusTestContext,
  thirdChildSoloFramingTestContext,
  cofounderBuyoutTestContext,
} from "../../engine/testFixtures";
import type { DecisionContext } from "../../engine/types";

async function runToClarifier(context: DecisionContext) {
    let c: DecisionContext = { ...context, landscape: undefined };
  c = await reframer(c);
  c = await landscape(c);

  const [guardianResult, pragmatistResult, empathiserResult] = await Promise.all([
    guardian(c),
    pragmatist(c),
    empathiser(c),
  ]);

  c = {
    ...c,
    panel: {
      ...guardianResult.panel,
      ...pragmatistResult.panel,
      ...empathiserResult.panel,
    },
  };

  c = await auditor(c);
  c = await clarifier(c);

  return {
    prompt: c.prompt,
    auditorBlocking: c.auditor?.blockingUncertainties,
    clarifier: c.clarifier,
  };
}

export async function GET() {
  const results = await Promise.all([
    runToClarifier(lexusTestContext),
    runToClarifier(thirdChildSoloFramingTestContext),
    runToClarifier(cofounderBuyoutTestContext),
  ]);

  return new Response(JSON.stringify(results, null, 2), {
    headers: { "content-type": "application/json" },
  });
}