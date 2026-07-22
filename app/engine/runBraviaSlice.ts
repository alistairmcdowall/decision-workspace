import { reframer } from "./reframer";
import { landscape } from "./landscape";
import { guardian } from "./guardian";
import { pragmatist } from "./pragmatist";
import { empathiser } from "./empathiser";
import { auditor } from "./auditor";
import { paths } from "./paths";
import { eventHorizons } from "./eventHorizons";
import { establishingShots } from "./establishingShots";
import { steelman } from "./steelman";
import { clarifier } from "./clarifier";
import { clarifierResponse } from "./clarifierResponse";
import type { DecisionContext } from "./types";

function buildInitialContext(): DecisionContext {
  return {
    prompt: "Should I buy the Sony Bravia 9 II for £2,000?",
    decision: {
      subject: "Sony Bravia 9 II",
      kind: "PURCHASE",
      commitment: "Buy the television if seller, condition, warranty and payment route verify cleanly.",
      price: {
        amount: 2000,
        currency: "GBP",
      },
    },
    facts: {
      userStated: {
        subject: "Sony Bravia 9 II",
        price: {
          amount: 2000,
          currency: "GBP",
        },
      },
      assumedForSlice: {
        marketClass: "premium_flagship",
      },
    },
    panel: {},

    presentation: {
      decisionStateSummary:
        "The first question is no longer whether the offer is interesting. The model treats it as attractive if verified.",
      decisionTurn: "So the decision now turns on verification.",
    },
  };
}

async function rerunPanelAndAuditor(context: DecisionContext): Promise<DecisionContext> {
  const [guardianResult, pragmatistResult, empathiserResult] = await Promise.all([
    guardian(context),
    pragmatist(context),
    empathiser(context),
  ]);

  let updated: DecisionContext = {
    ...context,
    panel: {
      ...guardianResult.panel,
      ...pragmatistResult.panel,
      ...empathiserResult.panel,
    },
  };

  updated = await auditor(updated);
  return updated;
}

async function finishBraviaSlice(context: DecisionContext): Promise<DecisionContext> {
  let c = await paths(context);
  c = await eventHorizons(c);

  const [shotsResult, steelmanResult] = await Promise.all([
    establishingShots(c),
    steelman(c),
  ]);

  return {
    ...c,
    establishingShots: shotsResult.establishingShots,
    steelman: steelmanResult.steelman,
  };
}

// Phase 1: everything up to and including generating the FIRST clarifying question.
export async function runBraviaSlicePhase1(initialContext?: DecisionContext): Promise<DecisionContext> {
  let context = initialContext ?? buildInitialContext();

  context = await reframer(context);
  context = await landscape(context); // V1

  const [guardianResult, pragmatistResult, empathiserResult] = await Promise.all([
    guardian(context),
    pragmatist(context),
    empathiser(context),
  ]);

  context = {
    ...context,
    panel: {
      ...guardianResult.panel,
      ...pragmatistResult.panel,
      ...empathiserResult.panel,
    },
  };

  context = await auditor(context);
  context = await clarifier(context);

  return context;
}

export type Phase2Result =
  | { status: "awaiting_second_answer"; context: DecisionContext }
  | { status: "complete"; context: DecisionContext };

// Phase 2: answers round 1, re-evaluates everything, and checks whether a
// genuine second round is warranted. If not, finishes the whole report here.
export async function runBraviaSlicePhase2(
  contextFromPhase1: DecisionContext,
  selectedAnswer: string
): Promise<Phase2Result> {
  let context = await clarifierResponse(contextFromPhase1, selectedAnswer);

  context = {
    ...context,
    clarifierHistory: [
      ...(contextFromPhase1.clarifierHistory ?? []),
      {
        question: contextFromPhase1.clarifier?.question ?? "",
        answerOptions: contextFromPhase1.clarifier?.answerOptions ?? [],
        selectedAnswer,
        effect: context.clarifierResponse?.effect ?? "",
        resolutionState: context.clarifierResponse?.resolutionState ?? "RESOLVED",
      },
    ],
  };

  context = await landscape(context); // narrows using the most recent state
  context = await rerunPanelAndAuditor(context);
  context = await clarifier(context, true); // genuine round-2 check

  if (context.clarifier?.hasQuestion === false) {
    const finished = await finishBraviaSlice(context);
    return { status: "complete", context: finished };
  }

  return { status: "awaiting_second_answer", context };
}

// Phase 3: answers round 2. Hard cap of 2 rounds - no further check, always finishes.
export async function runBraviaSlicePhase3(
  contextFromPhase2: DecisionContext,
  secondAnswer: string
): Promise<DecisionContext> {
  let context = await clarifierResponse(contextFromPhase2, secondAnswer);

  context = {
    ...context,
    clarifierHistory: [
      ...(contextFromPhase2.clarifierHistory ?? []),
      {
        question: contextFromPhase2.clarifier?.question ?? "",
        answerOptions: contextFromPhase2.clarifier?.answerOptions ?? [],
        selectedAnswer: secondAnswer,
        effect: context.clarifierResponse?.effect ?? "",
        resolutionState: context.clarifierResponse?.resolutionState ?? "RESOLVED",
      },
    ],
  };

  context = await landscape(context); // narrows further from the current state
  return await finishBraviaSlice(context);
}