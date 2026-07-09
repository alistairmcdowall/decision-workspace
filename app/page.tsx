"use client";

import { useMemo, useState } from "react";
import { runBraviaSlice } from "./engine/runBraviaSlice";
import { runBraviaNavigatorSlice } from "./engine/runBraviaNavigatorSlice";
import { runSingaporeSlice } from "./engine/runSingaporeSlice";
import { runPortfolioSlice } from "./engine/runPortfolioSlice";
import { renderGuidedReport } from "./engine/presentation/guidedRenderer";

type SliceName = "bravia" | "bravia-navigator" | "singapore" | "portfolio";

const slices: {
  id: SliceName;
  label: string;
  description: string;
}[] = [
  {
    id: "bravia",
    label: "Bravia purchase",
    description: "A purchase decision with verification still unresolved.",
  },
  {
    id: "bravia-navigator",
    label: "Bravia + Navigator",
    description: "A selected purchase path with pre-payment execution checks.",
  },
  {
    id: "singapore",
    label: "Singapore relocation",
    description: "A major family relocation decision.",
  },
  {
    id: "portfolio",
    label: "Retirement portfolio",
    description: "An 8–10 year growth portfolio decision.",
  },
];

function runSlice(sliceName: SliceName): string {
  const context =
    sliceName === "bravia"
      ? runBraviaSlice()
      : sliceName === "bravia-navigator"
        ? runBraviaNavigatorSlice()
        : sliceName === "singapore"
          ? runSingaporeSlice()
          : runPortfolioSlice();

  return renderGuidedReport(context);
}

export default function Home() {
  const [selectedSlice, setSelectedSlice] = useState<SliceName>("portfolio");

  const report = useMemo(() => runSlice(selectedSlice), [selectedSlice]);

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
          <div className="mb-4 flex items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                Report Preview
              </p>
              <h2 className="mt-1 text-2xl font-semibold">
                {slices.find((slice) => slice.id === selectedSlice)?.label}
              </h2>
            </div>
          </div>

          <pre className="whitespace-pre-wrap rounded-xl bg-slate-950 p-5 text-sm leading-7 text-slate-200">
            {report}
          </pre>
        </section>
      </section>
    </main>
  );
}