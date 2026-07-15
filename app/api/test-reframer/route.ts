import { NextResponse } from "next/server";
import { reframer } from "../../engine/reframer";
import type { DecisionContext } from "../../engine/types";

const testPrompts = [
  "Should I buy the Sony Bravia 9 II for £2,000?",
  "Should I tell my brother whether to marry his girlfriend?",
  "I've decided to become an airline pilot. What qualifications do I need?",
    "My partner and I disagree about whether to have kids and where to live — what should we do?",
    "Should I buy this specific used BMW 3 Series for £4,000, or is there something better I should look at?",

];

function buildBareContext(prompt: string): DecisionContext {
  return {
    prompt,
    decision: { subject: prompt, kind: "GENERAL" },
    facts: { userStated: { subject: prompt }, assumedForSlice: {} },
    panel: {},
  };
}

function buildBraviaStyleContext(): DecisionContext {
    return {
      prompt: "Should I buy the Sony Bravia 9 II for £2,000?",
      decision: {
        subject: "Sony Bravia 9 II",
        kind: "PURCHASE",
        price: { amount: 2000, currency: "GBP" },
      },
      facts: {
        userStated: {
          subject: "Sony Bravia 9 II",
          price: { amount: 2000, currency: "GBP" },
        },
        assumedForSlice: {
          marketClass: "premium_flagship",
          pricePosition:
            "This TV typically retails around £3,500. The offer price of £2,000 is roughly 43% below typical retail.",
        },
      },
      panel: {},
    };
  }

  function buildBravia3500Context(): DecisionContext {
    return {
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
        assumedForSlice: {
          marketClass: "premium_flagship",
        },
      },
      panel: {},
    };
  }

export async function GET() {
  const results = await Promise.all(
    testPrompts.map(async (prompt) => {
      const context = await reframer(buildBareContext(prompt));
      return { prompt, result: context.reframer };
    })
  );

  const braviaWithContext = await reframer(buildBraviaStyleContext());
  const bravia3500 = await reframer(buildBravia3500Context());

  return NextResponse.json([
    ...results,
    { prompt: "Bravia (with real price-position context)", result: braviaWithContext.reframer },
    { prompt: "Bravia £3,500 - full retail, genuine allocation question", result: bravia3500.reframer },
  ]);


  return NextResponse.json(results);
}