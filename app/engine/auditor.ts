import type { DecisionContext } from "./types";

export function auditor(context: DecisionContext): DecisionContext {
  return {
    ...context,
    auditor: {
      evidenceStrength: "MEDIUM",
      assumptions: [
        "£2,000 is materially below expected market position",
        "The Sony Bravia 9 II is a premium television",
      ],
      missingInformation: [
        "Seller identity",
        "Product condition",
        "Warranty status",
      ],
      blockingUncertainties: [
        "Seller legitimacy",
        "Condition",
        "Warranty",
      ],
      supportedConclusions: [
        {
          finding: "attractive_if_verified",
        },
        {
          finding: "purchase_willingness_unresolved",
        },
      ],
      unsupportedConclusions: [
        {
          finding: "offer_safe",
        },
        {
          finding: "purchase_recommended",
        },
      ],
      internalConsistency: "CONSISTENT",
      readinessScore: 82,
      readinessState: "GREEN",
    },
  };
}