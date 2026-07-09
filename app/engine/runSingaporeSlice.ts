// app/engine/runSingaporeSlice.ts

import type { DecisionContext } from "./types";

export function runSingaporeSlice(): DecisionContext {
  const context = {
    prompt:
      "My wife has been offered a job in Singapore for twice the salary. It would be a minimum five-year commitment for the family. I would have to leave my job and our daughter would need to find a school. We have to decide soon.",
      decision: {
        subject: "Singapore relocation",
        kind: "RELOCATION",
        commitment:
          "Move the family to Singapore for a five-year period if employment, schooling, housing and household viability can be confirmed.",
      },
    facts: {
      userStated: {
        subject: "Singapore relocation",
        price: {
          amount: 0,
          currency: "GBP",
        },
      },
      assumedForSlice: {
        marketClass: "life_relocation",
        pricePosition: "major_family_commitment",
      },
    },

    panel: {},

    presentation: {
      decisionStateSummary:
        "The opportunity is significant, but the move depends on whether the employment, school and household route can support a five-year relocation.",
      decisionTurn:
        "So the decision now turns on whether the family route is workable before binding commitments are made.",
    },

    landscape: {
      v2: {
        subject: "Singapore relocation",
        commitment:
          "minimum five-year family relocation built around Vera's job offer",
        decisionAxes: [
          "career upside",
          "family disruption",
          "schooling",
          "financial impact",
          "loss of current employment",
          "reversibility",
        ],
        resolvedUncertainties: [
          "Vera has a materially stronger salary opportunity",
          "The move would require a family relocation",
          "The commitment is at least five years",
        ],
        remainingUncertainties: [
          "employment terms",
          "visa route",
          "school route",
          "household financial position",
          "return options",
        ],
        state: "NARROWED",
      },
    },

    representativePaths: [
      {
        id: "A",
        title: "Accept the Singapore move",
        requiredConditions: [
          "employment_terms_confirmed",
          "visa_route_workable",
          "school_route_workable",
          "household_finances_workable",
        ],
        commitment: {
          type: "family_relocation",
          amount: 0,
          currency: "GBP",
        },
        outcome: "family_relocated_to_singapore",
      },
      {
        id: "B",
        title: "Remain in the UK",
        requiredConditions: [
          "current_life_preserved",
          "relocation_risk_avoided",
          "opportunity_cost_accepted",
        ],
        commitment: {
          type: "opportunity_declined",
          amount: 0,
          currency: "GBP",
        },
        outcome: "family_remains_in_uk",
      },
    ],

    establishingShots: [
      {
        pathId: "A",
        title: "Singapore becomes ordinary life",
        shot:
          "You are walking back from the MRT in the warm evening air. Vera is still talking about work, half-tired and half-energised, while Clementine walks ahead in her school uniform with a friend beside her. The city no longer feels like a place you arrived in. It has become the place the week happens.",
      },
      {
        pathId: "B",
        title: "The life you kept",
        shot:
          "You are at home on an ordinary school evening. Clementine’s bag is by the door, the usual rooms are around you, and Vera’s laptop is open on the table. Singapore still exists as the offer you did not take. The house, the school route and the shape of the week remain familiar.",
      },
    ],

    steelman: [
      {
        pathId: "A",
        objective: "Use a rare opportunity to change the family's financial trajectory",
        case:
          "The strongest case for accepting is that the offer may materially improve the family's long-term financial position and widen the life available to all three of you. If the employment terms, visa route, school route and household finances are workable, the disruption may be justified by the scale of the opportunity and the chance to build a more international, higher-earning chapter of family life.",
        supportingConditions: [
          "Vera's offer is secure and clearly documented",
          "The visa route works for the family",
          "Clementine has a realistic school route",
          "The household finances remain strong after housing, schooling and relocation costs",
        ],
      },
      {
        pathId: "B",
        objective: "Protect the stability of the life already built",
        case:
          "The strongest case for remaining in the UK is that the existing life has value that a salary comparison cannot fully capture. Staying protects school continuity, current routines, local familiarity, and avoids making the family dependent on one overseas role. If the Singapore route carries too many unresolved dependencies, declining may be a deliberate protection of stability rather than a failure of ambition.",
        supportingConditions: [
          "School and family continuity matter materially",
          "The relocation depends on too many fragile assumptions",
          "The financial upside is reduced by real relocation costs",
          "The family values stability more than the opportunity premium",
        ],
      },
    ],

    eventHorizon: {
      trigger:
        "acceptance_of_binding_relocation_commitments",
      irreversibleAfter: [
        "current job resignation",
        "school withdrawal",
        "housing commitments",
        "relocation spending",
      ],
      transition:
        "evaluation_to_family_relocation_commitment",
    },
  };

  return context;
}