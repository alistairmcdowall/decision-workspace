import { NextResponse } from "next/server";
import { budgetTolerance } from "../../engine/budgetTolerance";

export async function GET() {
  const result = await budgetTolerance(
    ["Jaguar XJ 3.0 V6", "Lexus LS460"],
    "£2,000"
  );

  return NextResponse.json(result);
}