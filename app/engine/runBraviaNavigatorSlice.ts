// app/engine/runBraviaNavigatorSlice.ts

import { runBraviaSlicePhase1, runBraviaSlicePhase2, runBraviaSlicePhase3 } from "./runBraviaSlice";
import type { DecisionContext } from "./types";

export async function runBraviaNavigatorSlice(): Promise<DecisionContext> {
  const phase1Context = await runBraviaSlicePhase1();

  // TEMPORARY placeholder until real UI collects an actual user selection -
  // same approach used elsewhere in the pipeline until the Clarifier UI exists.
  const options1 = phase1Context.clarifier?.answerOptions ?? [];
  const placeholder1 =
    options1.find((o) => !o.toLowerCase().includes("not sure")) ?? options1[0] ?? "";

  const phase2Result = await runBraviaSlicePhase2(phase1Context, placeholder1);

  let context: DecisionContext;

  if (phase2Result.status === "complete") {
    context = phase2Result.context;
  } else {
    const options2 = phase2Result.context.clarifier?.answerOptions ?? [];
    const placeholder2 =
      options2.find((o) => !o.toLowerCase().includes("not sure")) ?? options2[0] ?? "";

    context = await runBraviaSlicePhase3(phase2Result.context, placeholder2);
  }

  return {
    ...context,

    navigator: {
      pathSelected: "Buy the Bravia",
      status: "Pre-payment verification",
      scale: "CHECKLIST",

      summary:
        "This is a straightforward purchase. You do not need a complicated plan; you need to confirm the few things that could make the purchase difficult to unwind after payment.",

      sections: [
        {
          title: "Key checks before payment",
          items: [
            "Confirm the exact model, screen size, year/generation, included accessories, and whether it is new, refurbished, ex-display, or used.",
            "Confirm retailer or seller identity and check reviews or reputation.",
            "Use a payment method with buyer protection where possible.",
            "Confirm warranty status, return window, return shipping policy, and defect coverage on arrival.",
            "If used or ex-display, inspect or request current photos or video showing panel condition, ports, remote, stand, and casing.",
            "Measure the intended space, TV stand or wall mount, and confirm delivery or collection arrangements.",
          ],
        },
      ],

      pauseBeforeProceedingIf: [
        "Seller legitimacy cannot be confirmed.",
        "Payment has no protection and you cannot inspect the TV first.",
        "Warranty or return position is unclear.",
        "Physical condition cannot be verified.",
        "The TV does not fit the intended space.",
      ],

      nextAction:
        "Verify seller, exact model, condition, warranty or return position, and payment route before transferring money.",
    },
  };
}