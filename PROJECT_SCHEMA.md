# Decision Workspace Schema

Canonical snapshot reflecting the live `app/engine` code as of 15 July 2026 -
the first version where real LLM reasoning is wired into the live product,
not just isolated test routes.

This file describes the current implemented data model and rendering contract
for Decision Workspace. If older Docs conflict with this file, this file
should be treated as the working schema unless the code has moved on. If this
file conflicts with the current TypeScript types, the TypeScript types and a
green `npm run build` are the source of truth.

Standing decisions, carried forward:

- `app/engine` wins over `lib/decisionengine.ts`.
- A green build wins over `DECISION_WORKSPACE_CONSTITUTION.md`.
- `lib/decisionengine.ts` is legacy/dead code unless explicitly revived.
- No code changes without the schema being agreed first.

**New standing rule as of today, learned the hard way (see section 24):**
Any engine component that calls an external API (currently: Guardian,
Pragmatist, Empathiser, Auditor) must only ever be invoked from a server-side
API route, never directly from `page.tsx` or any other `"use client"` file.
Client components cannot see `ANTHROPIC_API_KEY` - Next.js keeps it out of
browser code by design. This is not a bug to work around; it is the correct
security boundary, and the fix is always "add a server route," never "find a
way to expose the key to the client."

---

## 1. Project shape

Decision Workspace is a Next.js / TypeScript decision modelling app.

**Reasoning patterns, updated.** As of today there are effectively four
patterns in play, not three:

### Pattern A - full pipeline, now with real reasoning (Bravia, Bravia + Navigator)

```text
reframer(context)              [fixture - hardcoded Bravia text]
-> landscape(context)          [fixture in content, but genuinely branches
                                 structurally on clarifierResponse presence
                                 to produce v1 vs v2]
-> guardian(context)           [REAL - calls Claude API]
-> pragmatist(context)         [REAL - calls Claude API]
-> empathiser(context)         [REAL - calls Claude API]
-> auditor(context)            [REAL - calls Claude API, reasons about the
                                 other three lenses' actual output]
-> clarifier(context)          [fixture - hardcoded Bravia text]
-> landscape(context)          [v2, re-run after clarifier response]
-> paths(context)               [fixture]
-> eventHorizons(context)       [genuinely DecisionKind-driven]
-> establishingShots(context)   [fixture]
-> steelman(context)            [fixture]
-> buildStructuredReport(context)
```

This whole sequence now runs **server-side**, triggered via
`GET /api/run-bravia` or `GET /api/run-bravia-navigator`, not directly from
the browser. `page.tsx` fetches the finished `StructuredReport` as JSON.

Guardian, Pragmatist, Empathiser, and Auditor are no longer hardcoded
fixtures - see section 1a below for what "real" means here precisely.
Reframer, Landscape (in content), Clarifier, Paths, Establishing Shots, and
Steelman are still hardcoded Bravia fixtures, unchanged from before.

### Pattern B - hand-authored fixture, no shared functions (unchanged)

```text
DecisionContext literal, built by hand
(panel: {}, landscape: { v2 } only, eventHorizon set directly)
-> buildStructuredReport(context)   [runs client-side, still synchronous]
-> WorkspaceReportView
```

Used by `runSingaporeSlice.ts` and `runPortfolioSlice.ts`. **Not touched
today, deliberately out of scope.** Both still run directly in the browser via
`page.tsx`, which is fine precisely because neither one calls any of the four
real lens functions - there is no API key dependency to hit the client/server
boundary problem. If either of these is ever upgraded to real reasoning, it
will need the same server-route treatment Bravia just got.

### Pattern C - deterministic classifier + local templates (unchanged)

```text
input prompt
-> classify DecisionKind (regex/keyword match)
-> local template logic for paths/shots/steelman/diagnostics
-> eventHorizons(context)        [the one shared function this pattern uses]
-> buildStructuredReport(context)  [runs client-side]
```

Used by `runCustomDecisionSlice.ts`. **Not touched today.** Still has zero
connection to Guardian/Pragmatist/Empathiser/Auditor. This is the next
genuinely open piece of work, and it is harder than today's fix: the four
lenses need a real `landscape.v1` to reason from well (established
empirically yesterday - a starved fixture produced noticeably thinner
Guardian output than a fixture with a real decision landscape attached), and
nothing currently builds a landscape dynamically from arbitrary text.
`landscape.ts` is still hardcoded to Bravia only.

### Pattern D - isolated test routes (new today, dev-only)

```text
GET /api/test-guardian
GET /api/test-pragmatist
GET /api/test-empathiser
GET /api/test-auditor              [runs guardian+pragmatist+empathiser+auditor
                                     in sequence, returns full panel]
GET /api/test-panel-sister         [same four-lens sequence, different fixture]
```

These exist purely for development testing of the four real lens components
in isolation, against hand-built fixtures in `app/engine/testFixtures.ts`.
**These are not part of the production app surface** - nothing in `page.tsx`
calls them, and they are safe to delete before any real deployment. Useful to
keep during active development for quickly testing prompt changes to a single
lens without running the whole app.

Main files, updated:

```text
app/page.tsx
app/ui/WorkspaceReportView.tsx
app/engine/types.ts
app/engine/reframer.ts            (Pattern A only - hardcoded fixture)
app/engine/landscape.ts           (Pattern A only - hardcoded content,
                                    genuine v1/v2 structural branching)
app/engine/guardian.ts            (REAL - see section 1a)
app/engine/pragmatist.ts          (REAL - see section 1a)
app/engine/empathiser.ts          (REAL - see section 1a)
app/engine/auditor.ts             (REAL - see section 1a)
app/engine/clarifier.ts           (Pattern A only - hardcoded fixture)
app/engine/paths.ts               (Pattern A only - hardcoded fixture)
app/engine/establishingShots.ts   (Pattern A only - hardcoded fixture)
app/engine/steelman.ts            (Pattern A only - hardcoded fixture)
app/engine/eventHorizons.ts       (shared, genuinely DecisionKind-aware)
app/engine/llm/callClaude.ts      (NEW - shared Anthropic API wrapper)
app/engine/testFixtures.ts        (NEW - dev-only test fixtures)
app/engine/panelHtml.ts           (NEW - dev-only readable HTML formatter
                                    for test routes, not used in production UI)
app/engine/runCustomDecisionSlice.ts
app/engine/runBraviaSlice.ts      (now async - awaits all four real lenses)
app/engine/runBraviaNavigatorSlice.ts  (now async - awaits runBraviaSlice)
app/engine/runSingaporeSlice.ts   (still synchronous, untouched)
app/engine/runPortfolioSlice.ts   (still synchronous, untouched)
app/engine/presentation/structuredReport.ts  (now includes reasoningPanel
                                                and auditor fields)
app/engine/presentation/guidedRenderer.ts
app/engine/presentation/CleanRenderer.ts
app/api/run-bravia/route.ts             (NEW - production server route)
app/api/run-bravia-navigator/route.ts   (NEW - production server route)
app/api/test-guardian/route.ts          (NEW - dev-only)
app/api/test-pragmatist/route.ts        (NEW - dev-only)
app/api/test-empathiser/route.ts        (NEW - dev-only)
app/api/test-auditor/route.ts           (NEW - dev-only)
app/api/test-panel-sister/route.ts      (NEW - dev-only)
```

**Not a main file:** `lib/decisionengine.ts` still exists, still imported
nowhere. Unchanged - see section 22.

Casing: `app/engine/presentation` remains lowercase, still confirmed
consistent in git-tracked paths.

---

## 1a. What "real" means for Guardian, Pragmatist, Empathiser, Auditor

Each of these four files now:

- Is an `async function` returning `Promise<DecisionContext>`, not
  `DecisionContext` directly.
- Calls the Anthropic API via `callClaudeForJSON()` in
  `app/engine/llm/callClaude.ts`, using `process.env.ANTHROPIC_API_KEY`.
- Has a system prompt written as a **role-constrained reasoning lens, not a
  persona**. No literary figures (Marcus Aurelius, Dr House, etc.) appear
  anywhere in any actual prompt text - those names were only ever internal
  calibration shorthand between Alistair and ChatGPT, never meant to be sent
  to a model. Each prompt instead states: a key question, a purpose, explicit
  responsibilities, and explicit things the lens must NOT do (including
  explicit cross-references to which *other* lens owns adjacent territory -
  e.g. Guardian's prompt explicitly says checks/verification belong to
  Pragmatist, not Guardian).
- Builds its user-facing prompt from real `DecisionContext` fields
  (`decision.subject`, `decision.price`, `reframer.governingObjective`,
  `landscape.v1` fields), not a fixed string. Auditor additionally receives
  the real, current output of Guardian, Pragmatist, and Empathiser as input -
  it reasons about their claims, not just the raw decision.
- Has a fallback path if the API call fails or returns unparseable output:
  each returns a clearly-labelled "unavailable" placeholder
  (`{ protectedValue: "Guardian unavailable", ... }` etc.) rather than
  throwing and crashing the whole report. This was a deliberate design
  decision, not a default - the option to fail loudly and break the build was
  considered and rejected in favour of a visible-but-non-fatal failure mode.

**What "real" does not yet mean:** none of these four take genuinely rich,
decision-specific landscape data except when running through
`runBraviaSlice.ts`, because that is currently the only slice that builds a
real `landscape.v1`. Tested directly (via the dev-only test routes) against a
deliberately thin fixture, Guardian's output was measurably thinner and more
generic than against a fixture with a full `landscape.v1` attached. This is
expected given each lens's job, not a flaw - but it means these four
components are not yet proven to work well on arbitrary, un-landscaped
prompts, which is what the custom-decision path would need.

**Cross-lens discipline, empirically tested, not just specified:** two
real problems were found and fixed by iterating on real output, not by
pre-emptive design:

1. Guardian's `concern` text initially named remedies/verification steps
   ("without a clear inspection...") that belonged to Pragmatist's territory.
   Fixed with an explicit prompt instruction: name the risk, not the fix.
2. Guardian's own multiple entries initially overlapped with each other (one
   entry's second clause drifting into a different entry's territory,
   typically introduced by "also"/"additionally"/"further"). Fixed by
   constraining each entry to a single clause, one risk, full stop - a
   structural constraint on sentence shape, not just an instruction to "be
   distinct," which had only partially worked on its own.

Both fixes were validated by direct before/after comparison of real API
output on the same fixed test decision (a used Lexus GS for £6,500), and the
resulting prompt was then tested unmodified on two more decisions of
genuinely different shape - the Bravia purchase (live, in-app) and a
constructed interpersonal scenario with no price and no clean `DecisionKind`
fit (see `sisterTestContext` in `testFixtures.ts`) - without needing further
tuning. This is real, if limited, evidence the lens boundaries generalise
rather than being overfit to one test case.

**One known, un-investigated soft overlap:** in the live Bravia run today,
Pragmatist's "Confirmed product availability and seller legitimacy" bundled
two distinct requirements into one entry - the same two-clause pattern fixed
in Guardian, showing up in a different component. Not yet fixed; one data
point, not enough yet to justify a prompt change.

---

## 1b. Known downstream compatibility question, still unresolved

Auditor's `supportedConclusions`/`unsupportedConclusions` `finding` fields are
now real, freely-generated sentences (e.g. "That £6,500 is a fair or unfair
price for this car."), not the short internal-ID-looking strings the old
fixture used (e.g. `"attractive_if_verified"`). Whether any part of the
rendering pipeline ever expected the old ID-like format and maps it to
different display text has not been checked. Currently irrelevant in
practice, because `structuredReport.ts`'s new `auditor` field just passes
`finding` straight through as display text (see section 16) - but worth
knowing if this behaviour ever needs to change.

---

## 2. Decision kinds

Unchanged. Confirmed exact match to `types.ts`.

```ts
type DecisionKind =
  | "PURCHASE"
  | "RELOCATION"
  | "PORTFOLIO"
  | "GENERAL";
```

Worth flagging again, unresolved from yesterday: this was originally meant as
a proving-ground test harness, not a permanent closed taxonomy - the stated
goal is a system that copes with almost any prompt. The custom-decision
path's reliance on classifying into exactly these four buckets before doing
anything else is still in tension with that goal. Not addressed today.

---

## 3. Money amount

Unchanged. Confirmed exact match to `types.ts`. Still worth deciding whether
`RepresentativePath.commitment.currency` being narrowly typed to literal
`"GBP"` (see section 9) versus the wider `MoneyAmount` union is intentional.

---

## 4-14. Core types

Sections 4 (Decision core), 5 (Path IDs), 6 (DecisionContext), 7 (Facts), 8
(Landscape), 9 (Representative paths), 10 (Event horizon), 11 (Establishing
shots), 12 (Steelman cases), 13 (Diagnostics), 14 (Navigator) are all
**unchanged from the last corrected version** - nothing about these types
was touched today. Refer to the previous schema version for full detail;
repeating them here would just be noise. The only addition is `panel` and
`auditor`'s *content* is now sometimes real rather than always fixture - the
*shape* of `PanelState` and the auditor object on `DecisionContext` itself
did not change.

---

## 15. Presentation metadata

Unchanged.

```ts
presentation?: {
  decisionStateSummary?: string;
  decisionTurn?: string;
};
```

---

## 16. Structured report - updated with new fields

`app/engine/presentation/structuredReport.ts` converts `DecisionContext` into
the browser-facing shape. **Two new fields added today**, confirmed by direct
read of the current file (not carried forward unverified this time):

```ts
export type StructuredReport = {
  title: string;
  mode: "exploration" | "execution";
  decisionKind: string;
  selectedPath?: string;
  executionStatus?: string;
  diagnostics: StructuredDiagnostic[];
  summary: string;
  resolved: string[];
  remaining: string[];
  decisionTurn: string;
  reasoningPanel?: StructuredReasoningPanel;   // NEW
  auditor?: StructuredAuditor;                 // NEW
  paths: StructuredPath[];
  eventHorizon?: {
    label: string;
    explanation: string;
  };
  navigator?: StructuredNavigator;
  closingNote: string;
};

export type StructuredReasoningPanel = {
  guardian: { protectedValue: string; concern: string }[];
  pragmatist: { requirement: string }[];
  empathiser: { humanFactor: string }[];
};

export type StructuredAuditor = {
  evidenceStrength: string;
  assumptions: string[];
  missingInformation: string[];
  blockingUncertainties: string[];
  supportedConclusions: string[];      // flattened from { finding: string }[]
  unsupportedConclusions: string[];    // flattened from { finding: string }[]
  internalConsistency: string;
  readinessScore: number;
  readinessState: string;
};
```

Note `supportedConclusions`/`unsupportedConclusions` are flattened from the
engine-level `{ finding: string }[]` shape down to plain `string[]` at this
layer - `buildStructuredReport()` does `.map(x => x.finding)`. This is a
presentation-layer simplification, not a change to the underlying
`DecisionContext.auditor` type.

`reasoningPanel` is only populated if at least one of
`context.panel.guardian` / `.pragmatist` / `.empathiser` exists - otherwise
`undefined`, so Singapore/Portfolio/custom-decision reports (which have empty
or absent panels) correctly show no reasoning panel section rather than an
empty one.

**Note (carried forward, not re-verified today):** `title`, `prompt` field
presence, and a few other minor details from the previous schema version were
not independently re-checked in this pass - the type shown above is the
result of a direct file read today and should be treated as accurate, but the
surrounding builder logic beyond the two new fields was not re-audited
line-by-line a second time.

---

## 17. Browser UI contract - updated

```text
app/ui/WorkspaceReportView.tsx
```

**Two new sections added today**, confirmed by direct file read:

```text
Decision frame
Workspace summary strip
Execution state strip, if execution mode
Reasoning Panel (Guardian / Pragmatist / Empathiser), if reasoningPanel present   <- NEW
Auditor section, if auditor present                                               <- NEW
Resolved uncertainties
Remaining blockers / uncertainties
Representative paths
Event horizon
Evidence layer / recommended diagnostics
Navigator panel, if execution mode
Closing note
Structured JSON debug toggle
```

The Reasoning Panel renders as three columns (Guardian/Pragmatist/Empathiser)
inside one bordered section. The Auditor section shows a colour-coded
readiness badge (green/amber/red matching `readinessState`) plus four lists
(assumptions, missing information, supported, unsupported).

**Known dead code, unrelated to today's work, not yet cleaned up:**
`page.tsx` still contains its own local copies of `ReportView`, `PathCard`,
`DecisionFrame`, etc. - defined but never actually called anywhere in the
file's JSX. `Home()` only ever renders `<WorkspaceReportView report={report} />`
(the real component, in `app/ui/`). Worth deleting the dead copies from
`page.tsx` at some point for repo cleanliness; harmless as-is.

---

## 18. Implemented slices - corrected status

| Slice | Pattern | Real reasoning? | Runs where? | Entry point |
|---|---|---|---|---|
| `runBraviaSlice.ts` | A (full pipeline) | **Yes** - Guardian/Pragmatist/Empathiser/Auditor all real | Server | `GET /api/run-bravia` |
| `runBraviaNavigatorSlice.ts` | A + Navigator wrapper | **Yes** - inherited from `runBraviaSlice` | Server | `GET /api/run-bravia-navigator` |
| `runSingaporeSlice.ts` | B (hand fixture) | No - `panel: {}`, untouched | Client (browser) | Direct call in `page.tsx` |
| `runPortfolioSlice.ts` | B (hand fixture) | No - `panel: {}`, untouched | Client (browser) | Direct call in `page.tsx` |
| `runCustomDecisionSlice.ts` | C (classifier + templates) | No - no panel logic at all | Client (browser) | Direct call in `page.tsx` |

**Why Bravia and Bravia + Navigator run server-side and the other three don't:**
not a stylistic choice - it's required. Any slice that calls the real
Guardian/Pragmatist/Empathiser/Auditor functions needs
`process.env.ANTHROPIC_API_KEY`, which does not exist in browser code under
any circumstances in Next.js. Singapore, Portfolio, and custom-decision are
currently client-side purely because none of them call those four functions
yet - the moment any of them do, they will need the identical
`/api/run-*` server-route treatment Bravia just received.

---

## 19. Build expectations

Production build must remain green:

```bat
npm run build
```

Known fixed issues, carried forward:

```text
Duplicate MoneyAmount type removed
presentation folder casing standardised to lowercase
run.ts OUTPUT_MODE comparison fixed
facts.userStated.price made optional
facts.assumedForSlice widened for custom input
landscape.v2 aligned with required fields
representativePaths aligned with PathId and required fields
establishingShots / steelman pathId literal typing fixed
steelman.case added to type
eventHorizon widened to include irreversibleAfter and transition
fixed-slice context objects typed as DecisionContext
accidental Docs/Components/DecisionReport.tsx moved out of build path
```

**New fixes from today, worth recording as a pattern, not just a list:**

```text
guardian/pragmatist/empathiser/auditor converted from sync to async -
  required await at every call site up the chain: runBraviaSlice.ts,
  runBraviaNavigatorSlice.ts, run.ts, page.tsx. Each fix followed an
  identical shape: add `await` at the call site, add `async` + wrap return
  type in `Promise<...>` on the enclosing function, repeat one level up.

page.tsx could not simply be made `async` like the others, because it is a
  React client component (`"use client"`) and React does not support async
  client components. Fixed via useEffect + useState instead of useMemo -
  load the report asynchronously after mount, show a loading state until it
  resolves.

page.tsx directly calling guardian()/pragmatist()/empathiser()/auditor() (via
  runBraviaSlice()) failed at runtime with "ANTHROPIC_API_KEY is not set" -
  not a build error, a correct security boundary. Fixed by moving the actual
  slice execution into server-side API routes (/api/run-bravia,
  /api/run-bravia-navigator) and having page.tsx fetch() the finished report
  as JSON instead of calling engine functions directly.
```

---

## 20. Git rules

Unchanged.

```bat
git add app/engine/types.ts
git add app/engine/runCustomDecisionSlice.ts
git add app/engine/presentation/structuredReport.ts
git add app/ui/WorkspaceReportView.tsx
git commit -m "Meaningful commit message"
```

Before committing:

```bat
npm run build
git status --short
```

**New reminder specific to today's work:** `.env.local` must never appear in
`git status` output. Confirmed correctly gitignored as of today. If it ever
appears, stop and do not commit until resolved.

---

## 21. Currency type history

Unchanged from previous version - resolved, not re-litigated.

---

## 22. `lib/decisionengine.ts` and the Constitution - still unresolved

**No change today.** Still dead code, still mirrors the Constitution's
4-judge/Comparison-Layer architecture, still diverged from live `app/engine`.
Whether to delete, revive, or partially merge (e.g. folding the Comparison
Layer concept into a future Auditor enhancement) remains an open product
decision, not a technical one. Worth revisiting now that Auditor is real and
has shown it can meaningfully reason about the other three lenses - that
capability is closer to what a Comparison Layer would need than it was
yesterday.

---

## 23. What isn't built yet, updated

- **Reframer, Landscape (content), Clarifier, Paths, Establishing Shots,
  Steelman remain hardcoded Bravia fixtures.** Only Guardian, Pragmatist,
  Empathiser, and Auditor became real today. This is a meaningful fraction of
  the pipeline, not the whole thing - worth being precise about that rather
  than letting "we wired the AI in" imply more than it currently means.
- **Singapore, Portfolio, and the custom-decision path have no real reasoning
  at all**, and were explicitly out of scope today.
- The custom-decision path in particular cannot simply receive the same
  fix Bravia got - it additionally needs a real, dynamically-built
  `landscape.v1` (or some working substitute) before the four real lenses
  would produce good output on arbitrary prompts, based on yesterday's
  starved-fixture finding.
- No diagnostic recommendation is uncertainty-class driven yet (unchanged
  from before).
- `lib/decisionengine.ts` / Constitution reconciliation is unresolved
  (section 22, unchanged).
- The dev-only test routes and `panelHtml.ts` are not part of the production
  surface and should be removed (or clearly separated, e.g. behind a
  dev-only flag) before any real deployment - not urgent, but worth not
  forgetting they exist purely as scaffolding.

---

## 24. Lesson learned today, worth keeping as a standing principle

Isolated test routes (`/api/test-guardian` etc.) proved the four real lens
functions worked correctly in isolation, on the first attempt, with no
surprises. Wiring the *same, unchanged* functions into the real product
surfaced a problem that had nothing to do with the functions themselves and
everything to do with *where* they were being called from
(`page.tsx`, a client component, versus a server route).

The general principle, worth applying before any future component gets
wired into the live UI: proving a component works in an isolated server-side
test route only proves it works server-side. It does not prove the calling
context you eventually wire it into is *also* server-side. Check that
explicitly, for every future component, rather than assuming success in
isolation implies success once integrated.
