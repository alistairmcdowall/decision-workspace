import { reframer } from "../../engine/reframer";
import { landscape } from "../../engine/landscape";
import { pragmatist } from "../../engine/pragmatist";
import { paths, buildPathsUserPrompt } from "../../engine/paths";
import { lexusTestContext, bravia3500TestContext, tvBudgetTestContext } from "../../engine/testFixtures";
import { renderFullChainHtml3 } from "../../engine/panelHtml";
import type { DecisionContext } from "../../engine/types";

async function runChainWithTrace(context: DecisionContext) {
  const afterReframer = await reframer(context);
  const afterLandscape = await landscape(afterReframer);
  const afterPragmatist = await pragmatist(afterLandscape);
  const exactPathsPrompt = buildPathsUserPrompt(afterPragmatist);
  const afterPaths = await paths(afterPragmatist);

  return {
    reframer: afterReframer.reframer,
    landscape: afterLandscape.landscape,
    pragmatist: afterPragmatist.panel?.pragmatist,
    exactPathsUserPrompt: exactPathsPrompt,
    finalPaths: afterPaths.representativePaths,
  };
}

export async function GET() {
  const lexusBare: DecisionContext = { ...lexusTestContext, landscape: undefined };
  const lexusTrace = await runChainWithTrace(lexusBare);
  const braviaTrace = await runChainWithTrace(bravia3500TestContext);
  const tvBudgetTrace = await runChainWithTrace(tvBudgetTestContext);

  const html = renderFullChainHtml3(
    "Lexus GS (specific item) - expect 2",
    lexusTrace,
    "Bravia 9 II at £3,500 (specific item) - expect 2",
    braviaTrace,
    "£3,500 TV budget (unresolved quantity) - expect up to 3",
    tvBudgetTrace
  );

  return new Response(html, { headers: { "content-type": "text/html" } });
}

