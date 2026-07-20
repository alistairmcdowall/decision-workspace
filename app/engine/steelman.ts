import type { DecisionContext } from "./types";
import { callClaudeForJSON } from "./llm/callClaude";

const STEELMAN_SYSTEM_PROMPT = `
You are the Steelman within a decision-reasoning system.

You are not a person, character, or persona. You are a disciplined reasoning component with a single job.

Key question: What is the strongest legitimate case for this representative path?

Purpose:
Every Representative Path should be understood under its best reasonable interpretation before any comparison takes place. You are not persuading anyone to choose a path - you are ensuring no path is dismissed simply because it was expressed weakly. Weak arguments should never be compared against strong ones.

Responsibilities:
- For each path, identify the genuine objective it serves (e.g. preserve financial flexibility, capture exceptional value, reduce uncertainty, protect a relationship, minimise regret).
- Identify the specific conditions under which this path's case is strongest - drawing directly on the real Guardian, Pragmatist, Empathiser, and Auditor findings you are given, not invented conditions.
- Give every path equivalent intellectual effort. Do not make one path's case longer, richer, or more compelling than another's by default - if one case is genuinely weaker, that must come from the decision's own facts, not from you trying less hard.

You do not recommend a path. You do not rank paths. You do not invent supporting evidence that isn't grounded in the panel's actual findings or the decision's own facts. Constructing the strongest case for a path is not an endorsement of it.

Never mention internal component names in your output - the labels "Guardian," "Pragmatist," "Empathiser," and "Auditor" are internal architecture terms with no meaning to the person reading this, and must never appear in your case or supportingConditions text. Translate each finding into plain, self-contained language describing the actual concern or fact itself. Do not write "the Guardian's identified risk" - write what the risk actually is, in its own right, as if you had noticed it yourself.

Output format:
Return ONLY valid JSON, no prose before or after, no markdown code fences. The response MUST be a single JSON array, starting with [ and ending with ], containing exactly one object per path provided - never output multiple separate top-level objects. Example structure with two paths:

[
  {
    "pathId": "A",
    "objective": "short phrase naming the genuine objective this path serves",
    "case": "2-3 sentences making the strongest legitimate case for this path, grounded in the real facts and panel findings given to you",
    "supportingConditions": ["short phrase naming one condition under which this case is strongest", "..."]
  },
  {
    "pathId": "B",
    "objective": "...",
    "case": "...",
    "supportingConditions": ["..."]
  }
]
`.trim();

function buildSteelmanUserPrompt(context: DecisionContext): string {
  const paths = context.representativePaths ?? [];
  const landscape = context.landscape?.v2 ?? context.landscape?.v1;

  const pathsDescription = paths
    .map(
      (p) =>
        `Path ${p.id} - "${p.title}": ${p.outcome} (required conditions: ${p.requiredConditions.join("; ") || "none"})`
    )
    .join("\n");

  const guardianOutput = context.panel?.guardian
    ? context.panel.guardian.map((g) => `- ${g.protectedValue}: ${g.concern}`).join("\n")
    : "(not available)";
  const pragmatistOutput = context.panel?.pragmatist
    ? context.panel.pragmatist.map((p) => `- ${p.requirement}`).join("\n")
    : "(not available)";
  const empathiserOutput = context.panel?.empathiser
    ? context.panel.empathiser.map((e) => `- ${e.humanFactor}`).join("\n")
    : "(not available)";
  const auditorOutput = context.auditor
    ? `Readiness: ${context.auditor.readinessState} (${context.auditor.readinessScore}/100). Supported: ${context.auditor.supportedConclusions.map((c) => c.finding).join("; ")}`
    : "(not available)";

  return `
Decision subject: ${landscape?.subject ?? context.decision?.subject ?? "unknown"}
Commitment description: ${landscape?.commitment ?? "not established"}

Representative paths to build the strongest case for:
${pathsDescription}

Guardian's findings (protected values at risk):
${guardianOutput}

Pragmatist's findings (practical requirements):
${pragmatistOutput}

Empathiser's findings (human factors):
${empathiserOutput}

Auditor's assessment:
${auditorOutput}

Original prompt: ${context.prompt}

Construct the strongest legitimate case for every path listed above, grounded in these real findings.
`.trim();
}

type SteelmanShape = NonNullable<DecisionContext["steelman"]>;

export async function steelman(context: DecisionContext): Promise<DecisionContext> {
  const paths = context.representativePaths ?? [];

  if (paths.length === 0) {
    return { ...context, steelman: [] };
  }

  const userPrompt = buildSteelmanUserPrompt(context);
  const result = await callClaudeForJSON<SteelmanShape>(STEELMAN_SYSTEM_PROMPT, userPrompt);

  const fallback: SteelmanShape = paths.map((p) => ({
    pathId: p.id,
    objective: "Steelman unavailable",
    case: "The reasoning service could not construct a case for this path.",
    supportingConditions: [],
  }));

  if (!result.ok) {
    return { ...context, steelman: fallback };
  }

  const entries = Array.isArray(result.data) ? result.data : [];
  const validPathIds = new Set(paths.map((p) => p.id));
  const valid = entries.filter(
    (s): s is SteelmanShape[number] =>
      validPathIds.has(s?.pathId) &&
      typeof s?.objective === "string" &&
      typeof s?.case === "string" &&
      Array.isArray(s?.supportingConditions)
  );

  if (valid.length !== paths.length) {
    return { ...context, steelman: fallback };
  }

  return { ...context, steelman: valid };
}