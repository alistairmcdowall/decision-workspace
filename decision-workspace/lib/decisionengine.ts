export type DecisionResult = {
    summary: string;
    clarifiers: string[];
    analysis: JudgeOutput;
  };
  
  type JudgeOutput = {
    Guardian: string;
    Pragmatist: string;
    Auditor: string;
    Reframer: string;
  };
  
  function classifyDecision(input: string) {
    const lower = input.toLowerCase();
  
    if (
        lower.includes("portfolio") ||
        lower.includes("invest") ||
        lower.includes("500k") ||
        lower.includes("money")
      ) {
        return "portfolio";
      }
    
      if (
        lower.includes("singapore") ||
        lower.includes("move") ||
        lower.includes("relocate")
      ) {
        return "relocation";
      }
    
      if (
        lower.includes("business") ||
        lower.includes("startup") ||
        lower.includes("sell a product")
      ) {
        return "business";
      }
    
      return "general";
  }
  
  function guardian(input: string, type: string) {
    if (type === "portfolio") {
        return "The primary value at risk is the £500k itself. A portfolio that cannot be held through a severe drawdown is more dangerous than one with slightly lower expected returns.";
      }
    
      if (type === "relocation") {
        return "The primary value at risk is family stability. The biggest danger is optimising for one factor while damaging schooling, relationships, support networks or long-term quality of life.";
      }
    
      if (type === "business") {
        return "The primary value at risk is time, capital and opportunity cost. The business should be tested in a way that prevents a small experiment becoming a large failure.";
      }
    
      return "Identify what valuable thing could be harmed if this decision goes wrong.";
    }
    function pragmatist(input: string, type: string) {
        if (type === "portfolio") {
          return "The user asked for an investable portfolio now. The response should provide concrete options rather than disappearing into endless information gathering.";
        }
      
        if (type === "relocation") {
          return "The practical realities matter most: work, schooling, housing, visas, finances and day-to-day life. A beautiful theory that cannot be implemented has little value.";
        }
      
        if (type === "business") {
          return "Focus on the fastest route to testing demand. The objective is not to build a company immediately but to discover whether customers actually want the product.";
        }
      
        return "Focus on the practical realities that determine whether this decision succeeds.";
      }
      function auditor(input: string, type: string) {
        if (type === "portfolio") {
          return "Major unknowns remain: time horizon, tax wrappers, existing assets, retirement target and risk capacity. These should shape refinement, but should not block a first-pass answer.";
        }
      
        if (type === "relocation") {
          return "Important unknowns include visa requirements, employment implications, financial impact, schooling options and support networks. These should be surfaced explicitly.";
        }
      
        if (type === "business") {
          return "The largest unknown is whether real customers will pay real money. Most assumptions should be treated as unproven until validated.";
        }
      
        return "Identify the highest-value unknowns, not every possible missing detail.";
      }
      function reframer(input: string, type: string) {
        if (type === "portfolio") {
          return "The real decision may not be 'what is the perfect portfolio?' but 'which risk-return profile should this capital occupy?'";
        }
      
        if (type === "relocation") {
          return "The real decision may not be 'should I move?' but 'what combination of lifestyle, opportunity and stability am I trying to optimise for?'";
        }
      
        if (type === "business") {
          return "The real decision may not be 'should I start a business?' but 'what is the cheapest and fastest way to test whether this opportunity is real?'";
        }
      
        return "Check whether the user is asking the real decision or only the surface version of it.";
      }
  function runJudges(input: string, type: string): JudgeOutput {
    return {
        Guardian: guardian(input, type),
        Pragmatist: pragmatist(input, type),
        Auditor: auditor(input, type),
        Reframer: reframer(input, type),
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
      analysis: judges,
    };
  }
  
  export function runDecision(input: string): DecisionResult {
    const type = classifyDecision(input);
    const judges = runJudges(input, type);
  
    return synthesise(input, type, judges);
  }