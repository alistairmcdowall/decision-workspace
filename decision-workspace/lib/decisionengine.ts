export type DecisionResult = {
    summary: string;
    clarifiers: string[];
    analysis: string;
  };
  
  export function runDecision(input: string): DecisionResult {
    const trimmed = input.trim().toLowerCase();
  
    const isPortfolio =
      trimmed.includes("portfolio") ||
      trimmed.includes("invest") ||
      trimmed.includes("500k");
  
    if (isPortfolio) {
      return {
        summary:
          "First-pass view: for £500k to invest now, the useful starting point is not one overconfident portfolio but 2–3 concrete options. A sensible default candidate is a growth-core portfolio. The next version should show bear/base/bull outcomes so the user can see why one option is preferable.",
        clarifiers: [
          "If the moderate-growth option appeared sufficient, would you still want maximum growth?",
          "If £500k temporarily fell to £350k, would you stay invested?",
          "If this money were not needed for retirement, would your preferred risk level change?",
        ],
        analysis:
          "Prototype analysis: Guardian flags drawdown risk; Pragmatist preserves the user's intent to invest now; Auditor notes missing time horizon and tax wrapper details; Reframer shifts the issue from 'one perfect portfolio' to 'which risk-return profile should this money occupy'.",
      };
    }
  
    return {
      summary:
        "First-pass view: this decision needs to preserve your original intent while exposing the main trade-offs, assumptions, and risks.",
      clarifiers: [
        "What outcome would make this decision feel successful?",
        "What would change your mind?",
        "What downside would be unacceptable?",
      ],
      analysis:
        "Analysis placeholder: Guardian, Pragmatist, Empathiser, Auditor, Reframer, Research, Steelman, Red Team and Lens will appear here once wired in.",
    };
  }