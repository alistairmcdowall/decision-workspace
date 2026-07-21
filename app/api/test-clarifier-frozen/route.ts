import { clarifier } from "../../engine/clarifier";
import { cofounderFrozenClarifierTestContext } from "../../engine/testFixtures";

export async function GET() {
  const results = await Promise.all(
    Array.from({ length: 5 }, () => clarifier(cofounderFrozenClarifierTestContext))
  );

  return new Response(
    JSON.stringify(
      results.map((r) => r.clarifier),
      null,
      2
    ),
    { headers: { "content-type": "application/json" } }
  );
}