import { reframer } from "../../engine/reframer";
import { messyRelationshipTestContext } from "../../engine/testFixtures";

export async function GET() {
  const result = await reframer(messyRelationshipTestContext);
  return new Response(JSON.stringify(result.reframer, null, 2), {
    headers: { "content-type": "application/json" },
  });
}