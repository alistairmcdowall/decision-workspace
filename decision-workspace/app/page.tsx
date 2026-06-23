"use client";

import { useState } from "react";
import { runDecision, type DecisionResult } from "@/lib/decisionengine";


export default function Home() {
  const [decision, setDecision] = useState("");
  const [result, setResult] = useState<DecisionResult | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  function runPrototype() {
    const trimmed = decision.trim();

    if (!trimmed) {
      setResult({
        summary:
          "Enter a decision first. The workspace will produce a first-pass summary, clarifiers, and a show-working section.",
        clarifiers: [],
        analysis: "",
      });
      return;
    }

    const result = runDecision(trimmed);

    setResult(result);
    setShowAnalysis(false);
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
                            className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:border-slate-400 hover:text-white"
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

            {result.analysis && (
              <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
                <button
                  onClick={() => setShowAnalysis(!showAnalysis)}
                  className="font-medium text-slate-200 hover:text-white"
                >
                  {showAnalysis ? "Hide Analysis" : "Show Analysis"}
                </button>

                {showAnalysis && (
                  <p className="mt-4 leading-7 text-slate-300">
                    {result.analysis}
                  </p>
                )}
              </section>
            )}
          </div>
        )}
      </section>
    </main>
  );
}