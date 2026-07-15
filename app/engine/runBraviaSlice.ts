import { reframer } from "./reframer";
import { landscape } from "./landscape";
import { guardian } from "./guardian";
import { pragmatist } from "./pragmatist";
import { empathiser } from "./empathiser";
import { auditor } from "./auditor";
import { paths } from "./paths";
import { eventHorizons } from "./eventHorizons";
import { establishingShots } from "./establishingShots";
import { steelman } from "./steelman";
import { clarifier } from "./clarifier";
import type { DecisionContext } from "./types";

export async function runBraviaSlice(): Promise<DecisionContext> {
  let context: DecisionContext = {
    prompt: "Should I buy the Sony Bravia 9 II for £2,000?",
    decision: {
      subject: "Sony Bravia 9 II",
      kind: "PURCHASE",
      commitment: "Buy the television if seller, condition, warranty and payment route verify cleanly.",
      price: {
        amount: 2000,
        currency: "GBP",
      },
    },
    facts: {
      userStated: {
        subject: "Sony Bravia 9 II",
        price: {
          amount: 2000,
          currency: "GBP",
        },
      },
      assumedForSlice: {
        marketClass: "premium_flagship",
        pricePosition: "materially_below_expected_market",
      },
    },
    panel: {},

    presentation: {
      decisionStateSummary:
        "The first question is no longer whether the offer is interesting. The model treats it as attractive if verified.",
      decisionTurn:
        "So the decision now turns on verification.",
    },
  };

context = await reframer(context);
context = await landscape(context);

context = await guardian(context);
context = await pragmatist(context);
context = await empathiser(context);
context = await auditor(context);

context = clarifier(context);

context = {
  ...context,
  clarifierResponse: {
    answer:
      "Yes. If the offer is genuine, fully warranted and free from hidden condition issues, I would feel comfortable buying it.",
  
    effect:
      "Purchase willingness resolved",
  },
};

context = await landscape(context);
context = paths(context);
context = eventHorizons(context);
context = establishingShots(context);
context = steelman(context);

return context;
}