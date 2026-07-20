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
import type { DecisionContext } from "./types";

export async function runBraviaSlice(): Promise<DecisionContext> {
  let context: DecisionContext = {
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
        pricePosition: "materially_below_expected_market",
      },
    },
    panel: {},

    presentation: {
      decisionStateSummary:
        "The first question is no longer whether the offer is interesting. The model treats it as attractive if verified.",
      decisionTurn: "So the decision now turns on verification.",
    },
  };

  context = await reframer(context);
  context = await landscape(context); // V1

  // Guardian, Pragmatist, and Empathiser are independent of each other - run in parallel.
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

  // Two independent branches from here:
  // - Auditor only needs Guardian/Pragmatist/Empathiser (already available).
  // - Paths needs Landscape V2 (which needs the clarifier answer) and Pragmatist (already available).
  // Neither branch needs the other's output, so they run in parallel.
  async function runAuditorBranch(ctx: DecisionContext): Promise<DecisionContext> {
    return await auditor(ctx);
  }

  async function runPathsBranch(ctx: DecisionContext): Promise<DecisionContext> {
    let c = clarifier(ctx); // still fixture, synchronous

    c = {
      ...c,
      clarifierResponse: {
        answer:
          "Yes. If the offer is genuine, fully warranted and free from hidden condition issues, I would feel comfortable buying it.",
        effect: "Purchase willingness resolved",
      },
    };

    c = await landscape(c); // V2
    c = await paths(c);
    c = eventHorizons(c); // synchronous, no real API call

    return c;
  }

  const [auditorBranch, pathsBranch] = await Promise.all([
    runAuditorBranch(context),
    runPathsBranch(context),
  ]);

  context = {
    ...pathsBranch, // carries clarifier, clarifierResponse, landscape v2, representativePaths, eventHorizon
    auditor: auditorBranch.auditor,
  };

  // Final stage: Establishing Shots and Steelman are also independent of each other -
  // Establishing Shots needs Paths/Landscape/Event Horizon; Steelman needs Paths/Landscape/panel/Auditor.
  const [shotsResult, steelmanResult] = await Promise.all([
    establishingShots(context),
    steelman(context),
  ]);

  context = {
    ...context,
    establishingShots: shotsResult.establishingShots,
    steelman: steelmanResult.steelman,
  };

  return context;
}