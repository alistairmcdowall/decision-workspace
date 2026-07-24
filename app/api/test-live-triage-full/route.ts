import { NextResponse } from "next/server";
import { reframer } from "../../engine/reframer";
import { landscape } from "../../engine/landscape";
import { guardian } from "../../engine/guardian";
import { pragmatist } from "../../engine/pragmatist";
import { empathiser } from "../../engine/empathiser";
import { auditor } from "../../engine/auditor";
import { paths } from "../../engine/paths";
import { eventHorizons } from "../../engine/eventHorizons";
import { establishingShots } from "../../engine/establishingShots";
import { steelman } from "../../engine/steelman";
import { runTriage } from "../../engine/runTriage";
import type { DecisionContext } from "../../engine/types";

const carCandidates = [
  "Lexus GS450",
  "Jaguar XJ 3.0 V6",
  "Infiniti Q70",
  "Toyota Century",
  "Honda Legend",
  "Toyota Crown Majesta",
  "Lexus LS460",
];

const originalPrompt = "Which used luxury sedan should I buy: " + carCandidates.join(", ") + "?";

export async function GET() {
  const initialReframe = await reframer({
    prompt: originalPrompt,
    decision: { subject: "which used luxury sedan to buy", kind: "PURCHASE" },
    facts: { userStated: { subject: "which used luxury sedan to buy" }, assumedForSlice: {} },
    panel: {},
  });

// declineIsViableOption tells us whether the prompt's own framing leaves
  // room to decline the underlying category entirely (e.g. "should I buy a
  // TV at all"). It does NOT mean a forced decline slot should always be
  // built - when the underlying want is already fixed by the prompt (e.g.
  // "which car should I buy"), declining specific finalists is not a real,
  // terminal path, it's just an unbounded continuation of the same search.
  // Always target the same number of NAMED finalists (2) regardless -
  // whether decline appears as an actual path is left entirely to Auditor
  // and Paths to determine honestly, not forced by the reconstruction step.
  const targetCount = 2;

  const triageResult = await runTriage(
    originalPrompt,
    carCandidates,
    "More than one appeals equally",
    "United Kingdom",
    targetCount
  );

  const finalists = triageResult.finalCandidates;
  const reconstructedPrompt = `Should I buy the ${finalists.join(" or the ")}?`;

  let context: DecisionContext = {
    prompt: reconstructedPrompt,
    decision: { subject: finalists.join(" vs "), kind: "PURCHASE" },
    facts: { userStated: { subject: finalists.join(" vs ") }, assumedForSlice: {} },
    panel: {},
  };

  context = await reframer(context);
  context = await landscape(context);

  const [g, p, e] = await Promise.all([guardian(context), pragmatist(context), empathiser(context)]);
  context = { ...context, panel: { ...g.panel, ...p.panel, ...e.panel } };

  context = await auditor(context);
  context = await paths(context);
  context = await eventHorizons(context);

  const [shots, steel] = await Promise.all([establishingShots(context), steelman(context)]);
  context = { ...context, establishingShots: shots.establishingShots, steelman: steel.steelman };

  return NextResponse.json({
    initialReframe: initialReframe.reframer,
    triageMethod: triageResult.method,
    triageHistory: triageResult.eliminationHistory,
    reconstructedPrompt,
    finalReframer: context.reframer,
    representativePaths: context.representativePaths,
  });
}