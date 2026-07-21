import type { DecisionContext } from "./types";
import { callClaudeForJSON } from "./llm/callClaude";

const EVENT_HORIZON_SYSTEM_PROMPT = `
You are the Event Horizon within a decision-reasoning system.

You are not a person, character, or persona. You are a disciplined reasoning component with a single job.

Key question: At what point does this stop being a decision?

Purpose:
Every decision has a period during which alternatives remain available. Eventually a commitment is made beyond which returning to the previous state becomes impossible or materially more costly. You identify that transition and make the moment of commitment explicit - you do not judge whether commitment should happen, only where it happens.

Responsibilities:
- Identify the triggering event that changes the decision from evaluation into commitment (e.g. contract signed, exchange of funds, resignation submitted, offer accepted).
- Record the specific conditions under which meaningful reversal is no longer possible.
- Identify the semantic transition - the change in the NATURE of the decision (e.g. "evaluation to ownership," "consideration to employment"), not merely the mechanical action taken.

Critical distinction - check this explicitly before answering: does a genuine, formal reversal right exist for this specific decision (e.g. a statutory cooling-off period, a return policy, a probationary period with an exit clause)?
- If YES, a real formal right exists: the event horizon is losing that right (the window expiring, the item being used beyond return conditions) - because a full, genuine reversal to the prior state really is possible until then.
- If NO formal right exists (the common case for private sales, most life decisions, most relationships): the event horizon is the moment of commitment itself - because even though some related consequence might later be undone (e.g. a car resold, a job left), the fact of having made the commitment, and the time, risk, and consequences already incurred, can never be undone. Do not confuse "the asset could later be sold/reversed" with "the decision could be undone" - these are different. Selling a car back gets you to "no longer owning this car," never to "never having bought it."

Do not analyse or evaluate what lies on either side of the boundary - only identify where the boundary is. Preserve neutrality - do not encourage or discourage commitment. Derive the event horizon from the actual facts of this specific decision, never from a generic template for its category - different decisions of the same general type can have genuinely different reversal structures.

Output format:
Return ONLY valid JSON, no prose before or after, no markdown code fences. The JSON must be a single object with exactly this shape:

{
  "trigger": "the specific action that changes this decision from evaluation into commitment",
  "label": "a short, readable phrase naming the boundary itself (e.g. 'payment, or the point where the purchase can no longer realistically be reversed')",
  "explanation": "1-2 sentences explaining what changes once this boundary is crossed, in plain language for the person reading this",
  "irreversibleAfter": ["a specific condition under which reversal is no longer meaningfully possible", "..."],
  "transition": "the semantic transition in the form 'X to Y' (e.g. 'evaluation to ownership', 'consideration to employment')"
}
`.trim();

function buildEventHorizonUserPrompt(context: DecisionContext): string {
  const landscape = context.landscape?.v2 ?? context.landscape?.v1;
  const paths = context.representativePaths ?? [];

  const pathsDescription = paths
    .map((p) => `Path ${p.id} - "${p.title}": ${p.outcome}`)
    .join("\n");

  return `
Decision subject: ${landscape?.subject ?? context.decision?.subject ?? "unknown"}
Commitment description: ${landscape?.commitment ?? "not established"}
Decision kind: ${context.decision?.kind ?? "GENERAL"}

Representative paths:
${pathsDescription || "(none available)"}

Original prompt: ${context.prompt}

Identify the event horizon for this decision - the point at which it stops being a decision and becomes a commitment.
`.trim();
}

type EventHorizonShape = NonNullable<DecisionContext["eventHorizon"]>;

export async function eventHorizons(context: DecisionContext): Promise<DecisionContext> {
  const userPrompt = buildEventHorizonUserPrompt(context);
  const result = await callClaudeForJSON<EventHorizonShape>(EVENT_HORIZON_SYSTEM_PROMPT, userPrompt);

  const fallback: EventHorizonShape = {
    trigger: "unspecified_commitment_boundary",
    label: "the point where the chosen path becomes meaningfully harder to reverse",
    explanation:
      "The reasoning service could not determine a specific event horizon for this decision.",
    irreversibleAfter: [],
    transition: "evaluation to commitment",
  };

  if (!result.ok) {
    console.error(`[eventHorizons] API call failed: ${result.error}`);
    return { ...context, eventHorizon: fallback };
  }

  const data = result.data;
  const looksValid =
    data &&
    typeof data.trigger === "string" &&
    typeof data.label === "string" &&
    typeof data.explanation === "string" &&
    Array.isArray(data.irreversibleAfter) &&
    typeof data.transition === "string";

  if (!looksValid) {
    console.error(
      `[eventHorizons] Validation failed. Raw parsed data:\n${JSON.stringify(data, null, 2)}`
    );
    return { ...context, eventHorizon: fallback };
  }

  return { ...context, eventHorizon: data };
}