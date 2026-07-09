// app/engine/steelman.ts

import type { DecisionContext } from "./types";

export function steelman(context: DecisionContext): DecisionContext {
  return {
    ...context,
    steelman: [
      {
        pathId: "A",
        objective: "Capture exceptional value",
        case:
          "The strongest case for buying is that this appears to be a premium television at a materially attractive price, provided the offer is genuine, the warranty is satisfactory, and the condition is clean. If those checks hold, the decision is not simply about spending £2,000; it is about using £2,000 to acquire something that would normally cost meaningfully more and that could improve everyday use for years.",
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
        case:
          "The strongest case for not buying is that the value only exists if the offer survives verification. If the warranty, seller, condition, or return route is unclear, keeping the money is not indecision; it is preserving flexibility and avoiding a purchase that could become difficult to unwind. The £2,000 remains available for other priorities, and the pressure created by a seemingly attractive offer disappears.",
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