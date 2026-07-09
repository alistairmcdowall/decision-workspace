// app/engine/presentation/guidedRenderer.ts

import type { DecisionContext } from "../types";

function eventTriggerText(trigger: string | undefined): string {
  switch (trigger) {
    case "purchase_irreversible":
      return "payment, or any point where the purchase can no longer realistically be reversed";

    case "acceptance_of_binding_relocation_commitments":
      return "accepting binding relocation commitments, such as resignation, school withdrawal, housing commitments, or major relocation spending";

    default:
      return trigger ?? "not specified";
  }
}

function decisionSummary(c: any): string {
  const subject =
    c.landscape?.v2?.subject ??
    c.landscape?.v1?.subject ??
    c.facts?.userStated?.subject ??
    c.facts?.subject ??
    "this decision";

  const price = c.facts?.userStated?.price ?? c.facts?.price;

  if (price && price.amount > 0) {
    return `The decision is whether to buy ${subject} for £${price.amount.toLocaleString("en-GB")}.`;
  }

  return `The decision concerns ${subject}.`;
}

export function renderGuidedReport(context: DecisionContext): string {
  const c = context as any;

  const remaining =
    c.landscape?.v2?.remainingUncertainties ??
    c.landscape?.v1?.remainingUncertainties ??
    [];

  const resolved = c.landscape?.v2?.resolvedUncertainties ?? [];
  const paths = c.representativePaths ?? [];

  return [
    `# Guided Decision Exploration`,
    ``,
    decisionSummary(c),
    ``,
    `The first question is no longer whether the offer is interesting. The model treats it as attractive if verified.`,
    ``,
    `## What has already been resolved?`,
    resolved.length ? resolved.map((x: string) => `- ${x}`).join("\n") : `- Nothing yet`,
    ``,
    `## What still blocks the decision?`,
    remaining.length ? remaining.map((x: string) => `- ${x}`).join("\n") : `- Nothing currently listed`,
    ``,
    `So the decision now turns on verification.`,
    ``,
    `# Representative Paths`,
    ``,
    ...paths.flatMap((path: any) => {
      const shot = c.establishingShots?.find((x: any) => x.pathId === path.id);
      const steelman = c.steelman?.find((x: any) => x.pathId === path.id);

      return [
        `## Path ${path.id} — ${path.title}`,
        ``,
        shot?.title
          ? `### Establishing Shot — ${shot.title}`
          : `### Establishing Shot`,
        shot?.shot ?? `No establishing shot has been generated for this path.`,
        ``,
        `### Strongest Case`,
        steelman?.case ?? `No steelman has been generated for this path.`,
        ``,
        steelman?.supportingConditions?.length
          ? [
              `Supporting conditions:`,
              ...steelman.supportingConditions.map((x: string) => `- ${x}`),
            ].join("\n")
          : `Supporting conditions: Not specified.`,
        ``,
      ];
    }),
    `# Event Horizon`,
    ``,
    `The important boundary is ${eventTriggerText(c.eventHorizon?.trigger)}.`,
    ``,
    `Until that boundary is crossed, the decision remains in evaluation. After it, the decision becomes harder to reverse.`,
    ``,
    `This report does not choose for you. It shows what needs to be true for each path to make sense.`,
  ].join("\n");
}