import type { DecisionContext } from "./types";

export function eventHorizons(context: DecisionContext): DecisionContext {
  return {
    ...context,

    eventHorizon: {
      trigger: "purchase_irreversible",
      irreversibleAfter: [
        "return_rights_expire",
        "non_returnable_purchase",
      ],
      transition: "evaluation_to_ownership",
    }
  };
}