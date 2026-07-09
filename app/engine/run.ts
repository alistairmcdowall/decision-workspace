import { runSingaporeSlice } from "./runSingaporeSlice";
import { renderReport } from "./renderReport";
import { renderCleanReport } from "./presentation/cleanRenderer";
import { renderGuidedReport } from "./Presentation/guidedRenderer";

const context = runSingaporeSlice();

const OUTPUT_MODE: "json" | "clean" | "guided" = "guided";

console.log(
    OUTPUT_MODE === "json"
      ? renderReport(context)
      : OUTPUT_MODE === "clean"
        ? renderCleanReport(context)
        : renderGuidedReport(context)
  );