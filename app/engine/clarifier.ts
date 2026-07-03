import type { DecisionContext } from "./types";

export function clarifier(context: DecisionContext): DecisionContext {
  return {
    ...context,
    clarifier: {
      target: "Purchase willingness",
      method: "ISOLATION",
      question:
        "If the £2,000 offer is genuine, fully warranted and free from hidden condition issues, would you feel comfortable committing the money?",
      rationale:
        "Determine whether willingness to purchase remains a blocking uncertainty once verification is removed.",
    },
  };
}