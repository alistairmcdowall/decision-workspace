import type { DecisionContext } from "./types";
import { callClaudeForJSON } from "./llm/callClaude";

const EMPATHISER_SYSTEM_PROMPT = `
You are the Empathiser lens within a decision-reasoning system.

You are not a person, character, or persona. You are a disciplined reasoning lens with a single job.

Key question: How does this decision affect the people involved?

Purpose:
Identify the human consequences of this decision — emotional, psychological, and interpersonal — alongside its practical and financial characteristics. Every significant decision affects people, sometimes obviously, sometimes not. You ensure human impact is treated as a legitimate part of reasoning, not an afterthought.

Responsibilities:
- Identify the people affected by this decision (the decision maker themselves, and anyone else materially involved).
- Recognise emotional pressures (e.g. excitement, fear of loss, scarcity pressure, regret, pride).
- Expose psychological influences that aren't purely financial or logical.
- Identify relationship or interpersonal impacts, where relevant.

You do not determine whether these human impacts justify a particular decision. Your job is only to make them visible. Do not recommend a path. Do not moralise. Do not speak to financial risk (that is the Guardian's job) or practical feasibility (that is the Pragmatist's job) — stay only inside human/emotional territory. Do not invent stakeholders or relationships not implied by the decision itself.

Each human factor must be genuinely distinct from the others you list. Write each as a single clause naming one specific human factor and why it matters emotionally or interpersonally — do not stack a second, different human factor onto the same entry with "also," "additionally," or "further."

Output format:
Return ONLY valid JSON, no prose before or after, no markdown code fences. The JSON must be an array of 1 to 3 objects, each with exactly this one field:

[
  { "humanFactor": "one sentence naming a specific human/emotional dimension of this decision" }
]
`.trim();

function buildEmpathiserUserPrompt(context: DecisionContext): string {
  const subject = context.decision?.subject ?? context.facts?.userStated?.subject ?? "unknown subject";
  const kind = context.decision?.kind ?? "GENERAL";
  const governingObjective = context.reframer?.governingObjective ?? context.prompt;
  const commitment =
    context.landscape?.v2?.commitment ?? context.landscape?.v1?.commitment ?? "not yet established";
  const decisionAxes = context.landscape?.v1?.decisionAxes?.join(", ") ?? "not yet established";
  const remainingUncertainties =
    context.landscape?.v1?.remainingUncertainties?.join("; ") ?? "not yet established";

  const clarifierLine = context.clarifierResponse
    ? `\n\nA revealed-preference clarifying question was asked and answered. Answer: "${context.clarifierResponse.answer}" Stated effect: ${context.clarifierResponse.effect}. Pay particular attention to what this answer reveals emotionally, not just what it resolves practically - a revealed preference often exposes the real human factor at stake more honestly than the original prompt did.`
    : "";

  return `
Decision subject: ${subject}
Decision kind: ${kind}
Governing objective: ${governingObjective}
Commitment description: ${commitment}
Decision axes: ${decisionAxes}
Remaining uncertainties: ${remainingUncertainties}
Original prompt: ${context.prompt}${clarifierLine}

Identify the human/emotional factor(s) at play in this specific decision.
`.trim();
}

type EmpathiserEntry = { humanFactor: string };

export async function empathiser(context: DecisionContext): Promise<DecisionContext> {
  const userPrompt = buildEmpathiserUserPrompt(context);
  const result = await callClaudeForJSON<EmpathiserEntry[]>(EMPATHISER_SYSTEM_PROMPT, userPrompt);

  if (!result.ok) {
    return {
      ...context,
      panel: {
        ...context.panel,
        empathiser: [{ humanFactor: "Empathiser unavailable" }],
      },
    };
  }

  const entries = Array.isArray(result.data) ? result.data : [];
  const valid = entries.filter(
    (e): e is EmpathiserEntry => typeof e?.humanFactor === "string"
  );

  if (valid.length === 0) {
    return {
      ...context,
      panel: {
        ...context.panel,
        empathiser: [{ humanFactor: "Empathiser unavailable" }],
      },
    };
  }

  return {
    ...context,
    panel: {
      ...context.panel,
      empathiser: valid,
    },
  };
}