import { empathiser } from "../../engine/empathiser";
import { broadbandTestContext, broadbandWithClarifierContext } from "../../engine/testFixtures";
import { renderEmpathiserComparisonHtml } from "../../engine/panelHtml";

export async function GET() {
  const bare = await empathiser(broadbandTestContext);
  const withClarifier = await empathiser(broadbandWithClarifierContext);

  const html = renderEmpathiserComparisonHtml(
    bare.panel?.empathiser,
    withClarifier.panel?.empathiser
  );

  return new Response(html, { headers: { "content-type": "text/html" } });
}