import type { DecisionContext } from "./types";
import { callClaudeForJSON } from "./llm/callClaude";

const LANDSCAPE_V1_SYSTEM_PROMPT = `
You are the Decision Landscape within a decision-reasoning system.

You are not a person, character, or persona. You are a disciplined reasoning component with a single job.

Key question: What does this decision space actually look like?

Purpose:
You construct a semantic representation of the decision itself - not an evaluation of alternatives, but an understanding of the territory in which those alternatives exist. You describe; you do not argue for any course of action.

You receive the framed decision from the Reframer. Your job is to identify the major dimensions (decision axes) of the decision, and distinguish what is already known (resolved) from what genuinely remains uncertain (remaining).

Responsibilities:
- Identify the decision axes - the genuinely separate dimensions this decision involves (e.g. for a purchase: value, transaction integrity, timing, alternatives foregone; for a relocation: career, family, cost of living, reversibility - the actual axes depend entirely on the specific decision, do not force a generic template).
- Distinguish resolved uncertainties (facts already established by the prompt or context) from remaining uncertainties (things genuinely still unknown that would affect the decision).
- State a clear commitment description - what, concretely, would the person be committing to.
- Do not evaluate whether this is a good or bad decision. Do not recommend anything. Just describe the shape of the decision space.

Output format:
Return ONLY valid JSON, no prose before or after, no markdown code fences. The JSON must have exactly this shape:

{
  "subject": "short description of the decision subject",
  "commitment": "one sentence describing what committing to this decision concretely involves",
  "decisionAxes": ["short phrase naming one genuine dimension of this decision", ...],
  "resolvedUncertainties": ["short phrase naming one thing already established", ...],
  "remainingUncertainties": ["short phrase naming one thing genuinely still unknown", ...]
}

Keep decisionAxes to 2-5 entries, resolvedUncertainties and remainingUncertainties to whatever genuinely applies (may be short lists).
`.trim();

const LANDSCAPE_V2_SYSTEM_PROMPT = `
You are the Decision Landscape within a decision-reasoning system, producing an updated version (V2) after a clarifying question has been answered.

You are not a person, character, or persona.

Key question: Given what has just been resolved by the clarifier, how does the decision space now look?

Purpose:
You receive the previous Landscape (V1) and the clarifier's question, the user's answer, and its stated effect. Your job is to produce an updated Landscape that reflects this new information - typically moving one or more items from remainingUncertainties to resolvedUncertainties, and updating decisionAxes or commitment only if the new information genuinely changes them. Do not invent new uncertainties that weren't already present. Do not resolve uncertainties the clarifier's answer didn't actually address.

Output format:
Return ONLY valid JSON, no prose before or after, no markdown code fences. Same shape as before:

{
  "subject": "short description of the decision subject",
  "commitment": "one sentence describing what committing to this decision concretely involves",
  "decisionAxes": ["short phrase naming one genuine dimension of this decision", ...],
  "resolvedUncertainties": ["short phrase naming one thing already established", ...],
  "remainingUncertainties": ["short phrase naming one thing genuinely still unknown", ...]
}
`.trim();

function buildLandscapeV1UserPrompt(context: DecisionContext): string {
  const subject = context.decision?.subject ?? context.facts?.userStated?.subject ?? "unknown subject";
  const kind = context.decision?.kind ?? "GENERAL";
  const price = context.decision?.price
    ? `${context.decision.price.amount} ${context.decision.price.currency}`
    : "not specified";
  const governingObjective = context.reframer?.governingObjective ?? context.prompt;
  const reframerStatus = context.reframer?.status ?? "unknown";

  return `
Decision subject: ${subject}
Decision kind: ${kind}
Price/commitment scale: ${price}
Governing objective (from Reframer): ${governingObjective}
Reframer status: ${reframerStatus}
Original prompt: ${context.prompt}

Construct the Decision Landscape (V1) for this decision.
`.trim();
}

function buildLandscapeV2UserPrompt(context: DecisionContext, v1: NonNullable<DecisionContext["landscape"]>["v1"]): string {
  const answer = context.clarifierResponse?.answer ?? "not provided";
  const effect = context.clarifierResponse?.effect ?? "not provided";

  return `
Previous Landscape (V1):
Subject: ${v1?.subject}
Commitment: ${v1?.commitment}
Decision axes: ${v1?.decisionAxes.join(", ")}
Resolved uncertainties: ${v1?.resolvedUncertainties.join("; ") || "none"}
Remaining uncertainties: ${v1?.remainingUncertainties.join("; ") || "none"}

Clarifier's question was answered.
User's answer: ${answer}
Stated effect of that answer: ${effect}

Produce the updated Decision Landscape (V2) reflecting this new information.
`.trim();
}

type LandscapeShape = NonNullable<DecisionContext["landscape"]>["v1"];

export async function landscape(context: DecisionContext): Promise<DecisionContext> {
  // If V1 already exists, this call is happening post-clarifier - build V2.
  if (context.landscape?.v1 && context.clarifierResponse) {
    const v1 = context.landscape.v1;
    const userPrompt = buildLandscapeV2UserPrompt(context, v1);
    const result = await callClaudeForJSON<LandscapeShape>(LANDSCAPE_V2_SYSTEM_PROMPT, userPrompt);

    if (!result.ok || !result.data) {
      // V2 failed - leave it undefined. The renderer already falls back to V1 cleanly.
      return context;
    }

    return {
      ...context,
      landscape: {
        v1,
        v2: { ...result.data, state: "NARROWED" as const },
      },
    };
  }

  // Otherwise this is the first call - build V1.
  const userPrompt = buildLandscapeV1UserPrompt(context);
  const result = await callClaudeForJSON<LandscapeShape>(LANDSCAPE_V1_SYSTEM_PROMPT, userPrompt);

  const fallback: LandscapeShape = {
    subject: context.decision?.subject ?? context.prompt,
    commitment: context.decision?.price
      ? `${context.decision.price.amount} ${context.decision.price.currency}`
      : "not yet established",
    decisionAxes: [],
    resolvedUncertainties: [],
    remainingUncertainties: ["Landscape unavailable - degraded fallback used"],
    state: "BROAD" as const,
  };

  if (!result.ok || !result.data) {
    return { ...context, landscape: { v1: fallback } };
  }

  return {
    ...context,
    landscape: { v1: { ...result.data, state: "BROAD" as const } },
  };
}