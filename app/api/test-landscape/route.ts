import { reframer } from "../../engine/reframer";
import { landscape } from "../../engine/landscape";
import { empathiser } from "../../engine/empathiser";
import { lexusTestContext, lexusEmotionalTestContext } from "../../engine/testFixtures";
import { renderLandscapeEmotionCheckHtml } from "../../engine/panelHtml";
import type { DecisionContext } from "../../engine/types";

export async function GET() {
  // Original test: V1 without emotional signal, then V2 after a clarifier answer.
  const bareContext: DecisionContext = { ...lexusTestContext, landscape: undefined };
  const afterReframer = await reframer(bareContext);
  const afterLandscapeV1 = await landscape(afterReframer);

  const withClarifierAnswer: DecisionContext = {
    ...afterLandscapeV1,
    clarifierResponse: {
      answer:
        "Yes, if the independent inspection comes back clean and the service history checks out, I'd be comfortable buying it.",
      effect: "Mechanical/history verification willingness resolved",
    },
  };
  const afterLandscapeV2 = await landscape(withClarifierAnswer);

  // New test: same decision, but the prompt itself states emotional attachment.
  const emotionalAfterReframer = await reframer(lexusEmotionalTestContext);
  const emotionalAfterLandscape = await landscape(emotionalAfterReframer);

  // New test: real Empathiser, run against the real (disciplined, non-emotional) Landscape V1.
  const withRealEmpathiser = await empathiser(afterLandscapeV1);

  const html = renderLandscapeEmotionCheckHtml(
    lexusTestContext.landscape?.v1,
    afterLandscapeV1.landscape?.v1,
    afterLandscapeV2.landscape?.v2,
    emotionalAfterLandscape.landscape?.v1,
    withRealEmpathiser.panel?.empathiser
  );

  return new Response(html, { headers: { "content-type": "text/html" } });
}