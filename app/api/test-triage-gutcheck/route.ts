import { NextResponse } from "next/server";
import { triageGutCheck } from "../../engine/triageGutCheck";

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
  const result = await triageGutCheck(
    "Which used luxury sedan should I buy?",
    carCandidates
  );

  return NextResponse.json(result);
}