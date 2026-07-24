import { callClaudeForJSON } from "./llm/callClaude";
import type { EliminationHistoryEntry } from "./triageCategoryElimination";

const BRING_BACK_SYSTEM_PROMPT = `
You are the Triage Bring-Back check within a decision-reasoning system.

You are not a person, character, or persona. You are a disciplined reasoning component with a single job.

Key question: Now that real finalists have been identified, does the person want to reconsider anything that was narrowed out earlier?

Purpose:
Narrowing is never perfectly certain - a real elimination round may have removed something the person would still want to weigh once they see where the process actually landed. Your job is to construct one clear, honest question inviting them to bring back a discarded candidate, referencing the REAL reason it was eliminated, not a generic list.

Responsibilities:
- Reference the actual finalists by name.
- For each discarded candidate, note briefly and honestly why it was removed (using the real elimination history given to you).
- Present this as a genuine, low-pressure option - bringing something back is normal and expected some of the time, not a sign anything went wrong.
- Do not pressure or nudge toward keeping or reconsidering anything - present it neutrally.

Output format:
Return ONLY valid JSON, no prose before or after, no markdown code fences. The JSON must be a single object with exactly this shape:

{
  "question": "the actual question, referencing the real finalists and the real reasons candidates were removed",
  "options": ["one option per discarded candidate, phrased as bringing it back, referencing why it was removed", "...", "No, stick with the current finalists"]
}
`.trim();

function buildBringBackUserPrompt(
  decisionPrompt: string,
  finalists: string[],
  eliminationHistory: EliminationHistoryEntry[]
): string {
  const eliminationSummary = eliminationHistory
    .map(
      (round) =>
        `Round on axis "${round.axis}": eliminated ${round.eliminatedCandidates.join(", ") || "none"} because the answer was "${round.selectedLabel}"`
    )
    .join("\n");

  return `
Original decision prompt: ${decisionPrompt}

Current finalists: ${finalists.join(", ")}

Elimination history (the real reasons things were removed):
${eliminationSummary || "(no eliminations recorded)"}

Construct the bring-back question and options.
`.trim();
}

export type BringBackResult = { question: string; options: string[] };

export async function triageBringBack(
  decisionPrompt: string,
  finalists: string[],
  eliminationHistory: EliminationHistoryEntry[]
): Promise<BringBackResult | null> {
  const userPrompt = buildBringBackUserPrompt(decisionPrompt, finalists, eliminationHistory);
  const result = await callClaudeForJSON<BringBackResult>(BRING_BACK_SYSTEM_PROMPT, userPrompt);

  if (!result.ok || !result.data?.question || !Array.isArray(result.data?.options)) {
    return null;
  }

  return result.data;
}

export async function triageBringBackForGutCheckPick(
  decisionPrompt: string,
  finalists: string[],
  eliminationHistory: EliminationHistoryEntry[],
  gutCheckPick: string
): Promise<BringBackResult | null> {
  const relevantRound = eliminationHistory.find((round) =>
    round.eliminatedCandidates.includes(gutCheckPick)
  );

  if (!relevantRound) return null;

  // Construct a single-candidate history entry so the prompt has no way to
  // reference any candidate other than the actual gut-check pick.
  const narrowedHistory: EliminationHistoryEntry[] = [
    {
      ...relevantRound,
      eliminatedCandidates: [gutCheckPick],
    },
  ];

  return triageBringBack(decisionPrompt, finalists, narrowedHistory);
}