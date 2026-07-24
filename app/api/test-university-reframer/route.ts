import { NextResponse } from "next/server";
import { reframer } from "../../engine/reframer";
import type { DecisionContext } from "../../engine/types";

const universityContext: DecisionContext = {
  prompt:
    "I've got great A-level results and I'm trying to decide what to do next. I'm torn between studying Economics, Computer Science, or PPE, and I'm not sure whether to stay in the UK (I like the look of Bristol, Durham, or LSE) or go abroad (maybe the US or somewhere in Europe). How should I think about this?",
  decision: { subject: "which degree subject and which university/country to study at", kind: "GENERAL" },
  facts: {
    userStated: { subject: "which degree subject and which university/country to study at" },
    assumedForSlice: {},
  },
  panel: {},
};

export async function GET() {
  const result = await reframer(universityContext);
  return NextResponse.json(result);
}