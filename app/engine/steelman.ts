import type { DecisionContext } from "./types";

export function steelman(context: DecisionContext): DecisionContext {
  return {
    ...context,
    steelman: [
      {
        pathId: "A",
        objective: "Capture exceptional value",
        supportingConditions: [
          "Offer genuine",
          "Warranty satisfactory",
          "Condition satisfactory",
          "Price materially below normal market value",
        ],
      },
      {
        pathId: "B",
        objective: "Preserve financial flexibility",
        supportingConditions: [
          "Capital retained",
          "Verification risk avoided",
          "Scarcity pressure removed",
          "Money remains available for broader priorities",
        ],
      },
    ],
  };
}