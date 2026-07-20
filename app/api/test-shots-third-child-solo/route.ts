import { reframer } from "../../engine/reframer";
import { landscape } from "../../engine/landscape";
import { guardian } from "../../engine/guardian";
import { pragmatist } from "../../engine/pragmatist";
import { empathiser } from "../../engine/empathiser";
import { auditor } from "../../engine/auditor";
import { paths } from "../../engine/paths";
import { establishingShots } from "../../engine/establishingShots";
import { thirdChildSoloFramingTestContext } from "../../engine/testFixtures";
import { renderPathsAndShotsHtml } from "../../engine/panelHtml";
import { saveTestOutput } from "../../engine/testLogger";

export async function GET() {
  let context = await reframer(thirdChildSoloFramingTestContext);
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

  saveTestOutput("third-child-solo", context);

  const baseHtml = renderPathsAndShotsHtml(
    context.reframer,
    context.representativePaths,
    context.establishingShots
  );

  const auditorHtml = `
    <div style="border:2px solid #f59e0b;border-radius:12px;padding:16px 18px;margin:20px 0;background:#fff;max-width:760px;margin-left:auto;margin-right:auto;">
      <div style="font-weight:700;color:#0f172a;margin-bottom:10px;">Auditor - full output</div>
      <pre style="white-space:pre-wrap;background:#f1f5f9;border-radius:8px;padding:10px 12px;font-size:12px;color:#334155;">${JSON.stringify(context.auditor, null, 2)}</pre>
      <div style="font-weight:700;color:#0f172a;margin:16px 0 10px 0;">Landscape - full output</div>
      <pre style="white-space:pre-wrap;background:#f1f5f9;border-radius:8px;padding:10px 12px;font-size:12px;color:#334155;">${JSON.stringify(context.landscape, null, 2)}</pre>
    </div>
  `;

  const html = baseHtml.replace("</body>", `${auditorHtml}</body>`);

  return new Response(html, { headers: { "content-type": "text/html" } });
}