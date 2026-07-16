import type { DecisionContext } from "./types";

export const lexusTestContext: DecisionContext = {
  prompt: "Should I buy a used Lexus GS for £6,500?",

  decision: {
    subject: "a used Lexus GS",
    kind: "PURCHASE",
    price: { amount: 6500, currency: "GBP" },
  },

  facts: {
    userStated: {
      subject: "a used Lexus GS",
      price: { amount: 6500, currency: "GBP" },
    },
    assumedForSlice: {},
  },

  reframer: {
    status: "PASS",
    governingObjective:
      "Is this specific used luxury car a good enough risk-adjusted purchase compared with keeping the cash or choosing a lower-risk alternative?",
    route: "DECISION_LANDSCAPE",
    reason: {
      decisionCount: 1,
      decisionType: "purchase",
      subjectCount: 1,
      pricePresent: true,
    },
  },

  landscape: {
    v1: {
      subject: "Used Lexus GS",
      commitment:
        "Spend £6,500 and take on ownership, maintenance, insurance, and resale risk.",
      decisionAxes: [
        "purchase price",
        "vehicle condition",
        "service history",
        "seller legitimacy",
        "running costs",
        "reliability",
        "emotional appeal",
        "alternatives",
        "reversibility",
      ],
      resolvedUncertainties: [
        "the user is considering a used Lexus GS",
        "the stated price is £6,500",
        "this is a purchase decision",
        "the decision involves both upfront cost and future ownership risk",
      ],
      remainingUncertainties: [
        "whether the car is mechanically sound",
        "whether the service history is genuine",
        "whether the seller is legitimate",
        "whether the model/year has known issues",
        "whether running costs are acceptable",
        "whether £6,500 is fair against comparable cars",
        "whether a different car or waiting would be better",
      ],
      state: "BROAD",
    },
  },

  panel: {},
};

export const sisterTestContext: DecisionContext = {
    prompt:
      "I found out my sister is cheating on my best friend. I don't know whether to tell him.",
  
    decision: {
      subject: "whether to tell his best friend that his sister is being unfaithful to him",
      kind: "GENERAL",
    },
  
    facts: {
      userStated: {
        subject: "his sister is cheating on his best friend",
      },
      assumedForSlice: {},
    },
  
    reframer: {
      status: "PASS",
      governingObjective:
        "Should he tell his best friend what he knows, stay silent, or confront his sister first — given the risk of harming one or more relationships whichever path he takes?",
      route: "DECISION_LANDSCAPE",
      reason: {
        decisionCount: 1,
        decisionType: "interpersonal_disclosure",
        subjectCount: 2,
        pricePresent: false,
      },
    },
  
    landscape: {
      v1: {
        subject: "Sister's infidelity toward best friend",
        commitment:
          "Choose whether, how, and to whom to disclose what he knows — with no way to fully undo the consequences once said.",
        decisionAxes: [
          "certainty of what was actually witnessed or learned",
          "loyalty to sister versus loyalty to best friend",
          "whether staying silent makes him complicit",
          "how the friendship survives either disclosure or discovery of silence",
          "how the family relationship survives disclosure",
          "timing — before or after confronting his sister directly",
          "whether this is genuinely his responsibility to act on",
        ],
        resolvedUncertainties: [
          "he has learned his sister is being unfaithful to his best friend",
          "he has not yet told either party",
          "both relationships (sister, best friend) matter to him",
        ],
        remainingUncertainties: [
          "how certain the evidence actually is",
          "whether his sister knows that he knows",
          "whether his best friend would want to know at all",
          "whether silence would count as a betrayal if discovered later",
          "what happens to his relationship with his sister if he tells",
          "what happens to his friendship if he doesn't",
        ],
        state: "BROAD",
      },
    },
  
    panel: {},
  };

  export const lexusEmotionalTestContext: DecisionContext = {
    prompt:
      "I've always wanted a Lexus GS, and I've found one for £6,500 - should I buy it?",
    decision: {
      subject: "a used Lexus GS",
      kind: "PURCHASE",
      price: { amount: 6500, currency: "GBP" },
    },
    facts: {
      userStated: {
        subject: "a used Lexus GS",
        price: { amount: 6500, currency: "GBP" },
      },
      assumedForSlice: {},
    },
    panel: {},
  };

  export const broadbandTestContext: DecisionContext = {
    prompt: "Should I switch broadband providers to save money?",
    decision: {
      subject: "broadband provider",
      kind: "GENERAL",
    },
    facts: {
      userStated: { subject: "broadband provider" },
      assumedForSlice: {},
    },
    reframer: {
      status: "PASS",
      governingObjective: "Decide whether to switch broadband providers to reduce cost.",
      route: "DECISION_LANDSCAPE",
      reason: { decisionCount: 1, decisionType: "subscription_switch", subjectCount: 1, pricePresent: false },
    },
    landscape: {
      v1: {
        subject: "Broadband provider switch",
        commitment: "Cancel the current contract and sign up with a new provider.",
        decisionAxes: ["price", "service reliability", "switching hassle", "contract terms"],
        resolvedUncertainties: ["a cheaper alternative provider has been found"],
        remainingUncertainties: ["exact price difference", "reliability of the new provider", "switching process length"],
        state: "BROAD",
      },
    },
    panel: {},
  };
  
  export const broadbandWithClarifierContext: DecisionContext = {
    ...broadbandTestContext,
    clarifierResponse: {
      answer: "No, I wouldn't stay even if they matched the lowest price I found.",
      effect: "Price is not the actual driver of the switching decision.",
    },
  };

  export const bravia3500TestContext: DecisionContext = {
    prompt: "Should I spend £3,500 on a Bravia 9 II TV?",
    decision: {
      subject: "Bravia 9 II TV",
      kind: "PURCHASE",
      price: { amount: 3500, currency: "GBP" },
    },
    facts: {
      userStated: {
        subject: "Bravia 9 II TV",
        price: { amount: 3500, currency: "GBP" },
      },
      assumedForSlice: { marketClass: "premium_flagship" },
    },
    panel: {},
  };

  export const tvBudgetTestContext: DecisionContext = {
    prompt: "How should I spend my £3,500 TV budget?",
    decision: {
      subject: "£3,500 TV budget",
      kind: "PURCHASE",
      price: { amount: 3500, currency: "GBP" },
    },
    facts: {
      userStated: { subject: "£3,500 TV budget", price: { amount: 3500, currency: "GBP" } },
      assumedForSlice: {},
    },
    panel: {},
  };