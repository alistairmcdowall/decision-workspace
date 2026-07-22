import type { StructuredReport } from "../engine/presentation/structuredReport";
import type { DecisionContext } from "../engine/types";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
      <h2 className="mb-3 text-xl font-semibold text-slate-100">{title}</h2>
      {children}
    </section>
  );
}

function List({ items }: { items: string[] | undefined }) {
  if (!items || items.length === 0) return <p className="text-slate-500 text-sm">None</p>;
  return (
    <ul className="list-disc space-y-1 pl-5 text-sm text-slate-300">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export function FullReasoningView({ context }: { context: DecisionContext }) {
  const landscape = context.landscape;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-amber-800/60 bg-amber-950/20 p-4">
        <p className="text-sm text-amber-200">
          Full reasoning view - every real step the system took, in order, unedited.
        </p>
      </div>

      <Section title="Reframer">
        <p className="text-sm text-slate-400 mb-2">Status: {context.reframer?.status}</p>
        <p className="text-slate-200">{context.reframer?.governingObjective}</p>
        {context.reframer?.suggestedReframe && (
          <p className="mt-2 text-sky-300 text-sm">
            Suggested reframe: {context.reframer.suggestedReframe}
          </p>
        )}
      </Section>

      {landscape?.v1 && (
        <Section title="Landscape - initial pass (V1)">
          <p className="text-slate-200 mb-2">{landscape.v1.subject}</p>
          <p className="text-sm text-slate-400 mb-3">{landscape.v1.commitment}</p>
          <p className="text-sm font-semibold text-slate-300 mb-1">Decision axes</p>
          <List items={landscape.v1.decisionAxes} />
          <p className="text-sm font-semibold text-slate-300 mt-3 mb-1">Resolved</p>
          <List items={landscape.v1.resolvedUncertainties} />
          <p className="text-sm font-semibold text-slate-300 mt-3 mb-1">Remaining</p>
          <List items={landscape.v1.remainingUncertainties} />
        </Section>
      )}

<Section title={`Guardian / Pragmatist / Empathiser (${(context.clarifierHistory ?? []).length > 0 ? "shown here is the LATEST pass, after clarifying answer(s)" : "single pass"})`}>
        <p className="text-sm font-semibold text-sky-300 mb-1">Guardian</p>
        {context.panel?.guardian?.map((g) => (
          <p key={g.protectedValue} className="text-sm text-slate-300 mb-2">
            <span className="font-semibold">{g.protectedValue}:</span> {g.concern}
          </p>
        ))}
        <p className="text-sm font-semibold text-amber-300 mt-3 mb-1">Pragmatist</p>
        <List items={context.panel?.pragmatist?.map((p) => p.requirement)} />
        <p className="text-sm font-semibold text-rose-300 mt-3 mb-1">Empathiser</p>
        <List items={context.panel?.empathiser?.map((e) => e.humanFactor)} />
      </Section>

      <Section title={`Auditor (${(context.clarifierHistory ?? []).length > 0 ? "re-run after clarifying answer(s)" : "single pass"})`}>
        <p className="text-sm text-slate-400 mb-2">
          {context.auditor?.readinessState} - {context.auditor?.readinessScore}/100 - Evidence:{" "}
          {context.auditor?.evidenceStrength} - Consistency: {context.auditor?.internalConsistency}
        </p>
        <p className="text-sm font-semibold text-slate-300 mb-1">Assumptions</p>
        <List items={context.auditor?.assumptions} />
        <p className="text-sm font-semibold text-slate-300 mt-3 mb-1">Missing information</p>
        <List items={context.auditor?.missingInformation} />
        <p className="text-sm font-semibold text-slate-300 mt-3 mb-1">Blocking uncertainties</p>
        <List items={context.auditor?.blockingUncertainties} />
      </Section>

      <Section title="Clarifier - full history">
        {(context.clarifierHistory ?? []).length === 0 && (
          <p className="text-sm text-slate-500">No clarifying questions were asked.</p>
        )}
        {(context.clarifierHistory ?? []).map((round, i) => (
          <div key={i} className="mb-4 rounded-xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Round {i + 1}</p>
            <p className="text-slate-200 mb-2">{round.question}</p>
            <p className="text-sm text-emerald-300 mb-2">Selected: {round.selectedAnswer}</p>
            <p className="text-sm text-slate-400">
              Effect ({round.resolutionState}): {round.effect}
            </p>
          </div>
        ))}
      </Section>

      {landscape?.v2 && (
        <Section title="Landscape - final pass (V2, after all clarifying rounds)">
          <p className="text-slate-200 mb-2">{landscape.v2.subject}</p>
          <p className="text-sm text-slate-400 mb-3">{landscape.v2.commitment}</p>
          <p className="text-sm font-semibold text-slate-300 mb-1">Decision axes</p>
          <List items={landscape.v2.decisionAxes} />
          <p className="text-sm font-semibold text-slate-300 mt-3 mb-1">Resolved</p>
          <List items={landscape.v2.resolvedUncertainties} />
          <p className="text-sm font-semibold text-slate-300 mt-3 mb-1">Remaining</p>
          <List items={landscape.v2.remainingUncertainties} />
        </Section>
      )}

      <Section title="Representative Paths, Establishing Shots, Steelman">
        {(context.representativePaths ?? []).map((path) => {
          const shot = context.establishingShots?.find((s) => s.pathId === path.id);
          const steel = context.steelman?.find((s) => s.pathId === path.id);
          return (
            <div key={path.id} className="mb-4 rounded-xl border border-slate-800 bg-slate-950 p-4">
              <p className="font-semibold text-slate-100 mb-2">
                Path {path.id} - {path.title}
              </p>
              <p className="text-sm text-slate-400 mb-2">
                Commitment: {path.commitment.type} - {path.commitment.amount} {path.commitment.currency}
              </p>
              <p className="text-sm text-slate-300 mb-2">Outcome: {path.outcome}</p>
              {shot && (
                <p className="text-sm text-slate-300 italic mb-2">
                  "{shot.title}" - {shot.shot}
                </p>
              )}
              {steel && (
                <>
                  <p className="text-sm text-slate-300 mb-1">
                    <span className="font-semibold">{steel.objective}:</span> {steel.case}
                  </p>
                  <List items={steel.supportingConditions} />
                </>
              )}
            </div>
          );
        })}
      </Section>

      {context.eventHorizon && (
        <Section title="Event Horizon">
          <p className="text-slate-200 mb-2">{context.eventHorizon.label}</p>
          <p className="text-sm text-slate-400 mb-2">{context.eventHorizon.explanation}</p>
          {context.eventHorizon.transition && (
            <p className="text-sm text-slate-500">Transition: {context.eventHorizon.transition}</p>
          )}
        </Section>
      )}
    </div>
  );
}