// app/engine/runCustomDecisionSlice.ts

import type { DecisionContext, DecisionKind } from "./types";
import { eventHorizons } from "./eventHorizons";

function extractPrice(input: string): number | undefined {
  const match = input.match(/£\s?([\d,]+)/);

  if (!match) {
    return undefined;
  }

  return Number(match[1].replace(/,/g, ""));
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
        id: "A",
        title: `Buy ${subject}`,
      },
      {
        id: "B",
        title: `Do not buy ${subject}`,
      },
    ];
  }

  if (kind === "RELOCATION") {
    return [
      {
        id: "A",
        title: "Make the move",
      },
      {
        id: "B",
        title: "Do not move",
      },
    ];
  }

  if (kind === "PORTFOLIO") {
    return [
      {
        id: "A",
        title: "Choose a growth-oriented portfolio",
      },
      {
        id: "B",
        title: "Choose a simpler balanced portfolio",
      },
      {
        id: "C",
        title: "Choose a more cautious portfolio",
      },
    ];
  }

  return [
    {
      id: "A",
      title: "Make the change",
    },
    {
      id: "B",
      title: "Do not make the change",
    },
  ];
}

function buildEstablishingShots(kind: DecisionKind) {
  if (kind === "PURCHASE") {
    return [
      {
        pathId: "A",
        title: "The purchase becomes ordinary",
        shot:
          "You are using the thing you bought on an ordinary day. The payment has already happened, the initial excitement has faded, and what remains is whether the purchase genuinely fits your life.",
      },
      {
        pathId: "B",
        title: "The money remains available",
        shot:
          "The purchase did not happen. Nothing new has arrived, nothing needs resolving, and the money remains available for other priorities or a better-verified opportunity.",
      },
    ];
  }

  if (kind === "RELOCATION") {
    return [
      {
        pathId: "A",
        title: "The move becomes normal life",
        shot:
          "You are walking through an ordinary week in the new place. The move is no longer a proposal; it is the setting in which work, routines, friendships, and household life now happen.",
      },
      {
        pathId: "B",
        title: "The life you kept",
        shot:
          "You are still living in the familiar place. The routines, rooms, routes, and obligations remain recognisable. The possible move still exists, but as a path not taken.",
      },
    ];
  }

  if (kind === "PORTFOLIO") {
    return [
      {
        pathId: "A",
        title: "The growth line with volatility",
        shot:
          "You are looking at a long-term investment statement. The value has grown, but the chart is uneven, with falls along the way that had to be lived through.",
      },
      {
        pathId: "B",
        title: "The plan held",
        shot:
          "You are looking at a long-term investment statement. The result is not spectacular, but the plan remained understandable and sustainable through changing markets.",
      },
      {
        pathId: "C",
        title: "The quieter statement",
        shot:
          "You are looking at a long-term investment statement. The fluctuations were smaller, the outcome was more modest, and the portfolio rarely dominated your attention.",
      },
    ];
  }

  return [
    {
      pathId: "A",
      title: "The change becomes real",
      shot:
        "You are living with the consequences of making the change. It is no longer theoretical; it has become part of the ordinary shape of your week.",
    },
    {
      pathId: "B",
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
        pathId: "A",
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
        pathId: "B",
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
        pathId: "A",
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
        pathId: "B",
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
        pathId: "A",
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
        pathId: "B",
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
        pathId: "C",
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
      pathId: "A",
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
      pathId: "B",
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

function remainingUncertainties(kind: DecisionKind): string[] {
  if (kind === "PURCHASE") {
    return [
      "Seller legitimacy",
      "Condition",
      "Warranty or return route",
      "Whether the price is attractive relative to realistic alternatives",
    ];
  }

  if (kind === "RELOCATION") {
    return [
      "Employment terms",
      "Housing route",
      "Schooling route",
      "Household stress and adaptation",
      "Exit or return route",
    ];
  }

  if (kind === "PORTFOLIO") {
    return [
      "Risk tolerance under drawdown",
      "Time horizon",
      "Tax wrapper sequencing",
      "Fund selection",
      "Implementation plan",
    ];
  }

  return [
    "What would make the change worthwhile",
    "What could make the change fail",
    "What information is still missing",
  ];
}

export function runCustomDecisionSlice(input: string): DecisionContext {
  const kind = classifyDecision(input);
  const subject = cleanSubject(input, kind);
  const price = extractPrice(input);

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
        resolvedUncertainties:
          kind === "PURCHASE" && price
            ? [`Approximate price identified: £${price.toLocaleString("en-GB")}`]
            : [],
        remainingUncertainties: remainingUncertainties(kind),
      },
    },

    representativePaths: buildPaths(subject, kind),

    establishingShots: buildEstablishingShots(kind),

    steelman: buildSteelman(kind),
  };

  context = eventHorizons(context);

  return context;
}