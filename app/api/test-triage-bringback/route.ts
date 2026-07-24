import { NextResponse } from "next/server";
import { triageBringBackForGutCheckPick } from "../../engine/triageBringBack";
import type { EliminationHistoryEntry } from "../../engine/triageCategoryElimination";

const originalPrompt =
  "Which used luxury sedan should I buy: Lexus GS450, Jaguar XJ 3.0 V6, Infiniti Q70, Toyota Century, Honda Legend, Toyota Crown Majesta, Lexus LS460?";

export async function GET() {
  const gutCheckPick = "Toyota Century";
  const finalCandidates = ["Jaguar XJ 3.0 V6", "Lexus LS460"];

  // Hand-constructed history - directly forces a round where the gut-check
  // pick was genuinely eliminated, bypassing reliance on a live run doing it.
  const eliminationHistory: EliminationHistoryEntry[] = [
    {
      axis: "JDM-only grey-market import vs. officially exported model",
      question:
        "Some of these were never officially sold outside Japan and would require a grey-market import. Would you accept that, or do you need something officially sold and dealer-supported in your market?",
      answerOptions: [
        { label: "Yes, I'm fine with a grey-market import", eliminates: [] },
        {
          label: "No, I need something officially sold and dealer-supported",
          eliminates: ["Toyota Century", "Toyota Crown Majesta"],
        },
      ],
      selectedLabel: "No, I need something officially sold and dealer-supported",
      eliminatedCandidates: ["Toyota Century", "Toyota Crown Majesta"],
      candidatesBeforeThisRound: [
        "Lexus GS450",
        "Jaguar XJ 3.0 V6",
        "Infiniti Q70",
        "Toyota Century",
        "Honda Legend",
        "Toyota Crown Majesta",
        "Lexus LS460",
      ],
      candidatesAfterThisRound: [
        "Lexus GS450",
        "Jaguar XJ 3.0 V6",
        "Infiniti Q70",
        "Honda Legend",
        "Lexus LS460",
      ],
    },
  ];

  const bringBack = await triageBringBackForGutCheckPick(
    originalPrompt,
    finalCandidates,
    eliminationHistory,
    gutCheckPick
  );

  return NextResponse.json({
    gutCheckPick,
    finalCandidates,
    bringBackQuestion: bringBack,
  });
}