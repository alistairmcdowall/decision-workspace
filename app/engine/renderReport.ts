import type { DecisionContext } from "./types";

export function renderReport(context: DecisionContext): string {
  return JSON.stringify(context, null, 2);
}