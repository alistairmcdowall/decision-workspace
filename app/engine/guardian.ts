import type { DecisionContext } from "./types";

export function guardian(context: DecisionContext): DecisionContext {
  return {
    ...context,
    panel: {
      ...context.panel,
      guardian: [
        {
          protectedValue: "Financial optionality",
          concern: "Capital commitment",
        },
        {
          protectedValue: "Decision quality",
          concern: "Scarcity pressure",
        },
      ],
    },
  };
}