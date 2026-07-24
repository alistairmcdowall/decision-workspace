import { callClaudeForJSON } from "./llm/callClaude";

const BUDGET_TOLERANCE_SYSTEM_PROMPT = `
You are the Budget Tolerance check within a decision-reasoning system.

You are not a person, character, or persona. You are a disciplined reasoning component with a single job.

Key question: Given a stated budget, would the person accept what that budget realistically means for a used version of these specific finalists?

Purpose:
For a used item, a stated budget does not tell you which SPECIFIC example is available - it constrains condition, age, or mileage in ways that vary unpredictably by listing. You cannot know real-time market prices, so you must NOT invent a specific price point or claim to know what the budget "actually buys." Instead, construct a genuine revealed-preference TOLERANCE question: ask whether the person would accept a plausible, honest consequence of a constrained budget (e.g. higher mileage, older age, cosmetic wear, less documented history) for one of the real finalists - without asserting this IS what their budget buys, only testing whether it WOULD be acceptable if it were.

Responsibilities:
- Reference the actual named finalists.
- Construct ONE concrete, honest tolerance scenario (e.g. "if your budget meant realistically finding one of these with higher mileage and a thinner service history than you'd ideally want, would that still be acceptable, or would it change things?").
- Do NOT state or imply a specific real price, mileage figure, or availability claim as fact - only as a hypothetical to test tolerance for.
- Do not pressure toward any particular answer.

Output format:
Return ONLY valid JSON, no prose before or after, no markdown code fences. The JSON must be a single object with exactly this shape:

{
  "question": "the tolerance question, referencing the real finalists",
  "options": ["Yes, that would still be acceptable", "No, that would change things", "Not sure"]
}
`.trim();

function buildBudgetToleranceUserPrompt(finalists: string[], statedBudget: string): string {
  return `
Current finalists: ${finalists.join(", ")}
Stated budget: ${statedBudget}

Construct the budget tolerance question for these finalists.
`.trim();
}

export type BudgetToleranceResult = { question: string; options: string[] };

export async function budgetTolerance(
  finalists: string[],
  statedBudget: string
): Promise<BudgetToleranceResult | null> {
  const userPrompt = buildBudgetToleranceUserPrompt(finalists, statedBudget);
  const result = await callClaudeForJSON<BudgetToleranceResult>(
    BUDGET_TOLERANCE_SYSTEM_PROMPT,
    userPrompt
  );

  if (!result.ok || !result.data?.question || !Array.isArray(result.data?.options)) {
    return null;
  }

  return result.data;
}