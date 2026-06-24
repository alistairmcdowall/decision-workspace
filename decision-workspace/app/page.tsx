"use client";

import { useState } from "react";
import { runDecision, type DecisionResult } from "@/lib/decisionengine";

const DRAWNDOWN_QUESTION =
  "If £500k temporarily fell to £350k, would you stay invested?";

export default function Home() {
  const [decision, setDecision] = useState("");
  const [result, setResult] = useState<DecisionResult | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  function runPrototype() {
    const trimmed = decision.trim();

    if (!trimmed) {
      setResult({
        summary:
          "Enter a decision first. The workspace will produce a first-pass summary, clarifiers, and a show-working section.",
        clarifiers: [],
        analysis: {} as any,
        comparison: {
          agreement: { statement: "" },
          tension: { statement: "" },
          uncertainty: { statement: "" },
        },
      });
      return;
    }

    setAnswers({});
    setResult(runDecision(trimmed));
    setShowAnalysis(false);
  }

  function uncertaintyText() {
    const answer = answers[DRAWNDOWN_QUESTION];

    if (answer === "Yes") {
      return "Resolved: the user appears willing to tolerate a major temporary drawdown.";
    }

    if (answer === "No") {
      return "Resolved: the user may need a more defensive portfolio.";
    }

    if (answer === "Unsure") {
      return "Partly resolved: the user is uncertain about tolerating a major drawdown, so portfolio design should not assume high risk tolerance.";
    }

    return result?.comparison.uncertainty.statement;
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-6 py-12">
        <div className="mb-8">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.25em] text-slate-400">
            Decision Workspace
          </p>
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            Think through important decisions.
          </h1>
          <p className="mt-4 max-w-2xl text-slate-300">
            Enter a decision. The workspace will produce a summary, the highest
            value clarifiers, and an optional analysis layer.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-2xl">
          <textarea
            value={decision}
            onChange={(event) => setDecision(event.target.value)}
            placeholder="Example: Build me a portfolio for £500k so I can invest it right now."
            className="min-h-36 w-full resize-none rounded-xl border border-slate-700 bg-slate-950 p-4 text-slate-100 outline-none placeholder:text-slate-500 focus:border-slate-400"
          />

          <div className="mt-4 flex justify-end">
            <button
              onClick={runPrototype}
              className="rounded-xl bg-slate-100 px-5 py-3 font-medium text-slate-950 transition hover:bg-white"
            >
              Run decision
            </button>
          </div>
        </div>

        {result && (
          <div className="mt-8 space-y-6">
            <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
              <h2 className="mb-3 text-xl font-semibold">Summary</h2>
              <p className="leading-7 text-slate-300">{result.summary}</p>
            </section>

            {result.clarifiers.length > 0 && (
              <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
                <h2 className="mb-3 text-xl font-semibold">
                  Decision Clarifiers
                </h2>

                <div className="space-y-3">
                  {result.clarifiers.map((question, index) => (
                    <div
                      key={question}
                      className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                    >
                      <p className="mb-3 text-slate-300">
                        {index + 1}. {question}
                      </p>

                      <div className="flex gap-2">
                        {["Yes", "No", "Unsure"].map((answer) => (
                          <button
                            key={answer}
                            onClick={() =>
                              setAnswers({
                                ...answers,
                                [question]: answer,
                              })
                            }
                            className={`rounded-lg border px-3 py-2 text-sm transition ${
                              answers[question] === answer
                                ? "border-slate-200 bg-slate-200 text-slate-950"
                                : "border-slate-700 text-slate-300 hover:border-slate-400 hover:text-white"
                            }`}
                          >
                            {answer}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
              <h2 className="mb-3 text-xl font-semibold">Judge Comparison</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-slate-100">
                    Areas of Agreement
                  </h3>
                  <p className="leading-7 text-slate-300">
                    {result.comparison.agreement.statement}
                  </p>

                  {result.comparison.agreement.evidence && (
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-400">
                      {result.comparison.agreement.evidence.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-slate-100">
                    Areas of Tension
                  </h3>
                  <p className="leading-7 text-slate-300">
                    {result.comparison.tension.statement}
                  </p>

                  {result.comparison.tension.evidence && (
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-400">
                      {result.comparison.tension.evidence.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )}

                  {result.comparison.tension.whyItMatters && (
                    <p className="mt-2 text-slate-400">
                      <span className="font-semibold text-slate-300">
                        Why it matters:{" "}
                      </span>
                      {result.comparison.tension.whyItMatters}
                    </p>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-slate-100">
                    Highest Uncertainty
                  </h3>
                  <p className="leading-7 text-slate-300">
                    {uncertaintyText()}
                  </p>

                  {result.comparison.uncertainty.whyItMatters && (
                    <p className="mt-2 text-slate-400">
                      <span className="font-semibold text-slate-300">
                        Why it matters:{" "}
                      </span>
                      {result.comparison.uncertainty.whyItMatters}
                    </p>
                  )}

                  {result.comparison.uncertainty.potentialImpact && (
                    <p className="mt-2 text-slate-400">
                      <span className="font-semibold text-slate-300">
                        Potential impact:{" "}
                      </span>
                      {result.comparison.uncertainty.potentialImpact}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {result.analysis && (
              <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
                <button
                  onClick={() => setShowAnalysis(!showAnalysis)}
                  className="font-medium text-slate-200 hover:text-white"
                >
                  {showAnalysis ? "Hide Analysis" : "Show Analysis"}
                </button>

                {showAnalysis && (
                  <div className="mt-4 space-y-4">
                    {Object.entries(result.analysis).map(([judge, output]) => (
                      <div
                        key={judge}
                        className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                      >
                        <h3 className="mb-2 font-semibold capitalize text-slate-100">
                          {judge}
                        </h3>
                        <p className="leading-7 text-slate-300">{output}</p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>
        )}
      </section>
    </main>
  );
}