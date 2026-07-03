import type { DecisionContext } from "./types";

export function reframer(context: DecisionContext): DecisionContext {
  return {
    ...context,
    reframer: {
      status: "PASS",
      governingObjective:
        "Determine whether to purchase the Sony Bravia 9 II for £2,000",
      route: "DECISION_LANDSCAPE",
      reason: {
        decisionCount: 1,
        decisionType: "purchase",
        subjectCount: 1,
        pricePresent: true,
      }
    },
  };
}