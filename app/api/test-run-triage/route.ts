import { NextResponse } from "next/server";
import { runTriage } from "../../engine/runTriage";

const carCandidates = [
  "Lexus GS450 (2013-2015)",
  "Jaguar XJ 3.0 V6 (2013-2015)",
  "Infiniti Q70",
  "Toyota Century",
  "Honda Legend",
  "Toyota Crown Majesta",
  "Lexus LS460",
];

export async function GET() {
  const specificLeanResult = await runTriage(
    "Which used luxury sedan should I buy?",
    carCandidates,
    "Jaguar XJ 3.0 V6 (2013-2015)",
    "United Kingdom"
  );

  const catchAllResult = await runTriage(
    "Which used luxury sedan should I buy?",
    carCandidates,
    "More than one appeals equally",
    "United Kingdom"
  );

  return NextResponse.json({ specificLeanResult, catchAllResult });
}