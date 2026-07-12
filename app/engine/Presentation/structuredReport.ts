// app/engine/presentation/structuredReport.ts

import type { DecisionContext } from "../types";

export type StructuredReport = {
  title: string;
  mode: "exploration" | "execution";
  decisionKind: string;
  selectedPath?: string;
  executionStatus?: string;
  summary: string;
  resolved: string[];
  remaining: string[];
  decisionTurn: string;
  paths: StructuredPath[];
  eventHorizon?: {
    label: string;
    explanation: string;
  };
  navigator?: StructuredNavigator;
  closingNote: string;
};

export type StructuredPath = {
  id: string;
  title: string;
  establishingShotTitle?: string;
  establishingShot: string;
  strongestCase: string;
  supportingConditions: string[];
};

export type StructuredNavigator = {
  pathSelected: string;
  status: string;
  summary: string;
  sections: {
    title: string;
    items: string[];
  }[];
  pauseBeforeProceedingIf: string[];
  nextAction?: string;
};

function decisionSummary(c: any): string {
  const decision = c.decision;

  if (decision?.kind === "PURCHASE" && decision.price?.amount > 0) {
    return `The decision is whether to buy ${decision.subject} for £${decision.price.amount.toLocaleString("en-GB")}.`;
  }

  if (decision?.subject) {
    return `The decision concerns ${decision.subject}.`;
  }

  return "The decision concerns this decision.";
}

function fallbackEventHorizonLabel(trigger: string | undefined): string {
  switch (trigger) {
    case "purchase_irreversible":
      return "payment, or any point where the purchase can no longer realistically be reversed";

    case "acceptance_of_binding_relocation_commitments":
      return "accepting binding relocation commitments, such as resignation, school withdrawal, housing commitments, or major relocation spending";

    case "portfolio_allocation_commitment":
      return "placing the major allocation trades, especially once existing holdings are sold and the portfolio is materially repositioned";

    default:
      return trigger ?? "the point where the chosen path becomes meaningfully harder to reverse";
  }
}

export function buildStructuredReport(
  context: DecisionContext
): StructuredReport {
  const c = context as any;

  const remaining =
    c.landscape?.v2?.remainingUncertainties ??
    c.landscape?.v1?.remainingUncertainties ??
    [];

  const resolved = c.landscape?.v2?.resolvedUncertainties ?? [];
  const paths = c.representativePaths ?? [];

  return {
    title: "Guided Decision Exploration",

    mode: c.navigator ? "execution" : "exploration",

    decisionKind: c.decision?.kind ?? "GENERAL",

    selectedPath: c.navigator?.pathSelected,

    executionStatus: c.navigator?.status,

    summary: decisionSummary(c),
    resolved,

    remaining,

    decisionTurn:
      c.presentation?.decisionTurn ??
      "So the decision now turns on the remaining unresolved issues.",

    paths: paths.map((path: any) => {
      const shot = c.establishingShots?.find((x: any) => x.pathId === path.id);
      const steelman = c.steelman?.find((x: any) => x.pathId === path.id);

      return {
        id: path.id,
        title: path.title,
        establishingShotTitle: shot?.title,
        establishingShot:
          shot?.shot ?? "No establishing shot has been generated for this path.",
        strongestCase:
          steelman?.case ?? "No steelman has been generated for this path.",
        supportingConditions: steelman?.supportingConditions ?? [],
      };
    }),

    eventHorizon: c.eventHorizon
      ? {
          label:
            c.eventHorizon.label ??
            fallbackEventHorizonLabel(c.eventHorizon.trigger),
          explanation:
            c.eventHorizon.explanation ??
            "Until that boundary is crossed, the decision remains in evaluation. After it, the decision becomes harder to reverse.",
        }
      : undefined,

    navigator: c.navigator
      ? {
          pathSelected: c.navigator.pathSelected,
          status: c.navigator.status,
          summary: c.navigator.summary,
          sections: c.navigator.sections ?? [],
          pauseBeforeProceedingIf: c.navigator.pauseBeforeProceedingIf ?? [],
          nextAction: c.navigator.nextAction,
        }
      : undefined,

    closingNote: c.navigator
      ? "Navigator does not reopen the decision. It shows the next practical steps for the selected path."
      : "This report does not choose for you. It shows what needs to be true for each path to make sense.",
  };
}