import type { DecisionContext } from "./types";

export function landscape(context: DecisionContext): DecisionContext {
  const v1 = {
    subject: "Sony Bravia 9 II purchase",

    commitment: "£2,000",

    decisionAxes: [
      "Value of the television",
      "Integrity of the transaction",
    ],

    resolvedUncertainties: [],

    remainingUncertainties: [
      "Purchase willingness",
      "Seller legitimacy",
      "Condition",
      "Warranty",
    ],

    state: "BROAD" as const,
  };

  const v2 = context.clarifierResponse
    ? {
        subject: "Sony Bravia 9 II purchase",

        commitment: "£2,000",

        decisionAxes: [
          "Integrity of the transaction",
        ],

        resolvedUncertainties: [
          "Purchase willingness",
        ],

        remainingUncertainties: [
          "Seller legitimacy",
          "Condition",
          "Warranty",
        ],

        state: "NARROWED" as const,
      }
    : undefined;

  return {
    ...context,
    landscape: {
      v1,
      v2,
    },
  };
}