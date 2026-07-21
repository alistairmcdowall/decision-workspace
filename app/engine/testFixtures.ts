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
      resolutionState: "RESOLVED",
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

  export const bedBudgetTestContext: DecisionContext = {
    prompt: "How should I spend my £1,000 bed budget?",
    decision: {
      subject: "£1,000 bed budget",
      kind: "PURCHASE",
      price: { amount: 1000, currency: "GBP" },
    },
    facts: {
      userStated: { subject: "£1,000 bed budget", price: { amount: 1000, currency: "GBP" } },
      assumedForSlice: {},
    },
    panel: {},
  };

  export const singaporeRelocationTestContext: DecisionContext = {
    prompt: "Should we move to Singapore for Vera's job, or stay where we are?",
    decision: {
      subject: "relocating the family to Singapore for a job offer",
      kind: "RELOCATION",
    },
    facts: {
      userStated: {
        subject: "relocating the family to Singapore for Vera's job offer",
      },
      assumedForSlice: {},
    },
    panel: {},
  };

  export const redundancyTestContext: DecisionContext = {
    prompt: "Should my wife Vera take redundancy, or stay in her current role?",
    decision: {
      subject: "whether Vera, the user's wife, should take redundancy",
      kind: "GENERAL",
    },
    facts: {
      userStated: {
        subject: "whether Vera, the user's wife, should take redundancy",
      },
      assumedForSlice: {},
    },
    panel: {},
  };

  export const thirdChildTestContext: DecisionContext = {
    prompt: "Should my partner and I have a third child?",
    decision: {
      subject: "whether to have a third child",
      kind: "GENERAL",
    },
    facts: {
      userStated: {
        subject: "whether the user and their partner should have a third child",
      },
      assumedForSlice: {},
    },
    panel: {},
  };
  
  export const thirdChildSoloFramingTestContext: DecisionContext = {
    prompt: "Should I have a third child?",
    decision: {
      subject: "whether to have a third child",
      kind: "GENERAL",
    },
    facts: {
      userStated: {
        subject: "whether to have a third child",
      },
      assumedForSlice: {},
    },
    panel: {},
  };

  export const cofounderBuyoutTestContext: DecisionContext = {
    prompt:
      "My co-founder wants to buy me out for less than I think is fair, but if I refuse he says he'll just let the company fold and we both get nothing. Do I take the lower amount or refuse on principle even though I lose more?",
    decision: {
      subject: "accepting a below-fair buyout offer from a co-founder",
      kind: "GENERAL",
    },
    facts: {
      userStated: {
        subject: "accepting a below-fair buyout offer from a co-founder",
      },
      assumedForSlice: {},
    },
    panel: {},
  };

  export const cofounderFrozenClarifierTestContext: DecisionContext = {
    prompt:
      "My co-founder wants to buy me out for less than I think is fair, but if I refuse he says he'll just let the company fold and we both get nothing. Do I take the lower amount or refuse on principle even though I lose more?",
    decision: {
      subject: "accepting a below-fair buyout offer from a co-founder",
      kind: "GENERAL",
    },
    facts: {
      userStated: {
        subject: "accepting a below-fair buyout offer from a co-founder",
      },
      assumedForSlice: {},
    },
    reframer: {
      status: "PASS",
      governingObjective:
        "Decide whether to accept the co-founder's below-fair buyout offer or refuse it and risk the company folding with both getting nothing.",
      route: "DECISION_LANDSCAPE",
      reason: {
        decisionCount: 1,
        decisionType: "business exit/negotiation",
        subjectCount: 1,
        pricePresent: true,
      },
    },
    landscape: {
      v1: {
        subject: "Whether to accept a below-fair buyout offer from a co-founder",
        commitment:
          "Either sell equity now at a price believed to be unfair, or refuse and accept the risk the company folds with both parties receiving nothing.",
        decisionAxes: [
          "Credibility of the fold threat",
          "Legal rights and existing agreements governing valuation or dissolution",
          "Financial need versus principle",
          "Relationship with the co-founder going forward",
        ],
        resolvedUncertainties: [
          "The co-founder has offered a specific buyout figure believed to be below fair value",
          "The co-founder has stated that refusal will result in the company folding",
        ],
        remainingUncertainties: [
          "Whether the fold threat is genuine or a bluff",
          "Whether legal recourse or existing agreements exist to contest the offer or prevent unilateral folding",
          "The person's own priority: financial outcome versus standing on principle",
        ],
        state: "BROAD",
      },
    },
    panel: {
      guardian: [
        {
          protectedValue: "Fair value for years of contribution",
          concern: "Accepting a below-fair offer under pressure risks permanently undervaluing the person's actual stake and past work.",
        },
      ],
      pragmatist: [
        { requirement: "Clarity on whether the fold threat is a genuine legal/financial possibility, not just a negotiating tactic" },
        { requirement: "Understanding of existing legal agreements governing valuation, buyout, or dissolution" },
      ],
      empathiser: [
        {
          humanFactor: "The pressure of an ultimatum from someone who was previously a trusted partner may push toward a hasty decision to avoid conflict.",
        },
      ],
    },
    auditor: {
      evidenceStrength: "LOW",
      assumptions: [
        "The co-founder's fold threat is assumed to be credible without independent verification",
        "No existing legal agreement has been confirmed one way or the other",
      ],
      missingInformation: [
        "Contents of any operating agreement, shareholder agreement, or bylaws",
        "Whether the co-founder has taken any concrete steps toward folding the company",
      ],
      blockingUncertainties: [
        "Credibility of the co-founder's fold threat",
        "Whether alternative leverage (legal/financial) exists outside accept-or-fold",
      ],
      supportedConclusions: [
        { finding: "A real tension exists between accepting a known lower amount and risking a total loss." },
      ],
      unsupportedConclusions: [
        { finding: "That the fold threat is either definitely genuine or definitely a bluff." },
      ],
      internalConsistency: "CONSISTENT",
      readinessScore: 35,
      readinessState: "RED",
    },
    representativePaths: [],
  };

  export const braviaRetailerFrozenContext: DecisionContext = {
    prompt: "Should I buy the Sony Bravia 9 II for £2,000?",
    decision: {
      subject: "Sony Bravia 9 II",
      kind: "PURCHASE",
      price: { amount: 2000, currency: "GBP" },
    },
    facts: {
      userStated: { subject: "Sony Bravia 9 II", price: { amount: 2000, currency: "GBP" } },
      assumedForSlice: {},
    },
    reframer: {
      status: "PASS",
      governingObjective: "Decide whether to buy the Sony Bravia 9 II TV for £2,000.",
      route: "DECISION_LANDSCAPE",
      reason: { decisionCount: 1, decisionType: "purchase", subjectCount: 1, pricePresent: true },
    },
    landscape: {
      v1: {
        subject: "Purchase of a Sony Bravia 9 II TV (flagship mini-LED model) for £2,000",
        commitment: "Committing to pay £2,000 for a specific high-end Sony Bravia television, likely from either a retailer sale/clearance channel or a private resale, and to own/use that unit going forward.",
        decisionAxes: [
          "Value for money (price vs typical retail/feature set)",
          "Purchase channel and transaction integrity (retailer vs private sale, warranty implications)",
          "Fit for use case (screen size, room, viewing habits)",
          "Alternatives foregone (other TVs, timing of purchase, upcoming models/sales)",
          "Timing (is now a good moment relative to sales cycles or model refreshes)",
        ],
        resolvedUncertainties: [
          "Product name 'Sony Bravia 9 II' closely matches Sony's known Bravia 9 flagship mini-LED line; treated as a genuine near-match to that model (or its direct successor), not an invented product",
          "Reasoned estimate: the Sony Bravia 9 series launched at roughly £3,300-£5,300 depending on screen size; a price of £2,000 is notably below typical launch MSRP but plausible as a sale, promotional, or discounted price for this model - this is a reasoned estimate, not independently verified for this specific listing",
        ],
        remainingUncertainties: [
          "Exact screen size and specification of the unit being offered at £2,000",
          "Why the price is below typical MSRP - clearance, sale event, open-box/refurbished, private resale, or pricing error",
          "Whether the seller is an authorized retailer or a private individual, and what warranty/return protection applies",
        ],
        state: "BROAD",
      },
      v2: {
        subject: "Purchase of a Sony Bravia 9 II TV (flagship mini-LED model) for £2,000 via authorized retailer",
        commitment: "Committing to pay £2,000 to an authorized retailer for a specific high-end Sony Bravia television, with standard invoicing, returns, and warranty protections applying.",
        decisionAxes: [
          "Value for money (price vs typical retail/feature set)",
          "Fit for use case (screen size, room, viewing habits)",
          "Alternatives foregone (other TVs, timing of purchase, upcoming models/sales)",
          "Timing (is now a good moment relative to sales cycles or model refreshes)",
        ],
        resolvedUncertainties: [
          "Product name 'Sony Bravia 9 II' closely matches Sony's known Bravia 9 flagship mini-LED line; treated as a genuine near-match to that model (or its direct successor), not an invented product",
          "Reasoned estimate: the Sony Bravia 9 series launched at roughly £3,300-£5,300 depending on screen size; a price of £2,000 is notably below typical launch MSRP but plausible as a sale, promotional, or discounted price for this model - this is a reasoned estimate, not independently verified for this specific listing",
          "Sales channel is an authorized/recognized retailer, which supports standard invoicing, returns, and warranty protections and rules out grey market/counterfeit/private-sale explanations for the low price",
        ],
        remainingUncertainties: [
          "Why the price is unusually low, now narrowed to legitimate clearance/promotional pricing or a pricing error",
          "Screen size and exact model variant, which materially affects normal expected price",
          "Condition of the unit (new, used, refurbished/open-box) and specific warranty terms attached to this listing",
        ],
        state: "NARROWED",
      },
    },
    panel: {
      guardian: [
        { protectedValue: "Financial security", concern: "Committing £2,000 to a deal that is priced well below market norms risks the money being lost outright if the unit, seller, or transaction turns out to be unsound." },
      ],
      pragmatist: [
        { requirement: "Seller identity and legitimacy can be verified (authorized retailer, reputable marketplace account, or traceable business entity)" },
      ],
      empathiser: [
        { humanFactor: "The buyer may feel a pull of excitement and urgency at spotting an apparent bargain, which can cloud careful scrutiny of why the price is so low" },
      ],
    },
    auditor: {
      evidenceStrength: "LOW",
      assumptions: ["Bravia 9 II is a genuine near-match to Sony's known Bravia 9 line"],
      missingInformation: ["Screen size and model variant of this specific unit"],
      blockingUncertainties: ["No concrete listing details exist to check against fraud/condition/authenticity concerns"],
      supportedConclusions: [{ finding: "The £2,000 price is plausibly below the typical flagship price range based on general market knowledge." }],
      unsupportedConclusions: [{ finding: "That this specific listing is fraudulent or a genuine bargain cannot yet be determined." }],
      internalConsistency: "CONSISTENT",
      readinessScore: 55,
      readinessState: "AMBER",
    },
    clarifier: {
      target: "Seller channel and warranty/return protection",
      method: "ISOLATION",
      question: "Do you know whether this TV is being sold by an authorized retailer (with standard warranty/return rights) or by a private individual (with no such protection)?",
      rationale: "Knowing the seller channel determines whether the £2,000 price carries meaningful buyer protection or significant risk.",
      answerOptions: ["Authorized retailer", "Private individual/resale", "Not sure"],
    },
    clarifierResponse: {
      answer: "Authorized retailer",
      effect: "Seller channel is established as an authorized/recognized retailer, which supports standard invoicing, returns, and warranty protections and rules out grey market/counterfeit/private-sale explanations for the low price.",
      resolutionState: "RESOLVED",
    },
    representativePaths: [
      {
        id: "A",
        title: "Proceed with purchase at £2,000",
        requiredConditions: ["Seller is confirmed as an authorized retailer", "Price gap traced to a legitimate cause"],
        commitment: { type: "capital_outflow", amount: 2000, currency: "GBP" },
        outcome: "Pay £2,000 immediately and take ownership of the unit, from a confirmed authorized retailer.",
      },
      {
        id: "B",
        title: "Decline this purchase",
        requiredConditions: [],
        commitment: { type: "capital_retained", amount: 0, currency: "GBP" },
        outcome: "No purchase made; £2,000 stays available.",
      },
    ],
  };
  
  export const braviaPrivateSellerFrozenContext: DecisionContext = {
    ...braviaRetailerFrozenContext,
    landscape: {
      v1: braviaRetailerFrozenContext.landscape!.v1,
      v2: {
        subject: "Purchase of a Sony Bravia 9 II TV (flagship mini-LED model) for £2,000 via private resale",
        commitment: "Committing to pay £2,000 to a private individual for a specific high-end Sony Bravia television, with no retailer warranty or return protection.",
        decisionAxes: [
          "Value for money (price vs typical retail/feature set)",
          "Transaction risk and trust (private seller verification, payment method, recourse if misrepresented)",
          "Fit for use case (screen size, room, viewing habits)",
          "Alternatives foregone (other TVs, timing of purchase, upcoming models/sales)",
        ],
        resolvedUncertainties: [
          "Product name 'Sony Bravia 9 II' closely matches Sony's known Bravia 9 flagship mini-LED line; treated as a genuine near-match, not an invented product",
          "Reasoned estimate: the Sony Bravia 9 series launched at roughly £3,300-£5,300 depending on screen size; a price of £2,000 is notably below typical launch MSRP - this is a reasoned estimate, not independently verified",
          "Seller is a private individual, not an authorized retailer; the purchase carries no standard warranty or return protection, and any condition/spec claims rest solely on the seller's representation",
        ],
        remainingUncertainties: [
          "Whether the unit is stolen, counterfeit, or otherwise problematic, and what recourse exists if so",
          "Condition of the unit and whether it can be verified before purchase (e.g. in-person inspection, power-on test)",
          "Exact screen size and specification of the unit being offered at £2,000",
        ],
        state: "NARROWED",
      },
    },
    clarifierResponse: {
      answer: "Private individual/resale",
      effect: "Seller channel is now confirmed as private resale, establishing that the £2,000 price carries no standard warranty or return protection and that condition/spec claims cannot be backed by retailer guarantees.",
      resolutionState: "RESOLVED",
    },
    representativePaths: [
      {
        id: "A",
        title: "Buy the TV from private seller",
        requiredConditions: ["Unit condition and authenticity verified before payment", "Payment method offers some recourse"],
        commitment: { type: "capital_outflow", amount: 2000, currency: "GBP" },
        outcome: "Pay £2,000 now, take ownership of the unit with no retailer warranty or return recourse.",
      },
      {
        id: "B",
        title: "Do not buy this TV",
        requiredConditions: [],
        commitment: { type: "capital_retained", amount: 0, currency: "GBP" },
        outcome: "Funds stay unspent; buyer keeps existing setup and forgoes this specific unit entirely.",
      },
    ],
  };