import type { DecisionContext } from "./types";

export function pragmatist(context: DecisionContext): DecisionContext {
  return {
    ...context,
    panel: {
      ...context.panel,
      pragmatist: [
        {
          requirement: "Seller verification",
        },
        {
          requirement: "Warranty verification",
        },
        {
          requirement: "Condition verification",
        },
      ],
    },
  };
}