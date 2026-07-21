import { reframer } from "../../engine/reframer";
import { landscape } from "../../engine/landscape";
import { guardian } from "../../engine/guardian";
import { pragmatist } from "../../engine/pragmatist";
import { empathiser } from "../../engine/empathiser";
import { auditor } from "../../engine/auditor";
import { clarifier } from "../../engine/clarifier";
import { clarifierResponse } from "../../engine/clarifierResponse";
import { paths } from "../../engine/paths";
import { establishingShots } from "../../engine/establishingShots";
import { steelman } from "../../engine/steelman";
import type { DecisionContext } from "../../engine/types";

const braviaContext: DecisionContext = {
  prompt: "Should I buy the Sony Bravia 9 II for £2,000?",
  decision: {
    subject: "Sony Bravia 9 II",
    kind: "PURCHASE",
    price: { amount: 2000, currency: "GBP" },
  },
  facts: {
    userStated: { subject: "Sony Bravia 9 II", price: { amount: 2000, currency: "GBP" } },
    assumedForSlice: {},
  },
  panel: {},
};

export async function GET() {
  let context = await reframer(braviaContext);
  context = await landscape(context);

  const [g, p, e] = await Promise.all([
    guardian(context),
    pragmatist(context),
    empathiser(context),
  ]);
  context = { ...context, panel: { ...g.panel, ...p.panel, ...e.panel } };
  context = await auditor(context);
  context = await clarifier(context);

  // Force the OTHER real option - whichever isn't the authorized-retailer one.
  const options = context.clarifier?.answerOptions ?? [];
  const privateSellerOption =
    options.find(
      (o) => !o.toLowerCase().includes("authorized") && !o.toLowerCase().includes("recognized")
    ) ?? options[1];

  context = await clarifierResponse(context, privateSellerOption);
  context = await landscape(context);
  context = await paths(context);
  context = await establishingShots(context);
  context = await steelman(context);

  return new Response(JSON.stringify(context, null, 2), {
    headers: { "content-type": "application/json" },
  });
}