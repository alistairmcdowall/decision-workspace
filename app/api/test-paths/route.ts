import { reframer } from "../../engine/reframer";
import { landscape } from "../../engine/landscape";
import { pragmatist } from "../../engine/pragmatist";
import { paths, buildPathsUserPrompt } from "../../engine/paths";
import { tvBudgetTestContext, bedBudgetTestContext } from "../../engine/testFixtures";
import { renderFullChainHtml3 } from "../../engine/panelHtml";
import { saveTestOutput } from "../../engine/testLogger";
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
  const tvTrace = await runChainWithTrace(tvBudgetTestContext);
  const bedTrace = await runChainWithTrace(bedBudgetTestContext);

  const html = renderFullChainHtml3(
    "£3,500 TV budget - RETEST, expect 2 paths now (was wrongly 3)",
    tvTrace,
    "£1,000 bed budget - expect bed-functional items OK, general furniture rejected",
    bedTrace,
    "(unused third slot)",
    tvTrace
  );

  saveTestOutput("tv-budget", {
    prompt: tvBudgetTestContext.prompt,
    reframer: tvTrace.reframer,
    landscape: tvTrace.landscape,
    panel: { pragmatist: tvTrace.pragmatist },
    representativePaths: tvTrace.finalPaths,
  } as DecisionContext);

  saveTestOutput("bed-budget", {
    prompt: bedBudgetTestContext.prompt,
    reframer: bedTrace.reframer,
    landscape: bedTrace.landscape,
    panel: { pragmatist: bedTrace.pragmatist },
    representativePaths: bedTrace.finalPaths,
  } as DecisionContext);

  return new Response(html, { headers: { "content-type": "text/html" } });
}

