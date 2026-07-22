import { runBraviaNavigatorSlice } from "./runBraviaNavigatorSlice";
import { runSingaporeSlice } from "./runSingaporeSlice";
import { runPortfolioSlice } from "./runPortfolioSlice";
import { renderReport } from "./renderReport";
import { renderCleanReport } from "./presentation/CleanRenderer";
import { renderGuidedReport } from "./presentation/guidedRenderer";
import { runBraviaSlicePhase1, runBraviaSlicePhase2, runBraviaSlicePhase3 } from "./runBraviaSlice";

const sliceName = process.argv[2] ?? "portfolio";


async function main() {
  const context =
  sliceName === "bravia"
  ? await (async () => {
    const phase1 = await runBraviaSlicePhase1();
    const options1 = phase1.clarifier?.answerOptions ?? [];
    const placeholder1 =
      options1.find((o) => !o.toLowerCase().includes("not sure")) ?? options1[0] ?? "";

    const phase2Result = await runBraviaSlicePhase2(phase1, placeholder1);

    if (phase2Result.status === "complete") {
      return phase2Result.context;
    }

    const options2 = phase2Result.context.clarifier?.answerOptions ?? [];
    const placeholder2 =
      options2.find((o) => !o.toLowerCase().includes("not sure")) ?? options2[0] ?? "";

    return runBraviaSlicePhase3(phase2Result.context, placeholder2);
  })()
    : sliceName === "bravia-navigator"
        ? await runBraviaNavigatorSlice()
        : sliceName === "singapore"
          ? runSingaporeSlice()
          : sliceName === "portfolio"
            ? runPortfolioSlice()
            : null;

  if (!context) {
    console.error(`Unknown slice: ${sliceName}`);
    console.error(`Use one of: bravia,bravia-nagivator,singapore, portfolio`);
    process.exit(1);
    return;
  }

  const OUTPUT_MODE = (process.argv[3] ?? "guided") as "json" | "clean" | "guided";

  console.log(
    OUTPUT_MODE === "json"
      ? renderReport(context)
      : OUTPUT_MODE === "clean"
        ? renderCleanReport(context)
        : renderGuidedReport(context)
  );
}

main();