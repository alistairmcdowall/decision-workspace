import { clarifier } from "../../engine/clarifier";
import { clarifierResponse } from "../../engine/clarifierResponse";
import { cofounderFrozenClarifierTestContext } from "../../engine/testFixtures";

export async function GET() {
  const afterClarifier = await clarifier(cofounderFrozenClarifierTestContext);
  const options = afterClarifier.clarifier?.answerOptions ?? [];

  const firstOption = options[0] ?? "Yes";
  const secondOption = options[1] ?? "No";
  const notSureOption = options.find((o) => o.toLowerCase().includes("not sure")) ?? options[2] ?? "Not sure";

  const responseToFirst = await clarifierResponse(afterClarifier, firstOption);
  const responseToSecond = await clarifierResponse(afterClarifier, secondOption);
  const responseToNotSure = await clarifierResponse(afterClarifier, notSureOption);
  const noSelection = await clarifierResponse(afterClarifier, null);

  return new Response(
    JSON.stringify(
      {
        clarifierQuestion: afterClarifier.clarifier,
        responseToFirstOption: responseToFirst.clarifierResponse,
        responseToSecondOption: responseToSecond.clarifierResponse,
        responseToNotSure: responseToNotSure.clarifierResponse,
        noSelectionMade: noSelection.clarifierResponse,
      },
      null,
      2
    ),
    { headers: { "content-type": "application/json" } }
  );
}