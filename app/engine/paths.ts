import type { DecisionContext } from "./types";
import { callClaudeForJSON } from "./llm/callClaude";

const PATHS_SYSTEM_PROMPT = `
You are Representative Paths within a decision-reasoning system.

You are not a person, character, or persona. You are a disciplined reasoning component with a single job.

Key question: What are the meaningful alternatives available to the decision maker?

Purpose:
You identify the principal, genuinely distinct futures available within the current decision - not every conceivable action, only the small number of directions that materially differ from one another. You define alternatives; you do not evaluate or recommend them.

Responsibilities:
- Identify the principal alternatives.
- Describe the commitment associated with each path - what becomes necessary if that path is chosen.
- Record the required conditions for each path. IMPORTANT: you will be given the Pragmatist's actual stated requirements for this decision. Draw each path's required conditions FROM that list - distribute the relevant ones to the paths they actually apply to. Do not invent new requirements Pragmatist did not state. Do not simply copy the entire Pragmatist list onto every path - only the ones genuinely relevant to that specific path.
- Record the immediate outcome of choosing each path (what changes the moment it's entered, not long-term consequences).

Design principles:
- A path must represent a fundamentally different, stable reality - not a different route towards the same reality. Temporary pauses, verification steps, information-gathering, intermediate milestones, and different methods of reaching the same eventual outcome are NOT separate paths, no matter how the decision is framed - they belong to later reasoning (Navigator), not here. If a path has no destination of its own and only delays or prepares for another path, it is not a path.
- A path must be constructible entirely from information already present in this decision. Do not invent a new specific alternative (a different product, a different option) that was never named or implied anywhere in the prompt or landscape - that represents a different decision, not this one. The one legitimate exception: if the decision's own governing objective is genuinely about an unresolved quantity (e.g. how much of a stated budget to commit), resolutions of that quantity using only the range already given (none / all / some) are legitimate, since nothing is being invented.
- There is no predetermined correct number of paths. Do not aim for two, or three, or any fixed count - construct the smallest set of paths that faithfully represents genuinely different stable outcomes for this specific decision, and stop there.
- A "wait and see", "monitor the market", or "delay to check for a better price/model" path is NOT valid for a decision whose governing objective is a binary yes/no on a specific item (e.g. "should I buy this TV"), even if timing, pricing trends, or upcoming alternatives appear as a decision axis or remaining uncertainty in the Landscape. A timing-related axis reflects genuine uncertainty relevant to the decision - it does not by itself create a separate path. Test every path against the governing objective directly: does choosing this path actually answer that objective, or does it avoid answering it? A path that doesn't resolve the governing objective is not a valid path, no matter how reasonable it sounds. Only construct a "wait" or "delay" path if the governing objective itself is genuinely a timing question (e.g. "should I buy now or wait"), not merely because timing is one of several axes affecting a binary decision.
- Preserve neutrality - define alternatives, do not argue for any of them.

Output format:
Output format:
Keep every field concise - title under 8 words, outcome under 25 words, each requiredCondition under 15 words. Do not write full explanatory sentences where a short phrase conveys the same information.

Return ONLY valid JSON, no prose before or after, no markdown code fences. The JSON must be an array of 2-3 objects, each with exactly this shape:

{
  "id": "A" | "B" | "C",
  "title": "short title for this path",
  "requiredConditions": ["condition drawn from the given Pragmatist requirements, relevant to this specific path", ...],
  "commitment": {
    "type": "short label describing the kind of commitment (e.g. capital_outflow, capital_retained, time_commitment, relationship_commitment)",
    "amount": <number - the monetary amount in play if this decision has one, otherwise 0>,
    "currency": "GBP"
  },
  "outcome": "short description of the immediate consequence of choosing this path"
}
`.trim();

export function buildPathsUserPrompt(context: DecisionContext): string {
  const subject = context.decision?.subject ?? context.facts?.userStated?.subject ?? "unknown subject";
  const kind = context.decision?.kind ?? "GENERAL";
  const price = context.decision?.price
    ? `${context.decision.price.amount} ${context.decision.price.currency}`
    : "not specified";
  const governingObjective = context.reframer?.governingObjective ?? context.prompt;
  const landscape = context.landscape?.v2 ?? context.landscape?.v1;
  const commitment = landscape?.commitment ?? "not yet established";
  const decisionAxes = landscape?.decisionAxes?.join(", ") ?? "not yet established";
  const resolvedUncertainties = landscape?.resolvedUncertainties?.join("; ") ?? "none recorded";
  const remainingUncertainties = landscape?.remainingUncertainties?.join("; ") ?? "none recorded";

  const pragmatistRequirements = context.panel?.pragmatist
    ? context.panel.pragmatist.map((p) => `- ${p.requirement}`).join("\n")
    : "(Pragmatist has not run - no requirements available to draw from)";

  return `
Decision subject: ${subject}
Decision kind: ${kind}
Price/commitment scale: ${price}
Governing objective: ${governingObjective}
Landscape commitment description: ${commitment}
Decision axes: ${decisionAxes}
Resolved uncertainties: ${resolvedUncertainties}
Remaining uncertainties: ${remainingUncertainties}

Pragmatist's actual stated requirements for this decision (draw required conditions from these, distributed to the paths they apply to):
${pragmatistRequirements}

Original prompt: ${context.prompt}

Identify the representative paths for this decision.
`.trim();
}

type PathsShape = NonNullable<DecisionContext["representativePaths"]>;

export async function paths(context: DecisionContext): Promise<DecisionContext> {
  const userPrompt = buildPathsUserPrompt(context);
  const result = await callClaudeForJSON<PathsShape>(PATHS_SYSTEM_PROMPT, userPrompt);

  function buildFallback(reason: string): PathsShape {
    return [
      {
        id: "A",
        title: "Paths unavailable - proceed",
        requiredConditions: [reason],
        commitment: { type: "unknown", amount: 0, currency: "GBP" },
        outcome: "unknown",
      },
      {
        id: "B",
        title: "Paths unavailable - do not proceed",
        requiredConditions: [reason],
        commitment: { type: "unknown", amount: 0, currency: "GBP" },
        outcome: "unknown",
      },
    ];
  }

  if (!result.ok) {
    return { ...context, representativePaths: buildFallback(result.error) };
  }

  const entries = Array.isArray(result.data) ? result.data : [];
  const valid = entries.filter(
    (p): p is PathsShape[number] =>
      (p?.id === "A" || p?.id === "B" || p?.id === "C") &&
      typeof p?.title === "string" &&
      Array.isArray(p?.requiredConditions) &&
      typeof p?.commitment?.amount === "number" &&
      typeof p?.outcome === "string"
  );

  if (valid.length < 2) {
    return {
      ...context,
      representativePaths: buildFallback(
        `Model returned ${entries.length} entries, only ${valid.length} passed validation.`
      ),
    };
  }

  return { ...context, representativePaths: valid };
}