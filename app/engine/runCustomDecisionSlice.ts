// app/engine/runCustomDecisionSlice.ts

import type {
  DecisionContext,
  DecisionKind,
  DiagnosticRecommendation,
} from "./types";

import { eventHorizons } from "./eventHorizons";

function extractPrice(input: string): number | undefined {
  const match = input.match(/£\s?([\d,]+)/);

  if (!match) {
    return undefined;
  }

  return Number(match[1].replace(/,/g, ""));
}

function extractTimeHorizon(input: string): string | undefined {
  const match = input.match(/(?:for|over|next)\s+(?:the\s+)?(\d+)\s+years?/i);

  if (!match) {
    return undefined;
  }

  return `${match[1]} years`;
}
function classifyDecision(input: string): DecisionKind {
  const lower = input.toLowerCase();

  if (
    lower.includes("buy") ||
    lower.includes("purchase") ||
    lower.includes("£")
  ) {
    return "PURCHASE";
  }

  if (
    lower.includes("move") ||
    lower.includes("relocate") ||
    lower.includes("relocation") ||
    lower.includes("emigrate")
  ) {
    return "RELOCATION";
  }

  if (
    lower.includes("portfolio") ||
    lower.includes("invest") ||
    lower.includes("investment") ||
    lower.includes("retirement") ||
    lower.includes("pension")
  ) {
    return "PORTFOLIO";
  }

  return "GENERAL";
}

function cleanSubject(input: string, kind: DecisionKind): string {
  const withoutQuestion = input.replace(/\?+$/g, "").trim();

  if (kind === "PURCHASE") {
    return (
      withoutQuestion
        .replace(/^should i buy\s+/i, "")
        .replace(/^should we buy\s+/i, "")
        .replace(/^buy\s+/i, "")
        .replace(/\s+for\s+£\s?[\d,]+.*$/i, "")
        .trim() || "this purchase"
    );
  }

  if (kind === "RELOCATION") {
    const moveToMatch = withoutQuestion.match(
      /(?:move|relocate|relocation)\s+(?:to\s+)?([^,?.]+?)(?:\s+for\s+.+|\s+because\s+.+|\s+if\s+.+|$)/i
    );

    if (moveToMatch?.[1]) {
      const place = moveToMatch[1]
        .replace(/^to\s+/i, "")
        .replace(/^the\s+/i, "")
        .trim();

      if (place) {
        return `${place} relocation`;
      }
    }

    return "relocation decision";
  }

  if (kind === "PORTFOLIO") {
    const lower = withoutQuestion.toLowerCase();

    if (lower.includes("retirement")) {
      return "retirement portfolio";
    }

    if (lower.includes("pension")) {
      return "pension investment strategy";
    }

    if (lower.includes("portfolio")) {
      return "investment portfolio";
    }

    return "investment strategy";
  }

  return (
    withoutQuestion
      .replace(/^should i\s+/i, "")
      .replace(/^should we\s+/i, "")
      .replace(/^how should i\s+/i, "")
      .replace(/^how should we\s+/i, "")
      .trim() || "this decision"
  );
}

function kindLabel(kind: DecisionKind): string {
  switch (kind) {
    case "PURCHASE":
      return "purchase decision";
    case "RELOCATION":
      return "relocation decision";
    case "PORTFOLIO":
      return "portfolio decision";
    default:
      return "general decision";
  }
}

function buildPaths(subject: string, kind: DecisionKind) {
  if (kind === "PURCHASE") {
    return [
      {
        id: "A" as const,
        title: `Buy ${subject}`,
        requiredConditions: [
          "The price is fair for the condition and market.",
          "The seller and history checks do not reveal major concerns.",
          "The downside is acceptable if the purchase proves disappointing.",
        ],
        commitment: {
          type: "purchase",
          amount: 0,
          currency: "GBP" as const,
        },
        outcome: `You commit to buying ${subject}.`,
      },
      {
        id: "B" as const,
        title: `Do not buy ${subject}`,
        requiredConditions: [
          "The evidence is not strong enough to justify the commitment.",
          "Waiting preserves flexibility.",
          "There may be better verified alternatives later.",
        ],
        commitment: {
          type: "avoid_purchase",
          amount: 0,
          currency: "GBP" as const,
        },
        outcome: `You do not buy ${subject}.`,
      },
    ];
  }

  if (kind === "RELOCATION") {
    return [
      {
        id: "A" as const,
        title: "Make the move",
        requiredConditions: [
          "The household can adapt to the new location.",
          "The financial and practical commitments are acceptable.",
          "The move supports the main reason for relocating.",
        ],
        commitment: {
          type: "relocation",
          amount: 0,
          currency: "GBP" as const,
        },
        outcome: "You commit to the relocation path.",
      },
      {
        id: "B" as const,
        title: "Do not move",
        requiredConditions: [
          "The relocation benefits are not strong enough.",
          "The disruption or risk is too high.",
          "Remaining in place preserves a better base case.",
        ],
        commitment: {
          type: "stay_put",
          amount: 0,
          currency: "GBP" as const,
        },
        outcome: "You do not relocate.",
      },
    ];
  }

  if (kind === "PORTFOLIO") {
    return [
      {
        id: "A" as const,
        title: "Choose a growth-oriented portfolio",
        requiredConditions: [
          "The time horizon is long enough for volatility.",
          "The downside risk is tolerable.",
          "The allocation can be held through difficult periods.",
        ],
        commitment: {
          type: "portfolio_allocation",
          amount: 0,
          currency: "GBP" as const,
        },
        outcome: "You choose a growth-oriented allocation.",
      },
      {
        id: "B" as const,
        title: "Choose a simpler balanced portfolio",
        requiredConditions: [
          "Simplicity is more valuable than maximum expected growth.",
          "The allocation remains diversified.",
          "The expected return is sufficient for the goal.",
        ],
        commitment: {
          type: "portfolio_allocation",
          amount: 0,
          currency: "GBP" as const,
        },
        outcome: "You choose a balanced allocation.",
      },
      {
        id: "C" as const,
        title: "Choose a more cautious portfolio",
        requiredConditions: [
          "Capital preservation matters more than higher expected return.",
          "The lower-risk allocation still supports the objective.",
          "Reduced volatility is worth the growth trade-off.",
        ],
        commitment: {
          type: "portfolio_allocation",
          amount: 0,
          currency: "GBP" as const,
        },
        outcome: "You choose a more cautious allocation.",
      },
    ];
  }

  return [
    {
      id: "A" as const,
      title: "Make the change",
      requiredConditions: [
        "The upside is clear enough.",
        "The downside is acceptable.",
        "The change remains reversible or manageable.",
      ],
      commitment: {
        type: "generic_change",
        amount: 0,
        currency: "GBP" as const,
      },
      outcome: "You make the change.",
    },
    {
      id: "B" as const,
      title: "Do not make the change",
      requiredConditions: [
        "The case for change is not yet strong enough.",
        "Waiting preserves flexibility.",
        "The current path remains acceptable.",
      ],
      commitment: {
        type: "generic_no_change",
        amount: 0,
        currency: "GBP" as const,
      },
      outcome: "You do not make the change.",
    },
  ];
}

function buildEstablishingShots(kind: DecisionKind) {
  if (kind === "PURCHASE") {
    return [
      {
        pathId: "A" as const,
        title: "The purchase becomes ordinary",
        shot:
          "You are using the thing you bought on an ordinary day. The payment has already happened, the initial excitement has faded, and what remains is whether the purchase genuinely fits your life.",
      },
      {
        pathId: "B" as const,
        title: "The money remains available",
        shot:
          "The purchase did not happen. Nothing new has arrived, nothing needs resolving, and the money remains available for other priorities or a better-verified opportunity.",
      },
    ];
  }

  if (kind === "RELOCATION") {
    return [
      {
        pathId: "A" as const,
        title: "The move becomes normal life",
        shot:
          "You are walking through an ordinary week in the new place. The move is no longer a proposal; it is the setting in which work, routines, friendships, and household life now happen.",
      },
      {
        pathId: "B" as const,
        title: "The life you kept",
        shot:
          "You are still living in the familiar place. The routines, rooms, routes, and obligations remain recognisable. The possible move still exists, but as a path not taken.",
      },
    ];
  }

  if (kind === "PORTFOLIO") {
    return [
      {
        pathId: "A" as const,
        title: "The growth line with volatility",
        shot:
          "You are looking at a long-term investment statement. The value has grown, but the chart is uneven, with falls along the way that had to be lived through.",
      },
      {
        pathId: "B" as const,
        title: "The plan held",
        shot:
          "You are looking at a long-term investment statement. The result is not spectacular, but the plan remained understandable and sustainable through changing markets.",
      },
      {
        pathId: "C" as const,
        title: "The quieter statement",
        shot:
          "You are looking at a long-term investment statement. The fluctuations were smaller, the outcome was more modest, and the portfolio rarely dominated your attention.",
      },
    ];
  }

  return [
    {
      pathId: "A" as const,
      title: "The change becomes real",
      shot:
        "You are living with the consequences of making the change. It is no longer theoretical; it has become part of the ordinary shape of your week.",
    },
    {
      pathId: "B" as const,
      title: "The current path continues",
      shot:
        "You are living with the decision not to change. The situation remains recognisable, and the disruption of changing course has not happened.",
    },
  ];
}

function buildSteelman(kind: DecisionKind) {
  if (kind === "PURCHASE") {
    return [
      {
        pathId: "A" as const,
        objective: "Capture a worthwhile opportunity",
        case:
          "The strongest case for buying is that the item may represent good value if the seller is legitimate, the condition is clean, the price is fair, and the downside is limited by warranty, inspection, or buyer protection.",
        supportingConditions: [
          "Seller legitimacy can be confirmed",
          "Condition is satisfactory",
          "Price compares well with realistic alternatives",
          "Payment or return route gives reasonable protection",
        ],
      },
      {
        pathId: "B" as const,
        objective: "Preserve flexibility",
        case:
          "The strongest case for not buying is that an attractive purchase can become a bad decision if verification is weak. Keeping the money preserves flexibility and avoids being forced into solving problems after payment.",
        supportingConditions: [
          "Verification remains incomplete",
          "Condition or history is uncertain",
          "Price advantage is unclear",
          "Money may be better used elsewhere",
        ],
      },
    ];
  }

  if (kind === "RELOCATION") {
    return [
      {
        pathId: "A" as const,
        objective: "Accept a major life opportunity",
        case:
          "The strongest case for moving is that the opportunity may improve work, household prospects, and life experience if the practical route is viable and the family can genuinely inhabit the move.",
        supportingConditions: [
          "Employment route is credible",
          "Housing and schooling can be made workable",
          "Household stress is manageable",
          "The move has a plausible return or exit route",
        ],
      },
      {
        pathId: "B" as const,
        objective: "Preserve stability",
        case:
          "The strongest case for not moving is that a relocation can impose disruption across work, family, schooling, housing, and identity. Staying avoids converting an attractive opportunity into an all-consuming transition.",
        supportingConditions: [
          "Current life remains viable",
          "Disruption risk is high",
          "Family route is uncertain",
          "The upside does not clearly justify the transition cost",
        ],
      },
    ];
  }

  if (kind === "PORTFOLIO") {
    return [
      {
        pathId: "A" as const,
        objective: "Maximise long-term growth",
        case:
          "The strongest case for a growth-oriented portfolio is that a long time horizon can justify accepting volatility in pursuit of higher expected returns.",
        supportingConditions: [
          "Time horizon is long enough",
          "Drawdowns can be tolerated",
          "Liquidity needs are covered elsewhere",
          "The plan can be held through difficult markets",
        ],
      },
      {
        pathId: "B" as const,
        objective: "Balance growth and sustainability",
        case:
          "The strongest case for a simpler balanced portfolio is that it may capture enough growth while being easier to understand, maintain, and stick with.",
        supportingConditions: [
          "Expected return is adequate",
          "Complexity is reduced",
          "Behavioural risk is lower",
          "Rebalancing is manageable",
        ],
      },
      {
        pathId: "C" as const,
        objective: "Reduce regret and volatility",
        case:
          "The strongest case for a cautious portfolio is that avoiding large drawdowns may matter more than maximising upside, especially if the money has a near-term purpose.",
        supportingConditions: [
          "Capital preservation matters",
          "Volatility would cause harmful behaviour",
          "The time horizon is shorter or uncertain",
          "Lower return is acceptable",
        ],
      },
    ];
  }

  return [
    {
      pathId: "A" as const,
      objective: "Make the change",
      case:
        "The strongest case for acting is that the current situation may not improve without a deliberate change, and the chosen path may open up a better future state.",
      supportingConditions: [
        "The upside is meaningful",
        "The risks are understood",
        "The next step is reversible enough",
      ],
    },
    {
      pathId: "B" as const,
      objective: "Avoid unnecessary disruption",
      case:
        "The strongest case for not acting is that change can create avoidable cost, stress, and complexity when the current path remains workable.",
      supportingConditions: [
        "The current path remains acceptable",
        "The downside of acting is unclear",
        "More information would materially improve the decision",
      ],
    },
  ];
}

function remainingUncertainties({
  kind,
  subject,
  price,
  timeHorizon,
}: {
  kind: DecisionKind;
  subject: string;
  price?: number;
  timeHorizon?: string;
}): string[] {
  if (kind === "PURCHASE") {
    return [
      price
        ? `Whether £${price.toLocaleString("en-GB")} is attractive relative to comparable ${subject} alternatives`
        : `Whether the price is attractive relative to comparable ${subject} alternatives`,
      "Seller legitimacy",
      "Condition, history, or hidden defect risk",
      "Warranty, inspection, or return route",
    ];
  }

  if (kind === "RELOCATION") {
    return [
      `Whether ${subject} is practically workable for the household`,
      "Employment terms and dependency risk",
      "Housing route",
      "Schooling or family adaptation route",
      "Exit or return route",
    ];
  }

  if (kind === "PORTFOLIO") {
    return [
      timeHorizon
        ? `Whether the ${timeHorizon} horizon supports the desired level of risk`
        : "Whether the time horizon supports the desired level of risk",
      "Risk tolerance under drawdown",
      "Liquidity and cash reserve requirements",
      "Tax wrapper sequencing",
      "Implementation plan",
    ];
  }

  return [
    `What would make ${subject} worthwhile`,
    `What could make ${subject} fail`,
    "What information is still missing",
    "How reversible the first serious commitment would be",
  ];
}
function diagnosticRecommendations(
  kind: DecisionKind
): DiagnosticRecommendation[] {
  if (kind === "PURCHASE") {
    return [
      {
        id: "market_price_comparison",
        name: "Market price comparison",
        uncertaintyClass: "price_value",
        reason:
          "Tests whether the apparent deal is genuinely attractive compared with realistic alternatives.",
        inputsNeeded: [
          "Exact model or item specification",
          "Comparable listings",
          "Condition",
          "Age or mileage if relevant",
        ],
        status: "manual",
      },
      {
        id: "seller_counterparty_check",
        name: "Seller / counterparty check",
        uncertaintyClass: "counterparty_risk",
        reason:
          "Tests whether the person or business on the other side of the transaction is trustworthy enough to proceed.",
        inputsNeeded: [
          "Seller identity",
          "Reviews or reputation",
          "Payment route",
          "Collection or delivery terms",
        ],
        status: "manual",
      },
      {
        id: "condition_history_check",
        name: "Condition and history check",
        uncertaintyClass: "condition_quality",
        reason:
          "Tests whether hidden defects, missing history, or poor condition could turn a good-looking purchase into a bad one.",
        inputsNeeded: [
          "Inspection evidence",
          "Photos or video",
          "Service or ownership history",
          "Known faults",
        ],
        status: "manual",
      },
      {
        id: "reversibility_warranty_check",
        name: "Reversibility / warranty check",
        uncertaintyClass: "reversibility",
        reason:
          "Tests what protection exists if the purchase turns out to be wrong after money changes hands.",
        inputsNeeded: [
          "Return policy",
          "Warranty terms",
          "Buyer protection",
          "Payment method",
        ],
        status: "manual",
      },
    ];
  }

  if (kind === "RELOCATION") {
    return [
      {
        id: "household_feasibility_check",
        name: "Household feasibility check",
        uncertaintyClass: "household_adaptation",
        reason:
          "Tests whether the move can work as a lived household arrangement, not just as an attractive opportunity.",
        inputsNeeded: [
          "Family constraints",
          "Schooling needs",
          "Work patterns",
          "Housing assumptions",
        ],
        status: "manual",
      },
      {
        id: "exit_route_test",
        name: "Exit-route test",
        uncertaintyClass: "reversibility",
        reason:
          "Tests how hard it would be to unwind the move if the path becomes unworkable.",
        inputsNeeded: [
          "Notice periods",
          "Housing commitments",
          "School commitments",
          "Return options",
        ],
        status: "manual",
      },
      {
        id: "cost_of_living_comparison",
        name: "Cost-of-living comparison",
        uncertaintyClass: "cashflow_sustainability",
        reason:
          "Tests whether the financial upside survives realistic housing, schooling, tax, travel, and living costs.",
        inputsNeeded: [
          "Net income",
          "Housing costs",
          "Schooling costs",
          "Tax position",
          "Living costs",
        ],
        status: "manual",
      },
      {
        id: "school_work_route_check",
        name: "School/work route check",
        uncertaintyClass: "logistical_feasibility",
        reason:
          "Tests whether the daily route through work, school, commute, and household life is practically viable.",
        inputsNeeded: [
          "Work location",
          "School options",
          "Commute routes",
          "Term dates or start dates",
        ],
        status: "manual",
      },
    ];
  }

  if (kind === "PORTFOLIO") {
    return [
      {
        id: "rolling_window_outcome_test",
        name: "Rolling-window outcome test",
        uncertaintyClass: "sequence_risk",
        reason:
          "Tests how the portfolio would have behaved across many possible holding-period start dates rather than one cherry-picked backtest.",
        inputsNeeded: [
          "Asset allocation",
          "Historical return data",
          "Holding period",
          "Starting capital",
        ],
        status: "future",
      },
      {
        id: "drawdown_tolerance_test",
        name: "Drawdown tolerance test",
        uncertaintyClass: "volatility_tolerance",
        reason:
          "Tests whether the user could realistically stay with the portfolio through severe temporary losses.",
        inputsNeeded: [
          "Portfolio allocation",
          "Historical or modelled drawdowns",
          "User loss-tolerance threshold",
        ],
        status: "future",
      },
      {
        id: "liquidity_cashflow_check",
        name: "Liquidity and cashflow check",
        uncertaintyClass: "liquidity_need",
        reason:
          "Tests whether enough cash or low-volatility assets exist outside the growth portfolio to avoid forced selling.",
        inputsNeeded: [
          "Emergency fund",
          "Known spending needs",
          "Income sources",
          "Withdrawal timing",
        ],
        status: "manual",
      },
      {
        id: "tax_wrapper_sequencing_check",
        name: "Tax wrapper sequencing check",
        uncertaintyClass: "tax_efficiency",
        reason:
          "Tests whether ISA, pension, and taxable account sequencing materially changes the best implementation route.",
        inputsNeeded: [
          "Account types",
          "Tax allowances",
          "Contribution limits",
          "Current holdings",
        ],
        status: "manual",
      },
    ];
  }

  return [
    {
      id: "reversibility_check",
      name: "Reversibility check",
      uncertaintyClass: "reversibility",
      reason:
        "Tests how hard it would be to reverse the decision after the first serious commitment.",
      inputsNeeded: [
        "First commitment point",
        "Exit options",
        "Costs of reversal",
        "People affected",
      ],
      status: "manual",
    },
    {
      id: "opportunity_cost_check",
      name: "Opportunity cost check",
      uncertaintyClass: "opportunity_cost",
      reason:
        "Tests what the chosen path would displace in money, attention, time, or emotional capacity.",
      inputsNeeded: [
        "Resources required",
        "Alternative uses",
        "Time cost",
        "Financial cost",
      ],
      status: "manual",
    },
  ];
}
function resolvedUncertainties({
  kind,
  subject,
  price,
  timeHorizon,
}: {
  kind: DecisionKind;
  subject: string;
  price?: number;
  timeHorizon?: string;
}): string[] {
  const resolved = [
    `Decision type: ${kind.toLowerCase()}`,
    `Subject: ${subject}`,
  ];

  if (kind === "PURCHASE" && price) {
    resolved.push(`Approximate price: £${price.toLocaleString("en-GB")}`);
  }

  if (kind === "PORTFOLIO" && timeHorizon) {
    resolved.push(`Time horizon mentioned: ${timeHorizon}`);
  }

  return resolved;
}

export async function runCustomDecisionSlice(input: string): Promise<DecisionContext> {
  const kind = classifyDecision(input);
  const subject = cleanSubject(input, kind);
  const price = extractPrice(input);
  const timeHorizon = extractTimeHorizon(input);

  let context: DecisionContext = {
    prompt: input,

    decision: {
      subject,
      kind,
      commitment:
        kind === "PURCHASE"
          ? `Buy ${subject} if the offer, condition, seller, and payment route verify cleanly.`
          : `Proceed with ${subject} only if the main practical and emotional conditions can be satisfied.`,
      price:
        kind === "PURCHASE" && price
          ? {
              amount: price,
              currency: "GBP",
            }
          : undefined,
    },

    facts: {
      userStated: {
        subject,
        price:
          price && kind === "PURCHASE"
            ? {
                amount: price,
                currency: "GBP",
              }
            : undefined,
      },
      assumedForSlice: {
        source: "custom_decision_input",
        kind,
      },
    },

    panel: {},

    presentation: {
      decisionStateSummary: `This is a first-pass ${kindLabel(
        kind
      )} created from the user’s input.`,
      decisionTurn:
        "So the decision now turns on the unresolved issues that would most change the quality of the choice.",
    },
    landscape: {
      v2: {
        subject,
        commitment: "Choose the most appropriate path for this decision.",
        decisionAxes: [
          "Expected benefit",
          "Downside risk",
          "Reversibility",
          "Evidence quality",
        ],
        resolvedUncertainties: resolvedUncertainties({
          kind,
          subject,
          price,
          timeHorizon,
        }),
        remainingUncertainties: remainingUncertainties({
          kind,
          subject,
          price,
          timeHorizon,
        }),
        state: "NARROWED",
      },
    },

    representativePaths: buildPaths(subject, kind),

    establishingShots: buildEstablishingShots(kind),

    steelman: buildSteelman(kind),

    diagnostics: diagnosticRecommendations(kind),
  };

  context = await eventHorizons(context);

  return context;
}


