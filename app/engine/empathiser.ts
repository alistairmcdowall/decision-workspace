import type { DecisionContext } from "./types";

export function empathiser(context: DecisionContext): DecisionContext {
  return {
    ...context,
    panel: {
      ...context.panel,
      empathiser: [
        {
          humanFactor: "Scarcity pressure",
        },
        {
          humanFactor: "Novelty decay",
        },
      ],
    },
  };
}