// app/engine/runCustomPurchaseSlice.ts

import type { DecisionContext } from "./types";
import { eventHorizons } from "./eventHorizons";

function extractPrice(input: string): number | undefined {
  const match = input.match(/£\s?([\d,]+)/);

  if (!match) {
    return undefined;
  }

  return Number(match[1].replace(/,/g, ""));
}

function extractSubject(input: string): string {
  const cleaned = input
    .replace(/^should i buy\s+/i, "")
    .replace(/\s+for\s+£\s?[\d,]+.*$/i, "")
    .replace(/\?+$/g, "")
    .trim();

  return cleaned || "this purchase";
}

export function runCustomPurchaseSlice(input: string): DecisionContext {
  const subject = extractSubject(input);
  const price = extractPrice(input);

  let context: DecisionContext = {
    prompt: input,

    decision: {
      subject,
      kind: "PURCHASE",
      commitment: `Buy ${subject} if the offer, condition, seller, and payment route verify cleanly.`,
      price: price
        ? {
            amount: price,
            currency: "GBP",
          }
        : undefined,
    },

    facts: {
      userStated: {
        subject,
        price: price
          ? {
              amount: price,
              currency: "GBP",
            }
          : undefined,
      },
      assumedForSlice: {
        source: "custom_purchase_input",
      },
    },

    panel: {},

    presentation: {
      decisionStateSummary:
        "This is a first-pass purchase decision created from the user’s input.",
      decisionTurn:
        "So the decision now turns on whether the purchase survives basic verification.",
    },

    landscape: {
      v2: {
        subject,
        resolvedUncertainties: price
          ? [`Approximate price identified: £${price.toLocaleString("en-GB")}`]
          : [],
        remainingUncertainties: [
          "Seller legitimacy",
          "Condition",
          "Warranty or return route",
          "Whether the price is attractive relative to realistic alternatives",
        ],
      },
    },

    representativePaths: [
      {
        id: "A",
        title: `Buy ${subject}`,
      },
      {
        id: "B",
        title: `Do not buy ${subject}`,
      },
    ],

    establishingShots: [
      {
        pathId: "A",
        title: "The purchase becomes ordinary",
        shot:
          "You are using the thing you bought on an ordinary day. The payment has already happened, the initial excitement has faded, and what remains is whether the purchase genuinely fits your life.",
      },
      {
        pathId: "B",
        title: "The money remains available",
        shot:
          "The purchase did not happen. Nothing new has arrived, nothing needs resolving, and the money remains available for other priorities or a better-verified opportunity.",
      },
    ],

    steelman: [
      {
        pathId: "A",
        objective: "Capture a worthwhile opportunity",
        case:
          "The strongest case for buying is that the item may represent good value if the seller is legitimate, the condition is clean, the price is fair, and the downside is limited by warranty, inspection, or buyer protection.",
        supportingConditions: [
          "Seller legitimacy can be confirmed",
          "Condition is satisfactory",
          "Price compares well with realistic alternatives",
          "Payment or return route gives reasonable protection",
        ],
      },
      {
        pathId: "B",
        objective: "Preserve flexibility",
        case:
          "The strongest case for not buying is that an attractive purchase can become a bad decision if verification is weak. Keeping the money preserves flexibility and avoids being forced into solving problems after payment.",
        supportingConditions: [
          "Verification remains incomplete",
          "Condition or history is uncertain",
          "Price advantage is unclear",
          "Money may be better used elsewhere",
        ],
      },
    ],
  };

  context = eventHorizons(context);

  return context;
}