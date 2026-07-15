import { NextResponse } from "next/server";
import { runBraviaNavigatorSlice } from "../../engine/runBraviaNavigatorSlice";
import { buildStructuredReport } from "../../engine/presentation/structuredReport";

export async function GET() {
  const context = await runBraviaNavigatorSlice();
  const report = buildStructuredReport(context);
  return NextResponse.json(report);
}