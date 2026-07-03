import type { DecisionContext } from "./types";

export function paths(context: DecisionContext): DecisionContext {
  return {
    ...context,

    representativePaths: [
      {
        id: "A",
        title: "Purchase",
        requiredConditions: [
          "offer_verified",
          "warranty_satisfactory",
          "condition_satisfactory",
        ],
        commitment: {
          type: "capital_outflow",
          amount: 2000,
          currency: "GBP",
        },
        outcome: "ownership_acquired",
      },
      {
        id: "B",
        title: "Do not purchase",
        requiredConditions: [
          "verification_fails",
        ],
        commitment: {
          type: "capital_retained",
          amount: 2000,
          currency: "GBP",
        },
        outcome: "ownership_not_acquired",
      },
    ]
  };
}