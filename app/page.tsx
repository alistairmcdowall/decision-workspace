"use client";

import { FullReasoningView } from "./ui/FullReasoningView";
import type { DecisionContext } from "./engine/types";
import { useEffect, useState } from "react";
import { runSingaporeSlice } from "./engine/runSingaporeSlice";
import { runPortfolioSlice } from "./engine/runPortfolioSlice";
import { WorkspaceReportView } from "./ui/WorkspaceReportView";
import { runCustomDecisionSlice } from "./engine/runCustomDecisionSlice";
import {
  buildStructuredReport,
  type StructuredReport,
  type StructuredPath,
  type StructuredNavigator,
} from "./engine/presentation/structuredReport";

type SliceName = "bravia" | "bravia-navigator" | "espresso" | "singapore" | "portfolio";

const slices: {
  id: SliceName;
  label: string;
  description: string;
  mode: "Decision Exploration" | "Execution / Navigator";
}[] = [
  {
    id: "bravia",
    label: "Bravia purchase",
    description: "A purchase decision with verification still unresolved.",
    mode: "Decision Exploration",
  },

  {
    id: "bravia-navigator",
    label: "Bravia + Navigator",
    description: "A selected purchase path with pre-payment execution checks.",
    mode: "Execution / Navigator",
  },

  {
    id: "espresso",
    label: "Espresso machine",
    description: "Choosing between three named lever espresso machines, no stated budget.",
    mode: "Decision Exploration",
  },

  {
    id: "singapore",
    label: "Singapore relocation",
    description: "A major family relocation decision.",
    mode: "Decision Exploration",
  },

  {
    id: "portfolio",
    label: "Retirement portfolio",
    description: "An 8–10 year growth portfolio decision.",
    mode: "Decision Exploration",
  },
];

async function fetchWithTimeout(url: string, label: string): Promise<StructuredReport> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 180_000);

  try {
    const response = await fetch(url, { signal: controller.signal });

    if (!response.ok) {
      throw new Error(`Failed to load ${label}: HTTP ${response.status}`);
    }

    return (await response.json()) as StructuredReport;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error(
        `${label} took longer than 180 seconds and was cancelled - this chain makes several real reasoning calls in sequence, so a slow network or a cold dev-server start can occasionally exceed this. Try again.`
      );
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

type BraviaPhase1Response = {
  context: unknown;
  clarifier?: {
    target: string;
    method: string;
    question: string;
    rationale: string;
    answerOptions: string[];
  };
};

async function fetchJsonWithTimeout<T>(url: string, label: string): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 180_000);

  try {
    const response = await fetch(url, { signal: controller.signal });

    if (!response.ok) {
      throw new Error(`Failed to load ${label}: HTTP ${response.status}`);
    }

    return (await response.json()) as T;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error(
        `${label} took longer than 180 seconds and was cancelled. Try again.`
      );
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function runSlice(sliceName: SliceName): Promise<StructuredReport> {
  if (sliceName === "bravia-navigator") {
    return await fetchWithTimeout("/api/run-bravia-navigator", "Bravia + Navigator report");
  }

  const context = sliceName === "singapore" ? runSingaporeSlice() : runPortfolioSlice();

  return buildStructuredReport(context);
}

function ReportView({ report }: { report: StructuredReport }) {
  return (
    <div className="space-y-4">
      <DecisionFrame report={report} />

      <ResolutionPanel
        title="What has already been resolved?"
        items={report.resolved}
        emptyText="Nothing yet"
      />

      <ResolutionPanel
        title="What still blocks the decision?"
        items={report.remaining}
        emptyText="Nothing currently listed"
      />

      <p className="rounded-xl border border-slate-800 bg-slate-950 p-4 leading-7 text-slate-300">
        {report.decisionTurn}
      </p>

      <div className="mt-8 rounded-2xl border border-slate-700 bg-slate-900 p-5">
        <h2 className="text-2xl font-semibold text-slate-100">
          Representative Paths
        </h2>
      </div>

      {report.paths.map((path) => (
        <PathCard key={path.id} path={path} />
      ))}

      {report.eventHorizon && (
        <EventHorizonCard eventHorizon={report.eventHorizon} />
      )}

      {report.navigator && <NavigatorCard navigator={report.navigator} />}

      <p className="rounded-xl border border-slate-800 bg-slate-950 p-4 leading-7 text-slate-300">
        {report.closingNote}
      </p>
    </div>
  );
}
function DecisionFrame({ report }: { report: StructuredReport }) {
  return (
    <>
      <div className="mt-8 rounded-2xl border border-slate-700 bg-slate-900 p-5 first:mt-0">
        <h2 className="text-2xl font-semibold text-slate-100">
          {report.title}
        </h2>
      </div>

      <p className="rounded-xl border border-slate-800 bg-slate-950 p-4 leading-7 text-slate-300">
        {report.summary}
      </p>
    </>
  );
}
function ResolutionPanel({
  title,
  items,
  emptyText,
}: {
  title: string;
  items: string[];
  emptyText: string;
}) {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-950 p-4">
      <h3 className="text-lg font-semibold text-slate-100">{title}</h3>

      {items.length > 0 ? (
        <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-300">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-slate-300">{emptyText}</p>
      )}
    </section>
  );
}
function EventHorizonCard({
  eventHorizon,
}: {
  eventHorizon: StructuredReport["eventHorizon"];
}) {
  if (!eventHorizon) {
    return null;
  }

  return (
    <>
      <div className="mt-8 rounded-2xl border border-slate-700 bg-slate-900 p-5">
        <h2 className="text-2xl font-semibold text-slate-100">
          Event Horizon
        </h2>
      </div>

      <p className="rounded-xl border border-slate-800 bg-slate-950 p-4 leading-7 text-slate-300">
        The important boundary is {eventHorizon.label}.
      </p>

      <p className="rounded-xl border border-slate-800 bg-slate-950 p-4 leading-7 text-slate-300">
        {eventHorizon.explanation}
      </p>
    </>
  );
}
function PathCard({ path }: { path: StructuredPath }) {
  return (
    <article className="rounded-3xl border border-slate-700 bg-slate-950 p-6 shadow-2xl">
      <div className="mb-6 border-b border-slate-800 pb-4">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
          Representative Path
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-100">
          Path {path.id} — {path.title}
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Establishing Shot
          </p>

          {path.establishingShotTitle && (
            <h3 className="mt-2 text-lg font-semibold text-slate-100">
              {path.establishingShotTitle}
            </h3>
          )}

          <p className="mt-3 leading-7 text-slate-300">
            {path.establishingShot}
          </p>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Strongest Case
          </p>

          <p className="mt-3 leading-7 text-slate-300">
            {path.strongestCase}
          </p>
        </section>
      </div>

      {path.supportingConditions.length > 0 && (
        <section className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Supporting Conditions
          </p>

          <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-300">
            {path.supportingConditions.map((condition) => (
              <li key={condition}>{condition}</li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
function NavigatorCard({
  navigator,
}: {
  navigator: StructuredNavigator;
}) {
  const keyChecks = navigator.sections[0]?.items ?? [];

  return (
    <article className="rounded-3xl border border-emerald-800/70 bg-emerald-950/20 p-6 shadow-2xl">
      <div className="mb-6 border-b border-emerald-900/70 pb-4">
        <p className="text-sm uppercase tracking-[0.2em] text-emerald-400/80">
          Navigator
        </p>

        <h2 className="mt-2 text-2xl font-semibold text-slate-100">
          Execution guidance
        </h2>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-emerald-900/70 bg-slate-950/70 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
              Path selected
            </p>
            <p className="mt-2 font-semibold text-slate-100">
              {navigator.pathSelected}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-900/70 bg-slate-950/70 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
              Status
            </p>
            <p className="mt-2 font-semibold text-slate-100">
              {navigator.status}
            </p>
          </div>
        </div>
      </div>

      <p className="rounded-2xl border border-emerald-900/70 bg-slate-950/70 p-5 leading-7 text-slate-300">
        {navigator.summary}
      </p>

      {keyChecks.length > 0 && (
        <section className="mt-4 rounded-2xl border border-emerald-900/70 bg-slate-950/70 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-400/80">
            {navigator.sections[0].title}
          </p>

          <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-300">
            {keyChecks.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      {navigator.pauseBeforeProceedingIf.length > 0 && (
        <section className="mt-4 rounded-2xl border border-amber-900/70 bg-amber-950/20 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-300/90">
            Pause before proceeding if
          </p>

          <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-300">
            {navigator.pauseBeforeProceedingIf.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      {navigator.nextAction && (
        <section className="mt-4 rounded-2xl border border-emerald-900/70 bg-slate-950/70 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-400/80">
            Next action
          </p>

          <p className="mt-3 leading-7 text-slate-300">
            {navigator.nextAction}
          </p>
        </section>
      )}
    </article>
  );
}
function selectedSliceMeta(sliceName: SliceName) {
  return slices.find((slice) => slice.id === sliceName) ?? slices[0];
}
function reportModeLabel(report: StructuredReport): string {
  if (report.mode === "execution") {
    return "Execution / Navigator";
  }

  return "Decision Exploration";
}

function customDecisionLabel(report: StructuredReport): string {
  const kind = report.decisionKind;

  if (kind === "PURCHASE") {
    return "Custom purchase decision";
  }

  if (kind === "RELOCATION") {
    return "Custom relocation decision";
  }

  if (kind === "PORTFOLIO") {
    return "Custom portfolio decision";
  }

  return "Custom decision";
}

function ClarifierWaitingCard({
  question,
  answerOptions,
  onSelect,
}: {
  question: string;
  answerOptions: string[];
  onSelect: (option: string) => void;
}) {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6">
        <p className="mb-3 text-xs uppercase tracking-[0.18em] text-slate-500">
          One quick question before we go further
        </p>

        <p className="mb-6 text-lg leading-7 text-slate-100">{question}</p>

        <div className="flex flex-col gap-2">
          {answerOptions.map((option) => (
            <button
              key={option}
              onClick={() => onSelect(option)}
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-left text-sm text-slate-200 transition hover:border-slate-400 hover:text-white"
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}

export default function Home() {
  const [selectedSlice, setSelectedSlice] = useState<SliceName>("portfolio");
  const [customInput, setCustomInput] = useState("");
  const [useCustomInput, setUseCustomInput] = useState(false);
  const [showStructuredData, setShowStructuredData] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [report, setReport] = useState<StructuredReport | null>(null);
  const [fullContext, setFullContext] = useState<DecisionContext | null>(null);
  const [showFullReasoning, setShowFullReasoning] = useState(false);

  const [braviaPending, setBraviaPending] = useState<{
    context: unknown;
    question: string;
    answerOptions: string[];
    round: 1 | 2;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadReport() {
      setLoadError(null);
      setBraviaPending(null);

      if (!useCustomInput && (selectedSlice === "bravia" || selectedSlice === "espresso")) {
        setReport(null);

        const phase1Endpoint = selectedSlice === "bravia" ? "/api/run-bravia" : "/api/run-espresso";

        try {
          const data = await fetchJsonWithTimeout<BraviaPhase1Response>(
            phase1Endpoint,
            selectedSlice === "bravia" ? "Bravia clarifying question" : "Espresso machine clarifying question"
          );

          if (!cancelled) {
            if (data.clarifier) {
              setBraviaPending({
                context: data.context,
                question: data.clarifier.question,
                answerOptions: data.clarifier.answerOptions,
                round: 1,
              });
            } else {
              throw new Error("No clarifying question was returned.");
            }
          }
        } catch (err) {
          if (!cancelled) {
            const message = err instanceof Error ? err.message : "Unknown error loading report.";
            setLoadError(message);
          }
        }

        return;
      }

      try {
        const nextReport =
          useCustomInput && customInput.trim()
            ? buildStructuredReport(await runCustomDecisionSlice(customInput.trim()))
            : await runSlice(selectedSlice);

        if (!cancelled) {
          setReport(nextReport);
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Unknown error loading report.";
          setLoadError(message);
        }
      }
    }

    loadReport();

    return () => {
      cancelled = true;
    };
  }, [customInput, selectedSlice, useCustomInput]);

  async function selectClarifierAnswer(answer: string) {
    if (!braviaPending) return;

    setLoadError(null);

    const basePath = selectedSlice === "espresso" ? "/api/run-espresso" : "/api/run-bravia";
    const endpoint = braviaPending.round === 1 ? `${basePath}/resume` : `${basePath}/resume2`;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context: braviaPending.context, selectedAnswer: answer }),
      });

      if (!response.ok) {
        throw new Error(`Failed to resume Bravia report: HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.status === "complete") {
        setReport(data.report as StructuredReport);
        setFullContext((data.fullContext as DecisionContext) ?? null);
        setBraviaPending(null);
        return;
      }

      // Only round 1's answer can produce a genuine round 2 - round 2 (resume2)
      // always finishes, per the hard 2-round cap, regardless of what it returns.
      if (braviaPending.round === 1 && data.clarifier?.hasQuestion) {
        setBraviaPending({
          context: data.context,
          question: data.clarifier.question,
          answerOptions: data.clarifier.answerOptions,
          round: 2,
        });
        return;
      }

      throw new Error("Unexpected response shape from resume endpoint.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error resuming report.";
      setLoadError(message);
    }
  }

  if (loadError) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="max-w-lg rounded-2xl border border-rose-800 bg-rose-950/30 p-6">
          <p className="font-semibold text-rose-200 mb-2">Couldn't load this report</p>
          <p className="text-sm text-rose-100/80">{loadError}</p>
        </div>
      </main>
    );
  }

  if (braviaPending) {
    return (
      <ClarifierWaitingCard
        question={braviaPending.question}
        answerOptions={braviaPending.answerOptions}
        onSelect={selectClarifierAnswer}
      />
    );
  }

  if (!report) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <p className="text-slate-300 mb-2">Loading decision report…</p>
          <p className="text-sm text-slate-500">
            This runs several real reasoning steps in sequence and can take up to a minute. No need to refresh - it will appear here when ready.
          </p>
        </div>
      </main>
    );
  }

  const currentSlice = selectedSliceMeta(selectedSlice);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-8">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.25em] text-slate-400">
            Decision Workspace
          </p>

          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            Guided decision exploration.
          </h1>

          <p className="mt-4 max-w-2xl text-slate-300">
            Select a prototype decision slice and view the structured report.
          </p>
        </div>

        <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="text-xl font-semibold text-slate-100">
            Try a custom decision
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            This is a simple deterministic prototype. It can recognise basic purchase, relocation, and portfolio decisions.
          </p>

          <textarea
            value={customInput}
            onChange={(event) => setCustomInput(event.target.value)}
            placeholder="Should I buy a used Lexus GS for £6,500?"
            className="mt-4 min-h-28 w-full resize-none rounded-xl border border-slate-700 bg-slate-950 p-4 text-slate-100 outline-none placeholder:text-slate-500 focus:border-slate-400"
          />

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={() => setUseCustomInput(true)}
              className="rounded-xl bg-slate-100 px-5 py-3 font-medium text-slate-950 transition hover:bg-white"
            >
              Build custom report
            </button>

            <button
              onClick={() => setUseCustomInput(false)}
              className="rounded-xl border border-slate-700 px-5 py-3 font-medium text-slate-200 transition hover:border-slate-400 hover:text-white"
            >
              Use example slices
            </button>
          </div>
        </section>

        <section className="mb-8 grid gap-3 md:grid-cols-2">
          {slices.map((slice) => (
            <button
              key={slice.id}
              onClick={() => setSelectedSlice(slice.id)}
              className={`rounded-2xl border p-5 text-left transition ${
                selectedSlice === slice.id
                  ? "border-slate-200 bg-slate-100 text-slate-950"
                  : "border-slate-800 bg-slate-900/70 text-slate-100 hover:border-slate-500"
              }`}
            >
              <h2 className="text-lg font-semibold">{slice.label}</h2>
              <p
                className={`mt-2 text-sm leading-6 ${
                  selectedSlice === slice.id
                    ? "text-slate-700"
                    : "text-slate-400"
                }`}
              >
                {slice.description}
              </p>
            </button>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl">
          <div className="mb-4 flex flex-col gap-4 border-b border-slate-800 pb-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                Workspace Preview
              </p>

              <h2 className="mt-1 text-2xl font-semibold">
                {useCustomInput && customInput.trim()
                  ? customDecisionLabel(report)
                  : currentSlice.label}
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                {useCustomInput && customInput.trim()
                  ? customInput.trim()
                  : currentSlice.description}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Mode
              </p>
              <p className="mt-1 font-semibold text-slate-100">
                {useCustomInput && customInput.trim()
                  ? reportModeLabel(report)
                  : currentSlice.mode}
              </p>
            </div>
          </div>

          {fullContext && (
            <div className="mb-4 flex justify-end">
              <button
                onClick={() => setShowFullReasoning(!showFullReasoning)}
                className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-400 hover:text-white"
              >
                {showFullReasoning ? "Show polished report" : "Show full reasoning (every step)"}
              </button>
            </div>
          )}

          {showFullReasoning && fullContext ? (
            <FullReasoningView context={fullContext} />
          ) : (
            <WorkspaceReportView report={report} />
          )}

          <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <button
              onClick={() => setShowStructuredData(!showStructuredData)}
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-400 hover:text-white"
            >
              {showStructuredData ? "Hide structured data" : "Show structured data"}
            </button>

            {showStructuredData && (
              <pre className="mt-4 max-h-[32rem] overflow-auto rounded-xl bg-slate-950 p-5 text-xs leading-6 text-slate-300">
                {JSON.stringify(report, null, 2)}
              </pre>
            )}
          </section>
        </section>
      </section>
    </main>
  );
}