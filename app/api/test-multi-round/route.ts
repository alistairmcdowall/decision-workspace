import { reframer } from "../../engine/reframer";
import { landscape } from "../../engine/landscape";
import { guardian } from "../../engine/guardian";
import { pragmatist } from "../../engine/pragmatist";
import { empathiser } from "../../engine/empathiser";
import { auditor } from "../../engine/auditor";
import { clarifier } from "../../engine/clarifier";
import { clarifierResponse } from "../../engine/clarifierResponse";
import { thirdChildSoloFramingTestContext } from "../../engine/testFixtures";

export async function GET() {
  // Full real chain, round 1.
  let context = await reframer(thirdChildSoloFramingTestContext);
  context = await landscape(context);

  const [g, p, e] = await Promise.all([
    guardian(context),
    pragmatist(context),
    empathiser(context),
  ]);
  context = { ...context, panel: { ...g.panel, ...p.panel, ...e.panel } };
  context = await auditor(context);
  context = await clarifier(context);

  const roundOneQuestion = context.clarifier;

  // Pick the actual generated option that means "no" - not a hand-typed guess.
  const selectedOption =
    roundOneQuestion?.answerOptions?.find((o) =>
      o.toLowerCase().includes("don't think i really want this")
    ) ?? roundOneQuestion?.answerOptions?.[1];

  context = await clarifierResponse(context, selectedOption ?? "");

  // Genuine re-run: Landscape narrows, then the WHOLE panel + Auditor re-run
  // against the updated state, before Clarifier gets a second real look.
  context = await landscape(context);

  const [g2, p2, e2] = await Promise.all([
    guardian(context),
    pragmatist(context),
    empathiser(context),
  ]);
  context = { ...context, panel: { ...g2.panel, ...p2.panel, ...e2.panel } };
  context = await auditor(context);

  const roundTwoResult = await clarifier(context, true);

  return new Response(
    JSON.stringify(
        {
          roundOneQuestion,
          selectedAnswerActuallyUsed: selectedOption,
          landscapeAfterAnswer: context.landscape?.v2,
        guardianAfterAnswer: context.panel?.guardian,
        pragmatistAfterAnswer: context.panel?.pragmatist,
        empathiserAfterAnswer: context.panel?.empathiser,
        auditorAfterAnswer: context.auditor,
        roundTwoResult,
      },
      null,
      2
    ),
    { headers: { "content-type": "application/json" } }
  );
}