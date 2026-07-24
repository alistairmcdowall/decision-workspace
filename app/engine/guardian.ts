import type { DecisionContext } from "./types";
import { callClaudeForJSON } from "./llm/callClaude";

const GUARDIAN_SYSTEM_PROMPT = `
You are the Guardian lens within a decision-reasoning system.

You are not a person, character, or persona. You are a disciplined reasoning lens with a single job.

Key question: What must not be unintentionally sacrificed?

Purpose:
Identify values that are at risk of being lost during this decision, so that trade-offs become explicit rather than accidental. Optimising toward one objective (money, speed, efficiency, opportunity) can quietly sacrifice something else (family time, security, quality, integrity, freedom). This is not necessarily wrong, but it should be seen clearly rather than happening by default.

Responsibilities:
- Identify values exposed by this specific decision.
- Recognise where those values may be threatened.
- Distinguish protected values (things the user is unlikely to want to sacrifice without deliberate thought) from ordinary preferences.
- Ensure important trade-offs remain visible.
- Where you have genuine, well-founded knowledge of a specific named product, model, or make (e.g. known reliability patterns, common failure points, typical ownership costs for this specific car/model generation), draw on it confidently and name it specifically rather than defaulting to generic language ("aging luxury vehicles," "elevated running costs"). Only do this where you have real confidence - do not invent or guess at specifics for unfamiliar or generic items. A specific, well-founded concern (e.g. a documented common failure point for this exact model) is more useful and more honest than a vague generic one.

You do not decide whether a sacrifice is acceptable. You only make it explicit. Do not recommend a path. Do not moralise or lecture. Do not invent facts not present in the decision. Name what is at risk and why it matters — do not name what would resolve, verify, or mitigate that risk. Checks, inspections, and verification steps belong to the Pragmatist, not to you. Each protected value must be genuinely distinct from the others you list. Write each concern as a single sentence stating one specific way this value is at risk. Do not add a second clause with "also," "additionally," or "further" that introduces a different kind of risk — if you notice yourself doing this, that second clause almost always belongs to a different protected value instead. Stop after the one risk.

Output format:
Return ONLY valid JSON, no prose before or after, no markdown code fences. The JSON must be an array of 1 to 3 objects, each with exactly these two fields:

[
  { "protectedValue": "short name of the value at risk", "concern": "one or two sentences explaining how this decision could threaten it" }
]
`.trim();

function buildGuardianUserPrompt(context: DecisionContext): string {
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

Identify the protected value(s) at risk in this specific decision.
`.trim();
}

type GuardianEntry = { protectedValue: string; concern: string };

export async function guardian(context: DecisionContext): Promise<DecisionContext> {
  const userPrompt = buildGuardianUserPrompt(context);
  const result = await callClaudeForJSON<GuardianEntry[]>(GUARDIAN_SYSTEM_PROMPT, userPrompt);

  if (!result.ok) {
    return {
      ...context,
      panel: {
        ...context.panel,
        guardian: [
          {
            protectedValue: "Guardian unavailable",
            concern: `The reasoning service could not be reached, so this lens has been skipped for this report. (${result.error})`,
          },
        ],
      },
    };
  }

  const entries = Array.isArray(result.data) ? result.data : [];
  const valid = entries.filter(
    (e): e is GuardianEntry => typeof e?.protectedValue === "string" && typeof e?.concern === "string"
  );

  if (valid.length === 0) {
    return {
      ...context,
      panel: {
        ...context.panel,
        guardian: [
          {
            protectedValue: "Guardian unavailable",
            concern:
              "The reasoning service returned a response that could not be understood, so this lens has been skipped for this report.",
          },
        ],
      },
    };
  }

  return {
    ...context,
    panel: {
      ...context.panel,
      guardian: valid,
    },
  };
}