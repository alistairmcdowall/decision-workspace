import { NextResponse } from "next/server";
import { runTriage } from "../../engine/runTriage";

const phoneCandidates = [
  "iPhone 15 Pro",
  "iPhone SE (2022)",
  "Samsung Galaxy S24 Ultra",
  "Samsung Galaxy A54",
  "Google Pixel 8",
  "Google Pixel 8a",
  "Nothing Phone (2)",
];

export async function GET() {
  const result = await runTriage(
    "Which smartphone should I buy?",
    phoneCandidates,
    "More than one appeals equally",
    "United Kingdom"
  );

  return NextResponse.json(result);
}