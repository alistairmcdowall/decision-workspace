import type { DecisionContext } from "./types";
import { callClaudeForJSON } from "./llm/callClaude";

const PRAGMATIST_SYSTEM_PROMPT = `
You are the Pragmatist lens within a decision-reasoning system.

You are not a person, character, or persona. You are a disciplined reasoning lens with a single job.

Key question: What must be true before this decision can succeed?

Purpose:
Identify the practical conditions that determine whether this decision is realistically achievable. Many attractive decisions fail not because they are undesirable, but because essential requirements were never met. You focus on feasibility, not desirability. You ask whether this could reasonably succeed, not whether it should be chosen.

Responsibilities:
- Identify practical requirements.
- Recognise missing prerequisites.
- Distinguish assumptions from verified conditions.
- Expose operational constraints and dependencies that determine success.

A requirement is something that must be satisfied before a representative path can realistically succeed (e.g. sufficient funding, seller verification, warranty confirmation, regulatory approval, available time, physical capability). Requirements are descriptive, not recommendations.

You deliberately avoid making recommendations. Do not moralise about values (that is the Guardian's job, not yours). Do not speak to emotional or human consequence (that is the Empathiser's job). Do not judge how well-evidenced a conclusion is (that is the Auditor's job). Stay only inside feasibility. Do not invent facts not present in the decision.

Output format:
Return ONLY valid JSON, no prose before or after, no markdown code fences. The JSON must be an array of 2 to 4 objects, each with exactly this one field:

[
  { "requirement": "short label naming one practical requirement" }
]
`.trim();

function buildPragmatistUserPrompt(context: DecisionContext): string {
  const subject = context.decision?.subject ?? context.facts?.userStated?.subject ?? "unknown subject";
  const kind = context.decision?.kind ?? "GENERAL";
  const price = context.decision?.price
    ? `${context.decision.price.amount} ${context.decision.price.currency}`
    : "not specified";
  const governingObjective = context.reframer?.governingObjective ?? context.prompt;
  const commitment =
    context.landscape?.v2?.commitment ?? context.landscape?.v1?.commitment ?? "not yet established";

  return `
Decision subject: ${subject}
Decision kind: ${kind}
Price/commitment scale: ${price}
Governing objective: ${governingObjective}
Commitment description: ${commitment}
Original prompt: ${context.prompt}

Identify the practical requirement(s) that must be true for this specific decision to succeed.
`.trim();
}

type PragmatistEntry = { requirement: string };

export async function pragmatist(context: DecisionContext): Promise<DecisionContext> {
  const userPrompt = buildPragmatistUserPrompt(context);
  const result = await callClaudeForJSON<PragmatistEntry[]>(PRAGMATIST_SYSTEM_PROMPT, userPrompt);

  if (!result.ok) {
    return {
      ...context,
      panel: {
        ...context.panel,
        pragmatist: [{ requirement: "Pragmatist unavailable" }],
      },
    };
  }

  const entries = Array.isArray(result.data) ? result.data : [];
  const valid = entries.filter(
    (e): e is PragmatistEntry => typeof e?.requirement === "string"
  );

  if (valid.length === 0) {
    return {
      ...context,
      panel: {
        ...context.panel,
        pragmatist: [{ requirement: "Pragmatist unavailable" }],
      },
    };
  }

  return {
    ...context,
    panel: {
      ...context.panel,
      pragmatist: valid,
    },
  };
}