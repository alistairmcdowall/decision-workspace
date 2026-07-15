import { NextResponse } from "next/server";
import { runBraviaSlice } from "../../engine/runBraviaSlice";
import { buildStructuredReport } from "../../engine/presentation/structuredReport";

export async function GET() {
  const context = await runBraviaSlice();
  const report = buildStructuredReport(context);
  return NextResponse.json(report);
}