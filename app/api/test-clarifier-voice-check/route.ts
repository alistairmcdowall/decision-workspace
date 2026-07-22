import { reframer } from "../../engine/reframer";
import { landscape } from "../../engine/landscape";
import { guardian } from "../../engine/guardian";
import { pragmatist } from "../../engine/pragmatist";
import { empathiser } from "../../engine/empathiser";
import { auditor } from "../../engine/auditor";
import { clarifier } from "../../engine/clarifier";
import { thirdChildSoloFramingTestContext } from "../../engine/testFixtures";

export async function GET() {
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

  return new Response(
    JSON.stringify(
      {
        reframer: context.reframer,
        landscape: context.landscape,
        guardian: context.panel?.guardian,
        pragmatist: context.panel?.pragmatist,
        empathiser: context.panel?.empathiser,
        auditor: context.auditor,
        clarifier: context.clarifier,
      },
      null,
      2
    ),
    { headers: { "content-type": "application/json" } }
  );
}