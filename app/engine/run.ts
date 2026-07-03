import { runBraviaSlice } from "./runBraviaSlice";
import { renderReport } from "./renderReport";

const context = runBraviaSlice();

const report = renderReport(context);

console.log(report);