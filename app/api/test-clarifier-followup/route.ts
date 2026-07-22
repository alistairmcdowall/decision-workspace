import { clarifier } from "../../engine/clarifier";
import { clarifierResponse } from "../../engine/clarifierResponse";
import { braviaRetailerFrozenContext } from "../../engine/testFixtures";

export async function GET() {
  // Round 1: ask the first question (already baked into the frozen fixture).
  const firstQuestion = braviaRetailerFrozenContext.clarifier;

  // Simulate answering it, then check whether a genuine round-2 question exists.
  let context = await clarifierResponse(braviaRetailerFrozenContext, "Authorized retailer");
  const roundTwoResult = await clarifier(context, true);

  return new Response(
    JSON.stringify(
      {
        roundOneQuestion: firstQuestion,
        roundTwoResult: roundTwoResult.clarifier,
      },
      null,
      2
    ),
    { headers: { "content-type": "application/json" } }
  );
}