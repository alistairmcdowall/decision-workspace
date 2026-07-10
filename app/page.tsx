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
function ReportView({ report }: { report: string }) {
  const lines = report.split("\n");

  type Block =
    | {
        type: "section";
        title: string;
      }
    | {
        type: "subsection";
        title: string;
      }
    | {
        type: "paragraph";
        content: string[];
      }
    | {
        type: "list";
        content: string[];
      }
    | {
        type: "path";
        title: string;
        content: string[];
      }
    | {
        type: "navigator";
        content: string[];
      };

  const blocks: Block[] = [];
  let currentList: string[] = [];
  let currentPath: { title: string; content: string[] } | null = null;
  let currentNavigator: string[] | null = null;

  function flushList() {
    if (currentList.length > 0) {
      if (currentPath) {
        currentPath.content.push(...currentList.map((item) => `- ${item}`));
      } else if (currentNavigator) {
        currentNavigator.push(...currentList.map((item) => `- ${item}`));
      } else {
        blocks.push({
          type: "list",
          content: currentList,
        });
      }

      currentList = [];
    }
  }

  function flushPath() {
    flushList();

    if (currentPath) {
      blocks.push({
        type: "path",
        title: currentPath.title,
        content: currentPath.content,
      });

      currentPath = null;
    }
  }

  function flushNavigator() {
    flushList();

    if (currentNavigator) {
      blocks.push({
        type: "navigator",
        content: currentNavigator,
      });

      currentNavigator = null;
    }
  }

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      continue;
    }

    if (trimmed.startsWith("## Path ")) {
      flushNavigator();
      flushPath();

      currentPath = {
        title: trimmed.replace(/^## /, ""),
        content: [],
      };
      continue;
    }

    if (trimmed === "# Navigator") {
      flushPath();
      flushNavigator();
      currentNavigator = [];
      continue;
    }

    if (trimmed.startsWith("# ")) {
      flushPath();
      flushNavigator();

      blocks.push({
        type: "section",
        title: trimmed.replace(/^# /, ""),
      });
      continue;
    }

    if (trimmed.startsWith("## ")) {
      flushList();

      if (currentPath) {
        currentPath.content.push(trimmed);
      } else if (currentNavigator) {
        currentNavigator.push(trimmed);
      } else {
        blocks.push({
          type: "subsection",
          title: trimmed.replace(/^## /, ""),
        });
      }

      continue;
    }

    if (trimmed.startsWith("### ")) {
      flushList();

      if (currentPath) {
        currentPath.content.push(trimmed);
      } else if (currentNavigator) {
        currentNavigator.push(trimmed);
      } else {
        blocks.push({
          type: "subsection",
          title: trimmed.replace(/^### /, ""),
        });
      }

      continue;
    }

    if (trimmed.startsWith("- ")) {
      currentList.push(trimmed.replace(/^- /, ""));
      continue;
    }

    flushList();

    if (currentPath) {
      currentPath.content.push(trimmed);
    } else if (currentNavigator) {
      currentNavigator.push(trimmed);
    } else {
      blocks.push({
        type: "paragraph",
        content: [trimmed],
      });
    }
  }

  flushPath();
  flushNavigator();
  flushList();

  return (
    <div className="space-y-4">
      {blocks.map((block, index) => {
        if (block.type === "path") {
          return (
            <PathCard
              key={index}
              title={block.title}
              content={block.content}
            />
          );
        }

        if (block.type === "navigator") {
          return <NavigatorCard key={index} content={block.content} />;
        }

        if (block.type === "section") {
          return (
            <div
              key={index}
              className="mt-8 rounded-2xl border border-slate-700 bg-slate-900 p-5 first:mt-0"
            >
              <h2 className="text-2xl font-semibold text-slate-100">
                {block.title}
              </h2>
            </div>
          );
        }

        if (block.type === "subsection") {
          return (
            <div
              key={index}
              className="rounded-xl border border-slate-800 bg-slate-950 p-4"
            >
              <h3 className="text-lg font-semibold text-slate-100">
                {block.title}
              </h3>
            </div>
          );
        }

        if (block.type === "list") {
          return (
            <ul
              key={index}
              className="list-disc space-y-2 rounded-xl border border-slate-800 bg-slate-950 p-5 pl-8 text-slate-300"
            >
              {block.content.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          );
        }

        return (
          <p
            key={index}
            className="rounded-xl border border-slate-800 bg-slate-950 p-4 leading-7 text-slate-300"
          >
            {block.content.join(" ")}
          </p>
        );
      })}
    </div>
  );
}
function PathCard({
  title,
  content,
}: {
  title: string;
  content: string[];
}) {
  const establishingShotIndex = content.findIndex((line) =>
    line.startsWith("### Establishing Shot")
  );

  const strongestCaseIndex = content.findIndex((line) =>
    line.startsWith("### Strongest Case")
  );

  const supportingConditionsIndex = content.findIndex((line) =>
    line.startsWith("Supporting conditions:")
  );

  const establishingShot =
    establishingShotIndex >= 0 && strongestCaseIndex > establishingShotIndex
      ? content.slice(establishingShotIndex + 1, strongestCaseIndex).join(" ")
      : "";

  const establishingShotTitle =
    establishingShotIndex >= 0
      ? content[establishingShotIndex].replace("### Establishing Shot", "").replace(/^ — /, "")
      : "";

  const strongestCase =
    strongestCaseIndex >= 0
      ? content
          .slice(
            strongestCaseIndex + 1,
            supportingConditionsIndex >= 0
              ? supportingConditionsIndex
              : content.length
          )
          .join(" ")
      : "";

  const supportingConditions =
    supportingConditionsIndex >= 0
      ? content
          .slice(supportingConditionsIndex + 1)
          .filter((line) => line.startsWith("- "))
          .map((line) => line.replace(/^- /, ""))
      : [];

  return (
    <article className="rounded-3xl border border-slate-700 bg-slate-950 p-6 shadow-2xl">
      <div className="mb-6 border-b border-slate-800 pb-4">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
          Representative Path
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-100">{title}</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Establishing Shot
          </p>

          {establishingShotTitle && (
            <h3 className="mt-2 text-lg font-semibold text-slate-100">
              {establishingShotTitle}
            </h3>
          )}

          <p className="mt-3 leading-7 text-slate-300">{establishingShot}</p>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Strongest Case
          </p>

          <p className="mt-3 leading-7 text-slate-300">{strongestCase}</p>
        </section>
      </div>

      {supportingConditions.length > 0 && (
        <section className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Supporting Conditions
          </p>

          <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-300">
            {supportingConditions.map((condition) => (
              <li key={condition}>{condition}</li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
function NavigatorCard({ content }: { content: string[] }) {
  const pathSelected =
    content
      .find((line) => line.startsWith("**Path selected:**"))
      ?.replace("**Path selected:**", "")
      .trim() ?? "";

  const status =
    content
      .find((line) => line.startsWith("**Status:**"))
      ?.replace("**Status:**", "")
      .trim() ?? "";

  const keyChecksIndex = content.findIndex((line) =>
    line.startsWith("## Key checks")
  );

  const pauseIndex = content.findIndex((line) =>
    line.startsWith("## Pause before proceeding if")
  );

  const nextActionIndex = content.findIndex((line) =>
    line.startsWith("## Next action")
  );

  const summaryStartIndex = content.findIndex(
    (line) =>
      !line.startsWith("**Path selected:**") &&
      !line.startsWith("**Status:**")
  );

  const summaryEndIndex =
    keyChecksIndex >= 0
      ? keyChecksIndex
      : pauseIndex >= 0
        ? pauseIndex
        : nextActionIndex >= 0
          ? nextActionIndex
          : content.length;

  const summary =
    summaryStartIndex >= 0
      ? content.slice(summaryStartIndex, summaryEndIndex).join(" ")
      : "";

  const keyChecks =
    keyChecksIndex >= 0
      ? content
          .slice(
            keyChecksIndex + 1,
            pauseIndex >= 0
              ? pauseIndex
              : nextActionIndex >= 0
                ? nextActionIndex
                : content.length
          )
          .filter((line) => line.startsWith("- "))
          .map((line) => line.replace(/^- /, ""))
      : [];

  const pauseItems =
    pauseIndex >= 0
      ? content
          .slice(
            pauseIndex + 1,
            nextActionIndex >= 0 ? nextActionIndex : content.length
          )
          .filter((line) => line.startsWith("- "))
          .map((line) => line.replace(/^- /, ""))
      : [];

  const nextAction =
    nextActionIndex >= 0
      ? content
          .slice(nextActionIndex + 1)
          .filter((line) => !line.startsWith("## "))
          .join(" ")
      : "";

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
          {pathSelected && (
            <div className="rounded-2xl border border-emerald-900/70 bg-slate-950/70 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Path selected
              </p>
              <p className="mt-2 font-semibold text-slate-100">
                {pathSelected}
              </p>
            </div>
          )}

          {status && (
            <div className="rounded-2xl border border-emerald-900/70 bg-slate-950/70 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Status
              </p>
              <p className="mt-2 font-semibold text-slate-100">{status}</p>
            </div>
          )}
        </div>
      </div>

      {summary && (
        <p className="rounded-2xl border border-emerald-900/70 bg-slate-950/70 p-5 leading-7 text-slate-300">
          {summary}
        </p>
      )}

      {keyChecks.length > 0 && (
        <section className="mt-4 rounded-2xl border border-emerald-900/70 bg-slate-950/70 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-400/80">
            Key checks before action
          </p>

          <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-300">
            {keyChecks.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      {pauseItems.length > 0 && (
        <section className="mt-4 rounded-2xl border border-amber-900/70 bg-amber-950/20 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-300/90">
            Pause before proceeding if
          </p>

          <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-300">
            {pauseItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      {nextAction && (
        <section className="mt-4 rounded-2xl border border-emerald-900/70 bg-slate-950/70 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-400/80">
            Next action
          </p>

          <p className="mt-3 leading-7 text-slate-300">{nextAction}</p>
        </section>
      )}
    </article>
  );
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

          <ReportView report={report} />
        </section>
      </section>
    </main>
  );
}