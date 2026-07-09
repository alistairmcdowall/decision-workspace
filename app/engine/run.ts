import { runBraviaSlice } from "./runBraviaSlice";
import { runSingaporeSlice } from "./runSingaporeSlice";
import { runPortfolioSlice } from "./runPortfolioSlice";
import { renderReport } from "./renderReport";
import { renderCleanReport } from "./presentation/cleanRenderer";
import { renderGuidedReport } from "./presentation/guidedRenderer";
import { runBraviaNavigatorSlice } from "./runBraviaNavigatorSlice";

const sliceName = process.argv[2] ?? "portfolio";

const context =
  sliceName === "bravia"
    ? runBraviaSlice()
    : sliceName === "bravia-navigator"
      ? runBraviaNavigatorSlice()
      : sliceName === "singapore"
        ? runSingaporeSlice()
        : sliceName === "portfolio"
          ? runPortfolioSlice()
          : null;

if (!context) {
  console.error(`Unknown slice: ${sliceName}`);
  console.error(`Use one of: bravia,bravia-nagivator,singapore, portfolio`);
  process.exit(1);
}

const OUTPUT_MODE: "json" | "clean" | "guided" = "guided";

console.log(
  OUTPUT_MODE === "json"
    ? renderReport(context)
    : OUTPUT_MODE === "clean"
      ? renderCleanReport(context)
      : renderGuidedReport(context)
);