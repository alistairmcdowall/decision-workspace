// app/engine/eventHorizons.ts

import type { DecisionContext } from "./types";

export function eventHorizons(context: DecisionContext): DecisionContext {
  if (context.decision.kind === "PURCHASE") {
    return {
      ...context,

      eventHorizon: {
        trigger: "purchase_irreversible",
        label:
          "payment, or any point where the purchase can no longer realistically be reversed",
        explanation:
          "Until that boundary is crossed, the decision remains in evaluation. After it, the decision becomes harder to reverse.",
      },
    };
  }

  if (context.decision.kind === "RELOCATION") {
    return {
      ...context,

      eventHorizon: {
        trigger: "acceptance_of_binding_relocation_commitments",
        label:
          "accepting binding relocation commitments, such as resignation, school withdrawal, housing commitments, or major relocation spending",
        explanation:
          "Until that boundary is crossed, the decision remains in evaluation. After it, the move becomes harder to reverse without material disruption.",
      },
    };
  }

  if (context.decision.kind === "PORTFOLIO") {
    return {
      ...context,

      eventHorizon: {
        trigger: "portfolio_allocation_commitment",
        label:
          "placing the major allocation trades, especially once existing holdings are sold and the portfolio is materially repositioned",
        explanation:
          "Until that boundary is crossed, the decision remains in evaluation. After it, the portfolio can still be changed, but the costs, tax consequences and behavioural pressure may be higher.",
      },
    };
  }

  return {
    ...context,

    eventHorizon: {
      trigger: "unspecified_commitment_boundary",
      label: "the point where the chosen path becomes meaningfully harder to reverse",
      explanation:
        "Until that boundary is crossed, the decision remains in evaluation. After it, reversal may become more costly, disruptive, or impractical.",
    },
  };
}