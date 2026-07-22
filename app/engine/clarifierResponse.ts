import type { DecisionContext } from "./types";
import { callClaudeForJSON } from "./llm/callClaude";

const CLARIFIER_RESPONSE_SYSTEM_PROMPT = `
You are the Clarifier Response within a decision-reasoning system.

You are not a person, character, or persona. You are a disciplined reasoning component with a single job.

Key question: What did we learn from the clarification?

Purpose:
Your purpose is not to preserve conversation - it is to preserve meaning. The Clarifier asked a question, presenting a small set of selectable options, because resolving a particular uncertainty would improve the Decision Model. You record the semantic effect of whichever option was selected.

Responsibilities:
- Identify the semantic effect of the selected option - what changed in the Decision Model, not merely which option was picked.
- Determine the resulting uncertainty state honestly. A selection may fully RESOLVE the targeted uncertainty, only REDUCE it, REPLACE it with a different uncertainty, or DEEPEN it (e.g. "Not sure" typically deepens or replaces the uncertainty rather than resolving it). Do not default to assuming full resolution.
- Do not reinterpret beyond what the selected option actually supports. Minimise interpretation - stay limited to the uncertainty the Clarifier's question actually targeted.
- Be precise about what has actually been resolved versus what merely remains consistent with it. Do not claim the answer "explains" a fact it only makes possible or consistent with. For example: knowing the seller is a private individual explains the ABSENCE of retailer markup/warranty - it does NOT explain why this specific seller chose this specific price, which remains a separate, still-open question unless the answer directly addressed it. Before finalising, check: does the answer actually establish the causal claim you're about to write, or only make it plausible/consistent? If only the latter, state it that way rather than as resolved fact.

The effect should describe what changed, not merely restate the option (e.g. "purchase willingness resolved, conditional on clean inspection" - not "the user selected yes").

Output format:
Return ONLY valid JSON, no prose before or after, no markdown code fences. The JSON must be a single object with exactly this shape:

{
  "effect": "one sentence stating the semantic consequence of this selection for the Decision Model - what changed, not what was picked",
  "resolutionState": "RESOLVED" | "REDUCED" | "REPLACED" | "DEEPENED"
}
`.trim();

function buildClarifierResponseUserPrompt(context: DecisionContext, selectedOption: string): string {
  const clarifier = context.clarifier;

  return `
The Clarifier asked the following question:
Target: ${clarifier?.target ?? "unknown"}
Method: ${clarifier?.method ?? "unknown"}
Question: ${clarifier?.question ?? "unknown"}
Options presented: ${clarifier?.answerOptions?.join(" / ") ?? "unknown"}
Rationale for asking: ${clarifier?.rationale ?? "unknown"}

The person's selected option: "${selectedOption}"

Determine the semantic effect of this selection and the resulting uncertainty state.
`.trim();
}

type ClarifierResponseShape = NonNullable<DecisionContext["clarifierResponse"]>;

export async function clarifierResponse(
  context: DecisionContext,
  selectedOption: string | null
): Promise<DecisionContext> {
  if (selectedOption === null || selectedOption.trim() === "") {
    return {
      ...context,
      clarifierResponse: {
        answer: "(no option selected)",
        effect: `Proceeding with an explicit default assumption in place of an answer to: "${context.clarifier?.question ?? "the clarifying question"}"`,
        resolutionState: "DEEPENED",
      },
    };
  }

  const userPrompt = buildClarifierResponseUserPrompt(context, selectedOption);
  const result = await callClaudeForJSON<{ effect: string; resolutionState: string }>(
    CLARIFIER_RESPONSE_SYSTEM_PROMPT,
    userPrompt
  );

  const validStates = ["RESOLVED", "REDUCED", "REPLACED", "DEEPENED"];

  if (!result.ok || !validStates.includes(result.data?.resolutionState)) {
    return {
      ...context,
      clarifierResponse: {
        answer: selectedOption,
        effect: "Could not determine the semantic effect of this selection.",
        resolutionState: "DEEPENED",
      },
    };
  }

  return {
    ...context,
    clarifierResponse: {
      answer: selectedOption,
      effect: result.data.effect,
      resolutionState: result.data.resolutionState as ClarifierResponseShape["resolutionState"],
    },
  };
}