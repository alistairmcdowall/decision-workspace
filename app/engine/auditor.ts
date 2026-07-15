import type { DecisionContext } from "./types";
import { callClaudeForJSON } from "./llm/callClaude";

const AUDITOR_SYSTEM_PROMPT = `
You are the Auditor lens within a decision-reasoning system.

You are not a person, character, or persona. You are a disciplined reasoning lens with a single job.

Key question: How confident should we be in our current understanding?

Purpose:
Unlike the other lenses, you do not examine the decision itself. You examine the QUALITY of the reasoning about the decision so far — the landscape, and what Guardian, Pragmatist, and Empathiser have each said. You are meta-reasoning: reasoning about the reasoning, not adding new reasoning of your own.

Responsibilities:
- Evaluate evidential quality (how well-supported is the current understanding, independent of how persuasive it sounds).
- Identify assumptions being relied on (assumptions are not defects; hidden/unstated assumptions are).
- Identify missing information — but only information that could actually change the decision, not mere curiosity.
- Identify blocking uncertainties (uncertainty that prevents meaningful progress) versus non-blocking uncertainty (uncertainty that just reduces confidence but doesn't block).
- Evaluate whether Guardian, Pragmatist, and Empathiser's outputs are internally consistent with each other and with the landscape, or whether they contradict one another.
- Estimate overall reasoning readiness.

You do not improve the reasoning or add missing analysis yourself. You do not recommend a path. Do not invent assumptions or gaps that weren't actually present in what you were given.

Readiness scoring:
- readinessScore is 0-100, reflecting how ready this decision understanding is to move forward to clarifying questions.
- readinessState must be consistent with the score: GREEN if score >= 70 (well-understood, few material gaps), AMBER if score is 40-69 (usable but meaningful gaps remain), RED if score < 40 (too much missing or unresolved to proceed meaningfully).
- evidenceStrength (LOW/MEDIUM/HIGH) reflects how well-supported the current understanding is — do not raise it just because the reasoning reads persuasively.
- internalConsistency is INCONSISTENT only if the panel outputs actually contradict each other or the landscape, not merely if they emphasise different things.

Output format:
Return ONLY valid JSON, no prose before or after, no markdown code fences. The JSON must be a single object with exactly this shape:

{
  "evidenceStrength": "LOW" | "MEDIUM" | "HIGH",
  "assumptions": ["short phrase naming one assumption", ...],
  "missingInformation": ["short phrase naming one piece of missing information that could change the decision", ...],
  "blockingUncertainties": ["short phrase naming one uncertainty that blocks progress", ...],
  "supportedConclusions": [{ "finding": "one short plain-English sentence describing something well-supported" }, ...],
  "unsupportedConclusions": [{ "finding": "one short plain-English sentence describing a conclusion that would currently be premature" }, ...],
  "internalConsistency": "CONSISTENT" | "INCONSISTENT",
  "readinessScore": <integer 0-100>,
  "readinessState": "GREEN" | "AMBER" | "RED"
}

Keep each array to 1-4 entries. Arrays may be empty if genuinely nothing applies, but do not pad with filler.
`.trim();

function buildAuditorUserPrompt(context: DecisionContext): string {
  const subject = context.decision?.subject ?? context.facts?.userStated?.subject ?? "unknown subject";
  const governingObjective = context.reframer?.governingObjective ?? context.prompt;
  const commitment =
    context.landscape?.v2?.commitment ?? context.landscape?.v1?.commitment ?? "not yet established";
  const decisionAxes = context.landscape?.v1?.decisionAxes?.join(", ") ?? "not yet established";
  const resolvedUncertainties =
    context.landscape?.v1?.resolvedUncertainties?.join("; ") ?? "none recorded";
  const remainingUncertainties =
    context.landscape?.v1?.remainingUncertainties?.join("; ") ?? "none recorded";

  const guardianOutput = context.panel?.guardian
    ? context.panel.guardian
        .map((g) => `- ${g.protectedValue}: ${g.concern}`)
        .join("\n")
    : "(Guardian has not run yet)";

  const pragmatistOutput = context.panel?.pragmatist
    ? context.panel.pragmatist.map((p) => `- ${p.requirement}`).join("\n")
    : "(Pragmatist has not run yet)";

  const empathiserOutput = context.panel?.empathiser
    ? context.panel.empathiser.map((e) => `- ${e.humanFactor}`).join("\n")
    : "(Empathiser has not run yet)";

  return `
Decision subject: ${subject}
Governing objective: ${governingObjective}
Commitment description: ${commitment}
Decision axes: ${decisionAxes}
Resolved uncertainties: ${resolvedUncertainties}
Remaining uncertainties: ${remainingUncertainties}

Guardian's output (protected values and concerns):
${guardianOutput}

Pragmatist's output (practical requirements):
${pragmatistOutput}

Empathiser's output (human factors):
${empathiserOutput}

Original prompt: ${context.prompt}

Evaluate the quality and completeness of this reasoning so far.
`.trim();
}

type AuditorEntry = NonNullable<DecisionContext["auditor"]>;

export async function auditor(context: DecisionContext): Promise<DecisionContext> {
  const userPrompt = buildAuditorUserPrompt(context);
  const result = await callClaudeForJSON<AuditorEntry>(AUDITOR_SYSTEM_PROMPT, userPrompt);

  const fallback: AuditorEntry = {
    evidenceStrength: "LOW",
    assumptions: [],
    missingInformation: [],
    blockingUncertainties: ["Auditor unavailable"],
    supportedConclusions: [],
    unsupportedConclusions: [],
    internalConsistency: "CONSISTENT",
    readinessScore: 0,
    readinessState: "RED",
  };

  if (!result.ok) {
    return { ...context, auditor: fallback };
  }

  const data = result.data;
  const looksValid =
    data &&
    typeof data.readinessScore === "number" &&
    Array.isArray(data.assumptions) &&
    Array.isArray(data.missingInformation) &&
    Array.isArray(data.blockingUncertainties) &&
    Array.isArray(data.supportedConclusions) &&
    Array.isArray(data.unsupportedConclusions);

  if (!looksValid) {
    return { ...context, auditor: fallback };
  }

  return { ...context, auditor: data };
}