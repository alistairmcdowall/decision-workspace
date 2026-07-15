import { runBraviaSlice } from "./runBraviaSlice";
import { runSingaporeSlice } from "./runSingaporeSlice";
import { runPortfolioSlice } from "./runPortfolioSlice";
import { renderReport } from "./renderReport";
import { renderCleanReport } from "./presentation/CleanRenderer";
import { renderGuidedReport } from "./presentation/guidedRenderer";
import { runBraviaNavigatorSlice } from "./runBraviaNavigatorSlice";

const sliceName = process.argv[2] ?? "portfolio";


async function main() {
  const context =
    sliceName === "bravia"
      ? await runBraviaSlice()
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