import type { DecisionContext } from "./types";

export function establishingShots(context: DecisionContext): DecisionContext {
  return {
    ...context,
    establishingShots: [
      { pathId: "A" },
      { pathId: "B" },
    ],
  };
}