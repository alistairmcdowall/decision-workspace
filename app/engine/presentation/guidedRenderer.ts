// app/engine/presentation/guidedRenderer.ts

import type { DecisionContext } from "../types";

function eventTriggerText(trigger: string | undefined): string {
  switch (trigger) {
    case "purchase_irreversible":
      return "payment, or any point where the purchase can no longer realistically be reversed";

    case "acceptance_of_binding_relocation_commitments":
      return "accepting binding relocation commitments, such as resignation, school withdrawal, housing commitments, or major relocation spending";

    case "portfolio_allocation_commitment":
      return "placing the major allocation trades, especially once existing holdings are sold and the portfolio is materially repositioned";
    default:
      return trigger ?? "not specified";
  }
}

function decisionSummary(c: any): string {
  const decision = c.decision;

  if (decision?.kind === "PURCHASE" && decision.price?.amount > 0) {
    return `The decision is whether to buy ${decision.subject} for £${decision.price.amount.toLocaleString("en-GB")}.`;
  }

  if (decision?.subject) {
    return `The decision concerns ${decision.subject}.`;
  }

  const price = c.facts?.userStated?.price ?? c.facts?.price;

  if (price && price.amount > 0) {
    const purchaseSubject =
      c.facts?.userStated?.subject ??
      c.facts?.subject ??
      c.landscape?.v2?.subject ??
      c.landscape?.v1?.subject ??
      "this item";

    return `The decision is whether to buy ${purchaseSubject} for £${price.amount.toLocaleString("en-GB")}.`;
  }

  const subject =
    c.landscape?.v2?.subject ??
    c.landscape?.v1?.subject ??
    c.facts?.userStated?.subject ??
    c.facts?.subject ??
    "this decision";

  return `The decision concerns ${subject}.`;
}


function renderNavigator(c: any): string[] {
  if (!c.navigator) {
    return [];
  }

  const navigator = c.navigator;

  return [
    `# Navigator`,
    ``,
    `**Path selected:** ${navigator.pathSelected}`,
    ``,
    `**Status:** ${navigator.status}`,
    ``,
    navigator.summary,
    ``,
    ...navigator.sections.flatMap((section: any) => [
      `## ${section.title}`,
      ``,
      ...section.items.map((item: string) => `- ${item}`),
      ``,
    ]),
    ...(navigator.pauseBeforeProceedingIf?.length
      ? [
          `## Pause before proceeding if`,
          ``,
          ...navigator.pauseBeforeProceedingIf.map((item: string) => `- ${item}`),
          ``,
        ]
      : []),
    ...(navigator.nextAction
      ? [
          `## Next action`,
          ``,
          navigator.nextAction,
          ``,
        ]
      : []),
  ];
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
    c.presentation?.decisionStateSummary ??
  `The model has narrowed the decision to the issues that now matter most.`,
    ``,
    `## What has already been resolved?`,
    resolved.length ? resolved.map((x: string) => `- ${x}`).join("\n") : `- Nothing yet`,
    ``,
    `## What still blocks the decision?`,
    remaining.length ? remaining.map((x: string) => `- ${x}`).join("\n") : `- Nothing currently listed`,
    ``,
    c.presentation?.decisionTurn ??
    `So the decision now turns on the remaining unresolved issues.`,
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
    `The important boundary is ${
      c.eventHorizon?.label ?? eventTriggerText(c.eventHorizon?.trigger)
    }.`,
    ``,
    c.eventHorizon?.explanation ??
      `Until that boundary is crossed, the decision remains in evaluation. After it, the decision becomes harder to reverse.`,
    ``,
    ...renderNavigator(c),
    c.navigator
    ? `Navigator does not reopen the decision. It shows the next practical steps for the selected path.`
    : `This report does not choose for you. It shows what needs to be true for each path to make sense.`,
  ].join("\n");
}