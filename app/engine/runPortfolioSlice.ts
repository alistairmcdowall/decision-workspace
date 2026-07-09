// app/engine/runPortfolioSlice.ts

import type { DecisionContext } from "./types";

export function runPortfolioSlice(): DecisionContext {
  const context = {
    prompt:
      "I want to reinvest a substantial portfolio for 8–10 years of growth before switching toward income. I am considering a conviction growth portfolio, a simpler balanced global portfolio, or a lower-risk capital preservation approach.",
      decision: {
        subject: "8–10 year retirement growth portfolio",
        kind: "PORTFOLIO",
        commitment:
          "Allocate long-term retirement capital into a growth portfolio for 8–10 years before later transitioning toward income generation.",
      },
    facts: {
      userStated: {
        subject: "8–10 year retirement growth portfolio",
        price: {
          amount: 0,
          currency: "GBP",
        },
      },
      assumedForSlice: {
        marketClass: "investment_strategy",
        pricePosition: "long_term_growth_decision",
      },
    },

    panel: {},
    presentation: {
        decisionStateSummary:
          "The question is no longer whether growth is the objective. It is what kind of growth path is most suitable for the next 8–10 years.",
        decisionTurn:
          "So the decision now turns on risk tolerance, behavioural sustainability and implementation detail.",
      },

    landscape: {
      v2: {
        subject: "8–10 year retirement growth portfolio",
        commitment:
          "allocate long-term retirement capital into a growth strategy before later transitioning toward income",
        decisionAxes: [
          "expected growth",
          "volatility tolerance",
          "diversification",
          "behavioural sustainability",
          "simplicity",
          "retirement income readiness",
        ],
        resolvedUncertainties: [
          "The portfolio is intended for 8–10 years of growth",
          "The later objective is income generation",
          "The user is willing to accept meaningful equity risk",
        ],
        remainingUncertainties: [
          "precise risk tolerance under drawdown",
          "tax wrapper sequencing",
          "fund selection",
          "implementation amounts",
          "future ISA/SIPP migration plan",
        ],
        state: "NARROWED",
      },
    },

    representativePaths: [
      {
        id: "A",
        title: "Implement Portfolio C",
        requiredConditions: [
          "high_equity_risk_accepted",
          "us_growth_tilt_accepted",
          "drawdown_behaviour_sustainable",
          "implementation_funds_confirmed",
        ],
        commitment: {
          type: "portfolio_allocation",
          amount: 0,
          currency: "GBP",
        },
        outcome: "conviction_growth_portfolio_adopted",
      },
      {
        id: "B",
        title: "Use a simpler global growth portfolio",
        requiredConditions: [
          "global_core_accepted",
          "lower_complexity_preferred",
          "moderate_tilt_accepted",
          "implementation_funds_confirmed",
        ],
        commitment: {
          type: "portfolio_allocation",
          amount: 0,
          currency: "GBP",
        },
        outcome: "simplified_global_growth_portfolio_adopted",
      },
      {
        id: "C",
        title: "Use a capital preservation portfolio",
        requiredConditions: [
          "lower_return_accepted",
          "reduced_volatility_prioritised",
          "peace_of_mind_prioritised",
          "inflation_risk_accepted",
        ],
        commitment: {
          type: "portfolio_allocation",
          amount: 0,
          currency: "GBP",
        },
        outcome: "capital_preservation_portfolio_adopted",
      },
    ],

    establishingShots: [
      {
        pathId: "A",
        title: "The growth line with scars",
        shot:
          "You are sitting at the kitchen table on a Saturday morning, looking at your ten-year investment performance chart. A mug of coffee sits beside the laptop. The line on the screen ends at a new high, but it is not smooth. Several steep falls are still visible along the way, including one sharp drop marked with a small circle. The circled low point sits far below the current value.",
      },
      {
        pathId: "B",
        title: "The plan held",
        shot:
          "You are sitting at the kitchen table on a Saturday morning, looking at your ten-year investment statement. A mug of coffee sits beside the laptop, and a printed retirement plan rests partly under the page. The line on the screen rises unevenly but steadily. There are dips, but none dominates the chart. The current value sits close to the target figure in the plan.",
      },
      {
        pathId: "C",
        title: "The statement becomes ordinary",
        shot:
          "You are sitting at the kitchen table on a Saturday morning, looking at your ten-year investment statement. A mug of coffee sits beside the laptop. The value has grown a little, and the line on the screen is almost unremarkable. There is no dramatic high to celebrate, no low point marked for memory, no number that seems to change the morning. You barely thought about it.",
      },
    ],

    steelman: [
      {
        pathId: "A",
        objective: "Maximise long-term retirement capital",
        case:
          "The strongest case for Portfolio C is that the next 8–10 years are still a growth phase, not an income phase. If the household can tolerate volatility without abandoning the plan, a conviction growth portfolio gives the capital the best chance to compound before retirement. The risk is real, but under-risking the portfolio may also be a risk if the target is a materially larger future income pot.",
        supportingConditions: [
          "The user can tolerate large drawdowns",
          "The investment horizon is genuinely 8–10 years",
          "The household does not need to draw on the capital early",
          "The user accepts concentration toward higher-growth markets and factors",
        ],
      },
      {
        pathId: "B",
        objective: "Grow capital while keeping the plan simpler and more durable",
        case:
          "The strongest case for the simpler global growth portfolio is that it may capture most of the required long-term growth while reducing complexity, behavioural strain and regret risk. It does not try to win the decade outright. It tries to make the decade survivable, diversified and easy enough to hold through volatility.",
        supportingConditions: [
          "The user values simplicity",
          "The user wants broad global diversification",
          "The expected return remains high enough for the retirement goal",
          "The strategy is easier to maintain without repeated tinkering",
        ],
      },
      {
        pathId: "C",
        objective: "Protect stability and reduce mental occupation",
        case:
          "The strongest case for capital preservation is that the portfolio's job may not be to dominate the user's life. Lower volatility may reduce the chance that market falls become household stress events or trigger poor decisions. The return may be lower, but the route to retirement may be psychologically easier and more stable.",
        supportingConditions: [
          "Peace of mind is prioritised over maximum expected return",
          "Lower drawdown risk is worth accepting lower growth",
          "The household already has enough capital or other assets to support the goal",
          "The user wants the portfolio to occupy less attention",
        ],
      },
    ],

    eventHorizon: {
      trigger: "portfolio_allocation_commitment",
      irreversibleAfter: [
        "large trades placed",
        "tax wrapper sequence executed",
        "existing holdings sold",
        "market exposure materially changed",
      ],
      transition: "evaluation_to_invested_strategy",
    },
  };

  return context;
}