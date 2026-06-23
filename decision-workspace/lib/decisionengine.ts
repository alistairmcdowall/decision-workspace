export type DecisionResult = {
    summary: string;
    clarifiers: string[];
    analysis: JudgeOutput;
  };
  
  type JudgeOutput = {
    guardian: string;
    pragmatist: string;
    auditor: string;
    reframer: string;
  };
  
  function classifyDecision(input: string) {
    const lower = input.toLowerCase();
  
    if (
      lower.includes("portfolio") ||
      lower.includes("invest") ||
      lower.includes("500k")
    ) {
      return "portfolio";
    }
  
    return "general";
  }
  
  function guardian(input: string, type: string) {
    if (type === "portfolio") {
      return "Guardian: The main exposed value is the £500k capital. The key risk is choosing a portfolio that looks attractive on paper but cannot be held through a large drawdown.";
    }
  
    return "Guardian: Identify what valuable thing could be harmed if this decision goes wrong.";
  }
  
  function pragmatist(input: string, type: string) {
    if (type === "portfolio") {
      return "Pragmatist: The user asked for something investable now, so the response must produce concrete portfolio options rather than disappearing into questions.";
    }
  
    return "Pragmatist: Focus on the practical realities that would determine whether this decision works in the real world.";
  }
  
  function auditor(input: string, type: string) {
    if (type === "portfolio") {
      return "Auditor: Major unknowns remain: time horizon, tax wrappers, existing assets, retirement target and risk capacity. These should shape refinement, but should not block a first-pass answer.";
    }
  
    return "Auditor: Identify the highest-value unknowns, not every possible missing detail.";
  }
  
  function reframer(input: string, type: string) {
    if (type === "portfolio") {
      return "Reframer: The real decision may not be 'what is the perfect portfolio?' but 'which risk-return profile should this £500k occupy?'";
    }
  
    return "Reframer: Check whether the user is asking the real decision or only the surface version of it.";
  }
  
  function runJudges(input: string, type: string): JudgeOutput {
    return {
      guardian: guardian(input, type),
      pragmatist: pragmatist(input, type),
      auditor: auditor(input, type),
      reframer: reframer(input, type),
    };
  }
  
  function synthesise(input: string, type: string, judges: JudgeOutput): DecisionResult {
    if (type === "portfolio") {
      return {
        summary:
          "First-pass view: for £500k to invest now, the response should preserve the user's intent and produce concrete options. A sensible first output is three investable directions: controlled growth, growth core, and maximum growth. The next improvement is to show bear/base/bull outcomes so the user can see the consequences rather than being told what is 'best'.",
        clarifiers: [
          "If £500k temporarily fell to £350k, would you stay invested?",
          "If a lower-risk portfolio still appeared likely to meet your target, would you still want maximum growth?",
          "If this portfolio produced less wealth but made retirement more reliable, would that be acceptable?",
        ],
        analysis: judges,
      };
    }
  
    return {
      summary:
        "First-pass view: this decision should be analysed by preserving the user's intent, identifying what is at risk, finding the practical constraints, and surfacing only the highest-value unknowns.",
      clarifiers: [
        "Would one specific outcome make this decision clearly successful?",
        "Would one downside make this decision unacceptable?",
        "Is there a hidden constraint that would change the answer?",
      ],
      analysis: Judges,
    };
  }
  
  export function runDecision(input: string): DecisionResult {
    const type = classifyDecision(input);
    const judges = runJudges(input, type);
  
    return synthesise(input, type, judges);
  }