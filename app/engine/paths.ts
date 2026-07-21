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

Rule 1 - Terminal state:
A path must represent a fundamentally different, stable reality - not a different route towards the same reality. Temporary pauses, verification steps, information-gathering, intermediate milestones, and different methods of reaching the same eventual outcome are NOT separate paths, no matter how the decision is framed - they belong to later reasoning (Navigator), not here. If a path has no destination of its own and only delays or prepares for another path, it is not a path. A "wait and see", "monitor the market", or "delay to check for a better price/model" path is essentially never valid, even if timing appears as a decision axis or remaining uncertainty - a timing axis reflects genuine uncertainty, it does not by itself create a separate path. This also applies to "negotiate," "mediate," "involve a third party," or "pursue a legal/formal process" as a path - these are always execution mechanisms belonging to Navigator, nested under whichever path is actually chosen (e.g. mediation is one way of executing "refuse," not a destination of its own), never a Representative Path in their own right, regardless of what a clarifying answer might later confirm about their availability or likely outcome. Test every path against the governing objective directly: does choosing this path actually answer that objective, or does it avoid answering it?

This includes delegation: a path that consists of getting a different person to perform one of the other paths' actions on your behalf (e.g. "press someone else to disclose it themselves" as an alternative to "disclose it yourself" or "stay silent") is not a genuinely separate destination - it is a route toward one of the existing paths' outcomes by another means, with an uncertain result. This belongs to later reasoning (Navigator, or a further decision point once its outcome is known), not to Representative Paths.

Rule 2 - No invention:
A path must be constructible entirely from information already present in this decision. Do not invent a new specific alternative (a different product, a different option) that was never named or implied anywhere in the prompt or landscape - that represents a different decision, not this one. The one legitimate exception: if the decision's own governing objective is genuinely about an unresolved quantity (e.g. how much of a stated budget to commit), resolutions of that quantity using only the range already given (none / some / all) are legitimate, since nothing is being invented. This includes possession: never assume the person already owns some component of what they're buying (e.g. an existing frame, an existing mattress, existing peripherals) unless the prompt or landscape says so. If ownership of a related component is genuinely unknown, default to assuming they do NOT already have it - do not construct a path that only makes sense under an invented replacement scenario.

Rule 3 - Scope consistency across the whole set:
All paths in your result must share exactly one consistent answer to what is in-scope and out-of-scope for this decision. Scope is decided once, for the entire set - never assumed differently by different paths. For example, if one path treats accessories as part of a "TV budget" while another path treats accessories as outside it (with money instead retained), that is an inconsistent set - both cannot be true about the same decision. Before finalising your paths, check this explicitly: pick one scope boundary, and discard or merge any path that silently relies on a different one. The default scope is always the narrower reading (see the governing objective) unless it has explicitly been authorised as broader - you do not have authority to broaden scope yourself; only the governing objective can do that.

Rule 4 - No manufactured spectrum:
If the real variation between candidate paths is a continuous weighting or trade-off with no natural, principled breakpoint (e.g. arbitrary sample points along "how much goes to A vs B"), this is NOT a valid set of paths - it is a single underlying preference question that should be asked directly, not answered by manufacturing 2-3 arbitrary points along the spectrum and presenting them as distinct futures. If you notice yourself creating paths like "X-priority", "balanced", "Y-priority" that only differ by degree rather than by a real structural difference in outcome, collapse them - this is not genuine path variation.

Rule 5 - Minimum functional set, when scope is ambiguous:
When the decision's stated object has a genuinely ambiguous boundary (e.g. does "a bed" mean a frame alone, frame plus mattress, or more), default to its minimum functional definition - the smallest set of components without which the object could not fulfil its basic, literal purpose. Do not default to a more complete, generous, or "nice to have" reading. Enhancements beyond the functional minimum (pillows, bedding, decor, accessories not required for basic function) are out of scope by default.

Rule 6 - No arbitrary component selection:
A fork is only legitimate if it is grounded in something the decision has actually established - never invent a preference for one unresolved sub-component of a compound object over another (e.g. prioritising a mattress over a frame, or one product specification like display technology over another) when nothing in the prompt or Landscape gives a real reason to favour that one. This applies even if the resulting paths differ in commitment amount - a difference in money spent does not, by itself, make an arbitrary component choice legitimate. If the decision's sub-components are genuinely undifferentiated by real information, do not fork on them at all - leave that sub-component question unresolved rather than manufacturing a path around one arbitrary answer to it.

Single-path outcomes are valid and honest:
If you cannot construct at least two paths that are both genuinely distinct AND non-arbitrary under all the rules above, return only ONE path - the single, well-grounded, full commitment - rather than inventing a second path to force a pair. A single path is a correct, honest output when no real fork yet exists in the decision as currently understood; it is not a failure and should never be padded out with an arbitrary second option just to reach two.

Design principles:
- There is no predetermined correct number of paths. Do not aim for two, or three, or any fixed count - construct the smallest set of paths that faithfully represents genuinely different stable outcomes for this specific decision, and stop there. This may be as few as one.
- Preserve neutrality - define alternatives, do not argue for any of them.
- Internal cons- Internal consistency check before returning: each path's commitment.amount must be consistent with its own outcome text. If the outcome describes money being retained, saved, or left unspent, the amount must reflect only what is actually spent in that path, not the full budget figure. If the outcome describes a purchase happening below the full budget, the amount must reflect a genuine estimate of what was actually spent, not zero - do not use 0 to mean "less than the full amount," only to mean "genuinely nothing spent."istency check before returning: each path's commitment.amount must be consistent with its own outcome text. If the outcome describes money being retained, saved, or left unspent, the amount must reflect only what is actually spent in that path, not the full budget figure. If the outcome describes a purchase happening below the full budget, the amount must reflect a genuine estimate of what was actually spent, not zero - do not use 0 to mean "less than the full amount," only to mean "genuinely nothing spent."

Output format:
Keep every field concise - title under 8 words, outcome under 25 words, each requiredCondition under 15 words. Do not write full explanatory sentences where a short phrase conveys the same information.

Return ONLY valid JSON, no prose before or after, no markdown code fences. The response MUST be a single JSON array, starting with [ and ending with ], containing 1 to 3 objects - never output multiple separate top-level objects. Example structure with two paths:

[
  {
    "id": "A",
    "title": "short title for this path",
    "requiredConditions": ["condition drawn from the given Pragmatist requirements, relevant to this specific path", ...],
    "commitment": {
      "type": "short label describing the kind of commitment (e.g. capital_outflow, capital_retained, time_commitment, relationship_commitment)",
      "amount": <number - the monetary amount actually committed in this path if it has one, otherwise 0>,
      "currency": "GBP"
    },
    "outcome": "short description of the immediate consequence of choosing this path"
  },
  {
    "id": "B",
    "title": "...",
    "requiredConditions": ["..."],
    "commitment": { "type": "...", "amount": 0, "currency": "GBP" },
    "outcome": "..."
  }
]
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

  let entries = Array.isArray(result.data) ? result.data : [];

  if (entries.length === 0) {
    console.error("[paths] Model returned an empty array on first attempt - retrying once.");
    const retryResult = await callClaudeForJSON<PathsShape>(PATHS_SYSTEM_PROMPT, userPrompt);
    if (retryResult.ok && Array.isArray(retryResult.data)) {
      entries = retryResult.data;
    }
  }

  const valid = entries.filter(
    (p): p is PathsShape[number] =>
      (p?.id === "A" || p?.id === "B" || p?.id === "C") &&
      typeof p?.title === "string" &&
      Array.isArray(p?.requiredConditions) &&
      typeof p?.commitment?.amount === "number" &&
      typeof p?.outcome === "string"
  );

  // A single genuine path is a valid, honest result - only fall back if we got zero usable paths.
  if (valid.length < 1) {
    console.error(
      `[paths] Validation rejected all entries. Raw parsed data:\n${JSON.stringify(entries, null, 2)}`
    );
    return {
      ...context,
      representativePaths: buildFallback(
        `Model returned ${entries.length} entries, only ${valid.length} passed validation.`
      ),
    };
  }

  return { ...context, representativePaths: valid };
}