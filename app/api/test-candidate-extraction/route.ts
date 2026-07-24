import { NextResponse } from "next/server";
import { reframer } from "../../engine/reframer";
import type { DecisionContext } from "../../engine/types";

function buildContext(prompt: string): DecisionContext {
  return {
    prompt,
    decision: { subject: "unclear", kind: "GENERAL" },
    facts: { userStated: { subject: "unclear" }, assumedForSlice: {} },
    panel: {},
  };
}

export async function GET() {
  const [carsResult, leverResult] = await Promise.all([
    reframer(
      buildContext(
        "Which used luxury sedan should I buy: Lexus GS450, Jaguar XJ 3.0 V6, Infiniti Q70, Toyota Century, Honda Legend, Toyota Crown Majesta, Lexus LS460?"
      )
    ),
    reframer(
      buildContext(
        "I've got a Sage DTP but I want a lever machine and I can't decide between the Londinium Vectis, the Bezzera Strega and the Quick Mill Rapida - which one should I buy?"
      )
    ),
  ]);

  return NextResponse.json({
    carsResult: carsResult.reframer,
    leverResult: leverResult.reframer,
  });
}