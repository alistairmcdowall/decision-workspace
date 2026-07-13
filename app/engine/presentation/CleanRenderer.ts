import type { DecisionContext } from "../types";

function money(value: { amount: number; currency: string }): string {
  const symbol = value.currency === "GBP" ? "£" : `${value.currency} `;
  return `${symbol}${value.amount.toLocaleString("en-GB")}`;
}

function line(items: string[] | undefined): string {
  return items && items.length > 0 ? items.join(", ") : "Not specified";
}

export function renderCleanReport(context: DecisionContext): string {
  const c = context as any;

  const subject =
    c.facts?.userStated?.subject ??
    c.facts?.subject ??
    "the decision subject";

  const price =
    c.facts?.userStated?.price ??
    c.facts?.price;

  const priceText = price ? money(price) : "the stated commitment";

  const remaining =
    c.landscape?.v2?.remainingUncertainties ??
    c.landscape?.v1?.remainingUncertainties ??
    [];

  const resolved =
    c.landscape?.v2?.resolvedUncertainties ??
    [];

  const paths = c.representativePaths ?? [];

  return [
    `# Decision Workspace Report`,
    ``,
    `## Decision`,
    `You are considering whether to buy ${subject} for ${priceText}.`,
    ``,
    `## Current State`,
    `The decision has moved from its initial broad state into its current narrowed state.`,
    ``,
    resolved.length > 0
      ? `Resolved uncertainty: ${line(resolved)}.`
      : `No uncertainties are currently marked as resolved.`,
    ``,
    `Remaining uncertainties: ${line(remaining)}.`,
    ``,
    `## Auditor View`,
    `Evidence strength: ${c.auditor?.evidenceStrength ?? "Not specified"}.`,
    `Readiness state: ${c.auditor?.readinessState ?? "Not specified"}.`,
    ``,
    `Supported findings: ${line(
      c.auditor?.supportedConclusions?.map((x: any) => x.finding ?? x)
    )}.`,
    ``,
    `Unsupported findings: ${line(
      c.auditor?.unsupportedConclusions?.map((x: any) => x.finding ?? x)
    )}.`,
    ``,
    `## Representative Paths`,
    ...paths.flatMap((path: any) => [
      ``,
      `### Path ${path.id}: ${path.title}`,
      `Required conditions: ${line(path.requiredConditions)}.`,
      path.outcome
        ? `Outcome: ${path.outcome}.`
        : path.consequence
          ? `Consequence: ${path.consequence}.`
          : `Outcome: Not specified.`,
    ]),
    ``,
    `## Event Horizon`,
    `Trigger: ${c.eventHorizon?.trigger ?? "Not specified"}.`,
    `Irreversible after: ${line(c.eventHorizon?.irreversibleAfter)}.`,
    c.eventHorizon?.transition
      ? `Transition: ${c.eventHorizon.transition}.`
      : c.eventHorizon?.architecturalMeaning
        ? `Meaning: ${c.eventHorizon.architecturalMeaning}`
        : `Transition: Not specified.`,
    ``,
    `## Boundary`,
    `This report renders the Decision Model only. It does not add a recommendation.`,
  ].join("\n");
}