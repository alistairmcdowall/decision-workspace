import { reframer } from "../../engine/reframer";
import { landscape } from "../../engine/landscape";
import { guardian } from "../../engine/guardian";
import { pragmatist } from "../../engine/pragmatist";
import { empathiser } from "../../engine/empathiser";
import { auditor } from "../../engine/auditor";
import { paths } from "../../engine/paths";
import { establishingShots } from "../../engine/establishingShots";
import { redundancyTestContext } from "../../engine/testFixtures";
import { renderPathsAndShotsHtml } from "../../engine/panelHtml";
import { saveTestOutput } from "../../engine/testLogger";

export async function GET() {
  let context = await reframer(redundancyTestContext);
  context = await landscape(context);

  const [guardianResult, pragmatistResult, empathiserResult] = await Promise.all([
    guardian(context),
    pragmatist(context),
    empathiser(context),
  ]);

  context = {
    ...context,
    panel: {
      ...guardianResult.panel,
      ...pragmatistResult.panel,
      ...empathiserResult.panel,
    },
  };

  context = await auditor(context);
  context = await paths(context);
  context = await establishingShots(context);

  saveTestOutput("redundancy", context);

  const html = renderPathsAndShotsHtml(
    context.reframer,
    context.representativePaths,
    context.establishingShots
  );

  return new Response(html, { headers: { "content-type": "text/html" } });
}