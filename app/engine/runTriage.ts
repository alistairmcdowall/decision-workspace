import { triageGutCheck } from "./triageGutCheck";
import {
  triageCategoryElimination,
  applyEliminationWithHistory,
  type EliminationHistoryEntry,
} from "./triageCategoryElimination";

export type TriageResult = {
  method: "gut-check-single-lean" | "elimination-fallback";
  finalCandidates: string[];
  gutCheckQuestion: string;
  gutCheckAnswer: string;
  eliminationHistory: EliminationHistoryEntry[];
};

const CATCH_ALL_PATTERNS = ["more than one", "none of them", "not sure"];

function isCatchAll(answer: string): boolean {
  const lower = answer.toLowerCase();
  return CATCH_ALL_PATTERNS.some((p) => lower.includes(p));
}

export async function runTriage(
  decisionPrompt: string,
  candidates: string[],
  simulatedGutCheckAnswer: string,
  userMarket?: string,
  targetCount: number = 2
): Promise<TriageResult> {
  const gutCheck = await triageGutCheck(decisionPrompt, candidates);

  if (!isCatchAll(simulatedGutCheckAnswer)) {
    // A specific single car was named - it becomes the priority candidate,
    // but a genuine second finalist still needs to be found. Run elimination
    // on the REMAINING candidates (excluding the gut-check pick) to find one
    // credible runner-up, rather than treating the gut-check alone as final.
    const remainingAfterGutCheck = candidates.filter((c) => c !== simulatedGutCheckAnswer);

    const history: EliminationHistoryEntry[] = [];
    let remaining = remainingAfterGutCheck;
    let round = 1;

    while (remaining.length > targetCount - 1 && round <= 3) {
      const result = await triageCategoryElimination(decisionPrompt, remaining, userMarket);
      if (!result) break;

      const eliminatingOption = result.answerOptions.find((o) => o.eliminates.length > 0);
      const chosenLabel = eliminatingOption?.label ?? result.answerOptions[0]?.label;
      if (!chosenLabel) break;

      const { remainingCandidates, historyEntry } = applyEliminationWithHistory(
        remaining,
        result,
        chosenLabel
      );

      history.push(historyEntry);
      remaining = remainingCandidates;
      round++;
    }

    return {
      method: "gut-check-single-lean",
      finalCandidates: [simulatedGutCheckAnswer, ...remaining],
      gutCheckQuestion: gutCheck.question,
      gutCheckAnswer: simulatedGutCheckAnswer,
      eliminationHistory: history,
    };
  }

  // Fallback: run elimination rounds until candidate count reaches 2, capped at 3 rounds.
  const history: EliminationHistoryEntry[] = [];
  let remaining = candidates;
  let round = 1;

  while (remaining.length > targetCount && round <= 3) {
    const result = await triageCategoryElimination(decisionPrompt, remaining, userMarket);
    if (!result) break;

    const eliminatingOption = result.answerOptions.find((o) => o.eliminates.length > 0);
    const chosenLabel = eliminatingOption?.label ?? result.answerOptions[0]?.label;
    if (!chosenLabel) break;

    const { remainingCandidates, historyEntry } = applyEliminationWithHistory(
      remaining,
      result,
      chosenLabel
    );

    history.push(historyEntry);
    remaining = remainingCandidates;
    round++;
  }

  return {
    method: "elimination-fallback",
    finalCandidates: remaining,
    gutCheckQuestion: gutCheck.question,
    gutCheckAnswer: simulatedGutCheckAnswer,
    eliminationHistory: history,
  };
}