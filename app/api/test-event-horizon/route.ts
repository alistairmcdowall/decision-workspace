import { eventHorizons } from "../../engine/eventHorizons";
import {
  braviaRetailerFrozenContext,
  braviaPrivateSellerFrozenContext,
} from "../../engine/testFixtures";

export async function GET() {
  const retailerResult = await eventHorizons(braviaRetailerFrozenContext);
  const privateSellerResult = await eventHorizons(braviaPrivateSellerFrozenContext);

  return new Response(
    JSON.stringify(
      {
        retailerBranch: retailerResult.eventHorizon,
        privateSellerBranch: privateSellerResult.eventHorizon,
      },
      null,
      2
    ),
    { headers: { "content-type": "application/json" } }
  );
}