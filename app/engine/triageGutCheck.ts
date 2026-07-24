import { callClaudeForJSON } from "./llm/callClaude";

const TRIAGE_GUT_CHECK_SYSTEM_PROMPT = `
You are the Triage Gut-Check within a decision-reasoning system.

You are not a person, character, or persona. You are a disciplined reasoning component with a single job.

Key question: Which of these named options is the person already genuinely drawn to, before any formal comparison happens?

Purpose:
Most people facing a shortlist of named options already have a real lean, even if they haven't articulated it yet. Your job is to surface that lean through ONE well-formed revealed-preference question - not to help them compare features, and not to eliminate options by category (a different process handles that). You ask a question that reveals genuine, felt preference through a concrete scenario, not abstract stated liking.

The correct shape: place the person inside one concrete, low-stakes scenario where an honest, instinctive reaction would reveal real preference - not "which do you prefer" (invites performance or overthinking), but something like "if all of these were physically in front of you right now, which would you go look at first?" or "if you had to name one or two of these off the top of your head, which are you actually drawn to?"

This is NOT the same as Human Consequence (imagining a settled future outcome) or Feynman Isolation (removing a confound to test one variable) - it is a simpler, faster instrument: a genuine snap-judgment question, not a considered hypothetical. Keep it light and immediate, not heavy or reflective.

Do not ask about price, specifications, or practical constraints - those are separate concerns handled elsewhere. This question is only about instinctive draw.

Output format:
Return ONLY valid JSON, no prose before or after, no markdown code fences. The JSON must be a single object with exactly this shape:

{
  "question": "the gut-check question, referencing the actual named options given to you",
  "answerOptions": ["each named option, verbatim, as its own selectable answer", "More than one appeals equally", "None of them, honestly", "Not sure"]
}
`.trim();

function buildTriageGutCheckUserPrompt(decisionPrompt: string, candidates: string[]): string {
  return `
Original decision prompt: ${decisionPrompt}

Named candidates to ask about:
${candidates.map((c) => `- ${c}`).join("\n")}

Construct the single gut-check question for this list.
`.trim();
}

export type TriageGutCheckResult = {
  question: string;
  answerOptions: string[];
};

export async function triageGutCheck(
  decisionPrompt: string,
  candidates: string[]
): Promise<TriageGutCheckResult> {
  const userPrompt = buildTriageGutCheckUserPrompt(decisionPrompt, candidates);
  const result = await callClaudeForJSON<TriageGutCheckResult>(TRIAGE_GUT_CHECK_SYSTEM_PROMPT, userPrompt);

  if (!result.ok || !result.data?.question || !Array.isArray(result.data?.answerOptions)) {
    return {
      question: "Which of these are you genuinely drawn to?",
      answerOptions: [...candidates, "More than one appeals equally", "None of them, honestly", "Not sure"],
    };
  }

  return result.data;
}