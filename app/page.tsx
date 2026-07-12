"use client";

import { useMemo, useState } from "react";
import { runBraviaSlice } from "./engine/runBraviaSlice";
import { runBraviaNavigatorSlice } from "./engine/runBraviaNavigatorSlice";
import { runSingaporeSlice } from "./engine/runSingaporeSlice";
import { runPortfolioSlice } from "./engine/runPortfolioSlice";
import { WorkspaceReportView } from "./ui/WorkspaceReportView";
import {
  buildStructuredReport,
  type StructuredReport,
  type StructuredPath,
  type StructuredNavigator,
} from "./engine/presentation/structuredReport";

type SliceName = "bravia" | "bravia-navigator" | "singapore" | "portfolio";

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

function runSlice(sliceName: SliceName): StructuredReport {
  const context =
    sliceName === "bravia"
      ? runBraviaSlice()
      : sliceName === "bravia-navigator"
        ? runBraviaNavigatorSlice()
        : sliceName === "singapore"
          ? runSingaporeSlice()
          : runPortfolioSlice();

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
export default function Home() {
  const [selectedSlice, setSelectedSlice] = useState<SliceName>("portfolio");
  const [showStructuredData, setShowStructuredData] = useState(false);
  
  const report = useMemo(() => runSlice(selectedSlice), [selectedSlice]);
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
      {currentSlice.label}
    </h2>

    <p className="mt-2 text-sm leading-6 text-slate-400">
      {currentSlice.description}
    </p>
  </div>

  <div className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3">
    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
      Mode
    </p>
    <p className="mt-1 font-semibold text-slate-100">
      {currentSlice.mode}
    </p>
  </div>
</div>

<WorkspaceReportView report={report} />

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