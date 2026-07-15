import { guardian } from "../../engine/guardian";
import { pragmatist } from "../../engine/pragmatist";
import { empathiser } from "../../engine/empathiser";
import { auditor } from "../../engine/auditor";
import { sisterTestContext } from "../../engine/testFixtures";
import { renderPanelHtml } from "../../engine/panelHtml";

export async function GET() {
  let context = sisterTestContext;
  context = await guardian(context);
  context = await pragmatist(context);
  context = await empathiser(context);
  context = await auditor(context);

  const html = renderPanelHtml(context, "Sister / Best Friend decision");
  return new Response(html, { headers: { "content-type": "text/html" } });
}