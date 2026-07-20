import type {
  StructuredReport,
  StructuredPath,
  StructuredNavigator,
  StructuredDiagnostic,
  StructuredReasoningPanel,
  StructuredAuditor,
  StructuredReframer,
} from "../engine/presentation/structuredReport";

export function WorkspaceReportView({ report }: { report: StructuredReport }) {
  return (
    <div className="space-y-4">
      <DecisionFrame report={report} />

      <WorkspaceSummaryStrip report={report} />

      {report.mode === "execution" && (
        <ExecutionStateStrip report={report} />
      )}

      {report.reframer && <ReframerSection reframer={report.reframer} />} 

      {report.reasoningPanel && (
        <ReasoningPanelSection panel={report.reasoningPanel} />
      )}

      {report.auditor && <AuditorSection auditor={report.auditor} />}

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

      {report.paths.length === 1 && (
        <p className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm leading-6 text-slate-400">
          Only one clear path exists at this stage - the decision has not yet split into distinct alternatives worth comparing.
        </p>
      )}

      {report.paths.map((path) => (
        <PathCard key={path.id} path={path} />
      ))}

{report.eventHorizon && (
        <EventHorizonCard eventHorizon={report.eventHorizon} />
      )}

      {report.diagnostics.length > 0 && (
        <DiagnosticsPanel diagnostics={report.diagnostics} />
      )}

      {report.navigator && <NavigatorCard navigator={report.navigator} />}

      <p className="rounded-xl border border-slate-800 bg-slate-950 p-4 leading-7 text-slate-300">
        {report.closingNote}
      </p>
    </div>
  );
}
function ExecutionStateStrip({ report }: { report: StructuredReport }) {
  return (
    <section className="grid gap-3 md:grid-cols-2">
      {report.selectedPath && (
        <div className="rounded-2xl border border-emerald-900/70 bg-emerald-950/20 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-emerald-400/80">
            Selected path
          </p>
          <p className="mt-2 font-semibold text-slate-100">
            {report.selectedPath}
          </p>
        </div>
      )}

      {report.executionStatus && (
        <div className="rounded-2xl border border-emerald-900/70 bg-emerald-950/20 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-emerald-400/80">
            Execution status
          </p>
          <p className="mt-2 font-semibold text-slate-100">
            {report.executionStatus}
          </p>
        </div>
      )}
    </section>
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
function WorkspaceSummaryStrip({ report }: { report: StructuredReport }) {
  const items = [
    {
      label: "Mode",
      value: report.mode === "execution" ? "Execution" : "Exploration",
    },
    {
      label: "Resolved",
      value: report.resolved.length.toString(),
    },
    {
      label: "Open blockers",
      value: report.remaining.length.toString(),
    },
    {
      label: "Paths",
      value: report.paths.length.toString(),
    },
  ];

  return (
    <section className="grid gap-3 md:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl border border-slate-800 bg-slate-950 p-4"
        >
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
            {item.label}
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-100">
            {item.value}
          </p>
        </div>
      ))}
    </section>
  );
}

function ReasoningPanelSection({ panel }: { panel: StructuredReasoningPanel }) {
  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
      <h2 className="mb-4 text-2xl font-semibold text-slate-100">
        Reasoning Panel
      </h2>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-sky-900/60 bg-slate-950 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-sky-400/80">
            Guardian
          </p>
          <div className="mt-3 space-y-3">
            {panel.guardian.map((g) => (
              <div key={g.protectedValue}>
                <p className="font-semibold text-slate-100">{g.protectedValue}</p>
                <p className="mt-1 text-sm leading-6 text-slate-400">{g.concern}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-amber-900/60 bg-slate-950 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-amber-400/80">
            Pragmatist
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300">
            {panel.pragmatist.map((p) => (
              <li key={p.requirement}>{p.requirement}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-rose-900/60 bg-slate-950 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-rose-400/80">
            Empathiser
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300">
            {panel.empathiser.map((e) => (
              <li key={e.humanFactor}>{e.humanFactor}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function AuditorSection({ auditor }: { auditor: StructuredAuditor }) {
  const readinessColor =
    auditor.readinessState === "GREEN"
      ? "bg-emerald-600"
      : auditor.readinessState === "AMBER"
        ? "bg-amber-600"
        : "bg-rose-600";

  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold text-slate-100">Auditor</h2>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white ${readinessColor}`}
        >
          {auditor.readinessState} · {auditor.readinessScore}/100
        </span>
      </div>

      <p className="mb-4 text-sm text-slate-400">
        Evidence strength: {auditor.evidenceStrength} · Internal consistency:{" "}
        {auditor.internalConsistency}
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-sm font-semibold text-slate-200">Assumptions</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-400">
            {auditor.assumptions.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-200">Missing information</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-400">
            {auditor.missingInformation.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-200">Supported so far</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-400">
            {auditor.supportedConclusions.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-200">Not yet supported</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-400">
            {auditor.unsupportedConclusions.map((u) => (
              <li key={u}>{u}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
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

function DiagnosticsPanel({
  diagnostics,
}: {
  diagnostics: StructuredDiagnostic[];
}) {
  return (
    <section className="rounded-3xl border border-slate-700 bg-slate-950 p-6 shadow-2xl">
      <div className="mb-6 border-b border-slate-800 pb-4">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
          Evidence Layer
        </p>

        <h2 className="mt-2 text-2xl font-semibold text-slate-100">
          Recommended Diagnostics
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {diagnostics.map((diagnostic) => (
          <article
            key={diagnostic.id}
            className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  {diagnostic.uncertaintyClass}
                </p>

                <h3 className="mt-2 text-lg font-semibold text-slate-100">
                  {diagnostic.name}
                </h3>
              </div>

              <span className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-[0.14em] text-slate-400">
                {diagnostic.status}
              </span>
            </div>

            <p className="mt-3 leading-7 text-slate-300">
              {diagnostic.reason}
            </p>

            {diagnostic.inputsNeeded.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-semibold text-slate-200">
                  Inputs needed
                </p>

                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-400">
                  {diagnostic.inputsNeeded.map((input) => (
                    <li key={input}>{input}</li>
                  ))}
                </ul>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
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

function ReframerSection({ reframer }: { reframer: StructuredReframer }) {
  const statusColor =
    reframer.status === "PASS"
      ? "bg-slate-700"
      : reframer.status === "CLARIFY"
        ? "bg-sky-700"
        : reframer.status === "SUGGEST_REFRAME"
          ? "bg-violet-700"
          : reframer.status === "PREREQUISITE_REQUIRED"
            ? "bg-amber-700"
            : "bg-emerald-700";

  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <h2 className="text-2xl font-semibold text-slate-100">Reframer</h2>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white ${statusColor}`}
        >
          {reframer.status.replace(/_/g, " ")}
        </span>
      </div>

      <p className="leading-7 text-slate-300">{reframer.governingObjective}</p>

      {reframer.suggestedReframe && (
        <div className="mt-4 rounded-xl border border-violet-800/60 bg-violet-950/20 p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-violet-300/90">
            An alternative framing to consider
          </p>
          <p className="mt-2 leading-6 text-slate-200">{reframer.suggestedReframe}</p>
        </div>
      )}

      {reframer.clarifyOptions && reframer.clarifyOptions.length > 0 && (
        <div className="mt-4 rounded-xl border border-sky-800/60 bg-sky-950/20 p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-sky-300/90">
            This could mean a few different things
          </p>
          <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-slate-200">
            {reframer.clarifyOptions.map((opt) => (
              <li key={opt}>{opt}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}