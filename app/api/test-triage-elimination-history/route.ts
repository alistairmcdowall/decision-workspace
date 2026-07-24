import { NextResponse } from "next/server";
import {
  triageCategoryElimination,
  applyEliminationWithHistory,
  type EliminationHistoryEntry,
} from "../../engine/triageCategoryElimination";

const carCandidates = [
  "Lexus GS450 (2013-2015)",
  "Jaguar XJ 3.0 V6 (2013-2015)",
  "Infiniti Q70",
  "Toyota Century",
  "Honda Legend",
  "Toyota Crown Majesta",
  "Lexus LS460",
];

export async function GET() {
  const history: EliminationHistoryEntry[] = [];
  let candidates = carCandidates;
  let round = 1;

  // Run up to 3 real elimination rounds, always picking the FIRST answer option
  // (arbitrary, deterministic choice for this test route) so we can see the
  // chain narrow across multiple real rounds.
  while (candidates.length > 3 && round <= 3) {
    const result = await triageCategoryElimination(
      "Which used luxury sedan should I buy?",
      candidates,
      "United Kingdom"
    );

    if (!result) break;

// Pick whichever answer actually eliminates something, if one exists -
    // avoids the earlier test harness flaw of blindly picking index 0 and
    // accidentally selecting the non-eliminating option repeatedly.
    const eliminatingOption = result.answerOptions.find((o) => o.eliminates.length > 0);
    const chosenLabel = eliminatingOption?.label ?? result.answerOptions[0]?.label;
    if (!chosenLabel) break;

    const { remainingCandidates, historyEntry } = applyEliminationWithHistory(
      candidates,
      result,
      chosenLabel
    );

    history.push(historyEntry);
    candidates = remainingCandidates;
    round++;
  }

  return NextResponse.json({ finalCandidates: candidates, fullHistory: history });
}