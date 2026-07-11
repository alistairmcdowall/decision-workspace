import type {
  StructuredReport,
  StructuredPath,
  StructuredNavigator,
} from "../engine/presentation/structuredReport";

export function WorkspaceReportView({ report }: { report: StructuredReport }) {
  return (
    <div className="space-y-4">
      <DecisionFrame report={report} />

      <WorkspaceSummaryStrip report={report} />

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
function WorkspaceSummaryStrip({ report }: { report: StructuredReport }) {
  const items = [
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
    {
      label: "Navigator",
      value: report.navigator ? "Yes" : "No",
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