// app/engine/runBraviaNavigatorSlice.ts

import { runBraviaSlice } from "./runBraviaSlice";
import type { DecisionContext } from "./types";

export async function runBraviaNavigatorSlice(): Promise<DecisionContext> {
  const context = await runBraviaSlice();

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