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

---

## 25. Reframer - now real, wired, and empirically validated

`app/engine/reframer.ts` was converted from a hardcoded Bravia fixture to a
real component, following the same pattern as Guardian/Pragmatist/Empathiser/
Auditor (async, calls Claude via `callClaudeForJSON`, role-constrained lens
prompt, visible-but-non-fatal fallback). It is wired into `runBraviaSlice.ts`
and its output is now genuinely used by the live Bravia report (see section
17 for the new UI section).

### The five states, tested against real, defensible cases

| Status | Test prompt | Result | Verdict |
|---|---|---|---|
| `PASS` | "Should I buy the Sony Bravia 9 II for £2,000?" (bare, no price-position signal) | `PASS` | Correct - nothing in the bare prompt justifies intervention |
| `CLARIFY` | "My partner and I disagree about whether to have kids and where to live - what should we do?" | `CLARIFY`, correctly identified `decisionCount: 2`, four well-shaped clarify options | Correct - two structurally independent decisions genuinely present |
| `ROUTE_TO_NAVIGATOR` | "I've decided to become an airline pilot. What qualifications do I need?" | `ROUTE_TO_NAVIGATOR` | Correct - decision already made, implementation question |
| `PREREQUISITE_REQUIRED` | Bravia + real price-position context (43% below typical retail) | `PREREQUISITE_REQUIRED` - "determine why this is priced below market before assessing whether to buy" | **Confirmed correct after direct discussion** - see below |
| `SUGGEST_REFRAME` | Multiple attempts (see below) | Never fired | **Unresolved, but understood** - see below |

### The SUGGEST_REFRAME investigation, and what it taught us

The original Docs example ("Should I buy the Sony Bravia 9 for £3,500?" ->
suggested reframe "How should I spend my £3,500 television budget?") was
tested directly, in several variants, and never reproduced `SUGGEST_REFRAME`
- the model consistently chose `PREREQUISITE_REQUIRED` instead, reasoning
that a suspiciously-good price on a *specific, already-identified listing*
is evidence something needs investigating, not evidence the question should
be reframed upward into a general budget question.

After direct discussion, this was judged to be **correct model behaviour,
not a defect** - and the original Docs example was judged to be based on a
ChatGPT paraphrase that had collapsed two genuinely different original
scenarios into one:

- **The actual original scenario** was "Should I spend £3,500 on a Bravia 9
  II TV?" at **full, undiscounted retail price** - a genuine allocation
  question from the start (this TV vs. a different TV vs. not buying a TV at
  all), with a real three-path structure (buy this one / buy a better-value
  alternative / don't buy at all).
- **The discounted-price scenario** ("this specific listing is suspiciously
  cheap") is a different question entirely - investigate-before-deciding,
  not reframe-the-question.

Tested directly: the full-retail £3,500 scenario, with no discount signal,
correctly returned `PASS` with a governing objective that already
acknowledged the implicit "or something better" framing where the prompt
contained it, and correctly did NOT try to force `SUGGEST_REFRAME` when the
prompt hadn't actually asked for it.

**Resolved conclusion:** the three-path structure this scenario exposes
(buy this / buy alternative / don't buy) is **Representative Paths'
responsibility, not Reframer's.** Reframer's job is only "is there one clear
governing decision" - not "how many live alternatives will eventually be
surfaced." Do not force Reframer to create multi-path structures. Fix/extend
`paths.ts` (still fixture, see section 30) to genuinely generate alternatives
under a passed governing decision instead.

`SUGGEST_REFRAME` remains real, specified, and implemented correctly - it
has simply not yet been triggered by any test case constructed so far. It
may be genuinely rarer than the other four states. Not treated as a defect;
worth revisiting if a real future case surfaces it naturally rather than
manufacturing an artificial trigger.

### Type addition required and made

`ReframerState` in `types.ts` had no field to hold a suggested reframe or
clarify options - a real, necessary widening, not scope creep:

```ts
reframer?: {
  status: ReframerStatus;
  governingObjective: string;
  route: ReframerRoute;
  reason: { decisionCount: number; decisionType: string; subjectCount: number; pricePresent: boolean; };
  suggestedReframe?: string;   // NEW
  clarifyOptions?: string[];   // NEW
};
```

### New dev-only test route

`GET /api/test-reframer` - runs Reframer against the bare-prompt test set
plus two hand-built contexts carrying real price-position signal, for
comparing behaviour with and without contextual evidence present.

---

## 26. Landscape - now real, tested against a known-good reference

`app/engine/landscape.ts` converted from a Bravia-hardcoded fixture to a
real component. One function handles both V1 and V2: if `landscape.v1`
already exists AND `clarifierResponse` is present, it builds V2 (narrowing);
otherwise it builds V1 (initial mapping). This mirrors the existing
structural branching the old fixture already had - only the *content*
generation became real, not the V1/V2 decision logic itself.

### Validated against a known-good reference, not just plausibility-checked

`testFixtures.ts`'s `lexusTestContext` already contained a hand-authored
`landscape.v1`, built days earlier directly from a detailed worked example.
This made a real comparison possible, not just "does this look reasonable":
real, independently-generated V1 was compared directly against that
hand-authored reference on the same decision.

**Result: the generated version was judged better-aligned with the mature
architecture than the hand-authored reference**, not merely comparable to
it. Specifically:
- More precise subject/commitment description.
- More concrete, specific remaining uncertainties (e.g. correctly flagged
  potential known reliability issues with Lexus hybrid electronics -
  unprompted, matching a similar independent catch Auditor made days
  earlier on the same underlying vehicle detail).
- Correctly declined to include "emotional appeal" and "reversibility" as
  decision axes - judged, after discussion, to be appropriate discipline
  rather than a gap, since both are explicitly owned by other components
  (Empathiser and Event Horizon respectively) and Landscape re-stating their
  territory would be duplication, not thoroughness.

### The emotional-signal exception rule, tested directly and confirmed

Standing rule (Alistair's, prior to this test): Landscape should NOT invent
emotional content, but SHOULD pick it up if the prompt states it directly.

Tested directly: same Lexus decision, run twice - once with a plain prompt,
once with a prompt stating "I've always wanted a Lexus GS." Result:

- Plain prompt: no emotional content anywhere in the generated Landscape.
- Prompt with stated attachment: independently added "The buyer has long
  wanted a Lexus GS" as a **resolved fact**, and added a new decision axis,
  "Personal fit and long-held desire versus practical need."

**Confirmed working exactly as specified**, on the first real test, with the
signal present and absent side by side on the same underlying decision.

### V2 narrowing behaviour, tested and confirmed

Fed a hand-constructed clarifier answer with genuine conditionality
("yes, if the inspection comes back clean"). V2 correctly preserved the
conditionality rather than falsely fully-resolving the purchase decision -
it resolved the narrower, accurate fact ("willingness is conditional on
clean inspection"), not "willing to buy."

**Caveat, stated plainly:** this tested Landscape's narrowing logic in
isolation. It did NOT test the full Reframer -> Landscape V1 -> Clarifier ->
Landscape V2 chain end-to-end, because Clarifier itself is still fixture and
never actually generated the question - the "answer" was hand-written to
isolate Landscape's behaviour specifically. Full-chain validation remains
outstanding until Clarifier is real (see section 28).

### An observed inconsistency, not yet fixed

In one comparison run, generated V1 included a "Reversibility / resale exit"
axis; in another run (the emotional-signal variant), it didn't - on
materially the same underlying decision. Given the standing decision that
reversibility belongs to Event Horizon, not Landscape (section 26 above,
confirmed by discussion), this should be made a hard rule in the prompt
rather than left to vary run-to-run. **Not yet fixed - flagged for the next
time `landscape.ts` is touched.**

### New dev-only test routes

`GET /api/test-landscape` - runs the full comparison above (hand-authored
reference vs. real V1 vs. real V2 vs. emotional-signal V1 vs. real Empathiser
run against the plain V1), rendered as readable HTML via
`renderLandscapeEmotionCheckHtml()` in `panelHtml.ts`.

---

## 27. Empathiser - clarifier-awareness added, and a significant finding

`app/engine/empathiser.ts`'s prompt builder was extended to read
`context.clarifierResponse` when present, and explicitly instructed to treat
a revealed-preference answer as a strong emotional signal, not just a fact
to log. This was a real, justified fix, not a test-only hack - the docs'
own stated purpose for revealed-preference clarifiers is exactly this.

### The broadband test - the clearest single finding of the day

Deliberately mundane decision constructed to test whether "how much
Empathiser matters" holds up on a dry subject, not just an inherently
emotional one (a desirable car): "Should I switch broadband providers to
save money?"

Run twice on identical underlying facts:

**Bare (no revealed preference):** competent but generic - disruption
anxiety, reliability regret, switching-hassle-as-chore. True, plausible,
but the kind of thing anyone could guess without real reasoning.

**With one hand-constructed clarifier answer added** ("No, I wouldn't stay
even if they matched the lowest price I found." / effect: "Price is not the
actual driver of the switching decision."):

- "...underlying frustration or accumulated resentment toward the current
  provider that persists regardless of price... a desire to emotionally
  'break free' from a relationship they feel wronged by."
- "...signals a loss of trust... the switch about restoring a sense of
  control and confidence rather than financial gain."
- "...the emotional weight of anticipated relief... a wish to move past
  ongoing irritation rather than simply optimise spending."

**This is a qualitative jump, not just more text.** The bare version
describes the *situation*. The with-clarifier version demonstrates genuine
understanding of the *person* - specific, non-generic, only possible because
one revealed-preference fact was available to reason from.

### The conclusion this forces, stated plainly

The "is there enough Empathiser" question that motivated this whole
investigation does not have a prompt-tuning answer. **Empathiser is capable
of real, sharp, person-specific insight - but only when it has access to
revealed-preference information, and the current live pipeline never gives
it that access.** In `runBraviaSlice.ts`, Empathiser runs once, before
Clarifier, and is never re-run. This means the live product is currently
structurally limited to Empathiser's "bare" quality tier, permanently -
regardless of how good its prompt is.

This is a pipeline-ordering gap, not a component quality gap. See section 28
for the confirmed design requirement this creates for Clarifier.

### New dev-only test route

`GET /api/test-empathiser-broadband` - runs the comparison above, rendered
via `renderEmpathiserComparisonHtml()` in `panelHtml.ts`.

---

## 28. Confirmed design requirement for real Clarifier: selective panel re-evaluation

**This is not yet built. Clarifier remains a hardcoded fixture (see section
30). This section records a requirement for its eventual real design,
backed by two independent pieces of evidence.**

### Evidence 1 - historical, from the original torture tests

Direct grep of `torture-test-results.md` confirms the original Portfolio
test explicitly recorded, as a single observation: *"Comparison layer
produced useful insight"* alongside *"User-answer -> reasoning-change loop
was successfully demonstrated."* A "Comparison layer" concept existed
alongside the original clarifier-response loop, predating the richer
Landscape V1/V2 + Representative Paths + Event Horizon architecture that was
eventually built. This is the same "Comparison Layer" concept that survives
today only in the dead, unwired `lib/decisionengine.ts` file, which mirrors
`DECISION_WORKSPACE_CONSTITUTION.md`'s architecture (see section 22). Its
disappearance from the live pipeline appears to have been an unintentional
casualty of building the richer architecture, not a deliberate decision to
drop it.

### Evidence 2 - empirical, from today's broadband test (section 27)

Direct proof that Empathiser's best output requires clarifier-answer access
that the current pipeline structurally never gives it.

### The requirement

Real Clarifier must, as part of its own output, judge **which panel members
its own question-and-answer materially affects**, and those (and only
those) should be re-run afterward. Not a blanket re-run of the whole panel
after every clarifier answer - Alistair's own stated reasoning for why the
original architecture likely avoided this is worth recording explicitly, as
it is the actual answer to an obvious objection:

**Design constraint, stated plainly: avoid an unbounded loop.** A system
that re-runs judges after every clarifier answer, and then potentially
generates *new* clarifying questions from the updated panel output, which
then triggers another re-run, and so on, has no natural termination
condition. This is why selective, judged re-evaluation (only the panel
members a specific answer actually touches) is preferable to a blanket
loop - and even then, the design should specify a hard bound (e.g. one
clarifier round only for V1 of this feature, or an explicit maximum number
of re-evaluation passes) rather than leaving termination implicit.

Candidate trigger criteria (ChatGPT's proposal, not yet tested): Empathiser
should re-run when an answer reveals preference, aversion, regret, stress,
identity, relationship, trust, or fatigue signal. Worth testing directly
once Clarifier is real, rather than assuming these criteria are complete or
correctly calibrated.

**Explicitly not resolved today:** whether the "judge which lenses this
answer touches" decision is a new responsibility bolted onto Clarifier
itself, or a separate new component. Either is a real, non-trivial piece of
work - not a free addition to Clarifier's existing scope.

---

## 29. Event Horizon chapter - a correction identified, not yet made

**Event Horizon remains fixture (see section 30). This section records a
correction owed to Chapter 16 of the Engineering Manual for whenever it is
built for real.**

Direct reading of Chapter 16 found an internal inconsistency between two of
its own sections:
- **"Trigger"** lists moments like *"exchange of funds," "offer accepted"* -
  firing at the moment of commitment.
- **"Irreversible Conditions"** lists things like *"return period expires,"
  "cooling-off period ends"* - treating the horizon as delayed until an
  asset-level transaction can no longer be undone.

Discussion resolved this is not a contradiction to eliminate, but two
genuinely different mechanisms that the chapter doesn't clearly separate:

**The corrected rule:** check whether a *formal, statutory reversal right*
exists for this specific decision.

- If yes (e.g. UK distance-selling regulations on a retail purchase) - the
  event horizon is the loss of that right (return window expiry, item
  opened beyond return conditions), because a genuine, complete reversal to
  the prior state really is possible until then.
- If no (e.g. a private used-car sale, which typically carries no statutory
  cooling-off right) - the event horizon is the moment of commitment itself,
  because even though the *asset* could later be resold, the *decision* -
  the fact of having made the purchase, the time and risk incurred - can
  never be undone. Selling the car back returns you to "no longer owning
  this car," not to "never having bought it."

This also resolves why "reversibility" correctly does not belong in
Landscape (section 26) regardless of which reading applies to a given
decision - it's Event Horizon's job to make that determination per-decision,
not Landscape's job to pre-judge it as a generic axis.

---

## 30. Updated implementation status (supersedes relevant parts of section 18/23)

As of this update, real (not fixture) components in the Bravia pipeline are:
**Reframer, Guardian, Pragmatist, Empathiser, Auditor, Landscape (V1 and
V2).** Still fixture: **Clarifier, Representative Paths, Establishing
Shots, Steelman.** `eventHorizons.ts` remains the one component that was
already genuinely `DecisionKind`-driven before any of today's work.

This means more than half of the Bravia pipeline's semantic content is now
real - but the parts most directly responsible for *presenting distinct
options to choose between* (Paths, Establishing Shots, Steelman) are not.
Practical consequence, visible on the live page today: Reframer can
correctly say "investigate this price before deciding anything," and the
Representative Paths section directly below it still shows an unchanged,
generic two-path buy/don't-buy structure with no awareness that Reframer
said anything at all. This is an honest, visible seam - not a bug, but a
clear signal of exactly where the next real work should go (Paths, per the
agreed next-step order).

---

## 31. Representative Paths - now real, and the most heavily pressure-tested component so far

`app/engine/paths.ts` converted from a hardcoded Bravia fixture to a real
component. Takes the real `landscape` (v2 preferred, falling back to v1),
`reframer.governingObjective`, and critically **Pragmatist's actual real
output** as inputs - required conditions are drawn from Pragmatist's stated
requirements, distributed to the paths they genuinely apply to, per Chapter
15's own explicit rule that required conditions "often originate from the
Pragmatist" and Paths should "preserve those conditions without
re-evaluating them."

### Two structural rules established, both independently confirmed against the actual Engineering Manual text

Direct grep of `Landscapes/working_draft_0.1` found near word-for-word
confirmation of what was independently derived through testing:

> *"Representative Paths exist to represent fundamentally different
> realities, not different routes towards the same reality."*

and an explicit list of things that do NOT qualify as separate paths -
*"implementation details, temporary pauses, intermediate milestones,
tactical variations, different methods of achieving the same stable
future"* - which belong to Navigator, not Paths.

**Rule 1 (terminal-state test):** a path must represent an entered,
immediate, stable outcome - not an open-ended process. "Verify, inspect,
gather more information, then decide" is never a valid path on its own,
regardless of framing - it has no destination, could continue indefinitely,
and only delays arrival at a path that already exists.

**Rule 2 (no-invention test):** a path must be constructible entirely from
information already present in the decision. Inventing a new specific
alternative (a different product, a different car) that was never named or
implied anywhere is representing a different decision, not this one. The
one legitimate exception: if the governing objective is genuinely about an
unresolved *quantity* (e.g. how much of a stated budget to commit),
resolutions using only the range already given (none / some / all) are
legitimate, since nothing is invented.

**No predetermined path count** - confirmed directly in the same doc:
*"The number of paths is determined by the structure of the decision being
represented rather than by any predefined architectural rule."* The prompt
deliberately does not target 2 or 3; it constructs the smallest set that
faithfully represents genuinely different outcomes.

### Test results across four fixtures, with one later found to need correction

| Case | Prompt shape | Result | Verdict |
|---|---|---|---|
| Lexus GS | Specific item | 2 paths (buy / don't buy) | Correct, confirmed twice |
| Bravia 9 II at £3,500 | Specific item | 2 paths | Correct, confirmed after fixing an earlier mislabeled fixture (see below) |
| £3,500 TV budget | Unresolved quantity | Initially 3 paths (full spend / spend+peripherals / value+retain) | **Initially accepted, later found incorrect on closer inspection - see section 32** |

**Important correction to the record:** an earlier version of this test used
a fixture literally named `bravia3500TestContext` with `decision.subject:
"Bravia 9 II TV"` - a specific, named product, not a genuine budget
question. Its 3-path result was wrongly treated as validating the
historical "TV budget = 3 paths" finding from the original torture-test era.
This was the same prompt-conflation mistake flagged elsewhere in this
document (see section 25's SUGGEST_REFRAME investigation) recurring in a
new place. Corrected by building a properly separate, genuinely
quantity-shaped fixture (`tvBudgetTestContext`, prompt: "How should I spend
my £3,500 TV budget?"), distinct from the specific-item Bravia fixture.

### Iterative prompt fixes made during testing, in order

1. Initial version allowed "delay/verify then decide" as a path (matching
   the Lexus/GS problem seen with Guardian-style self-overlap on day one) -
   fixed with an explicit terminal-state rule.
2. That fix wasn't sufficient on its own - a "wait and see" / "monitor the
   market" path still appeared on the Bravia-£3,500 case, apparently
   triggered by a genuine timing axis in that decision's own Landscape.
   Fixed with a more targeted rule: a timing-related Landscape axis reflects
   real uncertainty, but does not by itself license a delay path - every
   path must be tested against whether it actually resolves the governing
   objective, not just whether it sounds reasonable given the axes present.
3. `max_tokens` (in the shared `callClaude.ts`, affecting every real
   component) was raised from 1024 to 4096 after the TV-budget case's
   genuinely 3-item output was silently truncated mid-JSON, producing an
   unreadable, uninformative "Paths unavailable" fallback with no indication
   of the real cause. The fallback logic itself was also fixed to carry the
   actual error/reason string rather than a generic unexplained message -
   worth doing for every component's fallback path, not just this one.
4. Output format instruction was tightened to require concise fields (title
   under 8 words, outcome under 25 words, conditions under 15 words each) to
   reduce the chance of hitting the token limit at all, not just raise the
   ceiling.

---

## 32. Correction to the TV-budget 3-path result - not yet implemented in code

**This correction was reached through discussion after the test in section
31 above. It has NOT yet been implemented in `paths.ts` or `reframer.ts`.
The code currently still reflects the pre-correction understanding.**

### The problem, found by direct challenge, not by testing

The initially-accepted 3-path TV-budget result was:

- A: Spend the full £3,500 on one TV.
- B: TV plus peripherals (soundbar, mount, streaming device).
- C: Cheaper TV, bank the remaining money.

Direct challenge exposed two separate, real problems:

**Problem 1 - B and C are not actually different destinations.** Both are
versions of "don't spend the full amount on the TV itself" - B narrates
what the leftover money buys, C narrates that it's retained. Neither leads
anywhere the other doesn't. This is the same failure family as the
"verify, then decide" pattern rejected earlier in the same session, just
with the process disguised as a spending choice rather than a delay.
**Corrected default for this exact prompt: 2 paths (full spend on the best
single TV / spend less and retain the difference), not 3.**

**Problem 2 - "TV budget" does not automatically license "viewing setup
budget."** A path that spends most of the money on non-TV items (soundbar,
furnishing, etc.) has quietly redefined what the decision is about,
without permission from anywhere upstream. This is scope creep, and it is
not caught by either of the two rules in section 31 - both would have let
it through, because the "peripherals" category itself was genuinely
grounded in a real Landscape axis, and no single new item was invented.
**The gap is a missing rule about preserving the stated object of the
decision, not about inventing new items.**

### The corrected rule, ready to write into `paths.ts`

*"A complementary-spend path is valid only if the complementary items
remain subordinate to, and functionally necessary for, the stated object of
the decision. A path that would spend most of the budget on items other
than the stated object is not preserving the decision's scope - it has
silently redefined the decision (e.g. from 'TV budget' to 'home
entertainment setup budget'), and that redefinition must be authorised
upstream (see the Reframer addition below), not decided unilaterally by
Paths."*

### A new, confirmed responsibility for Reframer - also not yet implemented

Reframer's job was extended, through direct discussion, to include: judging
whether a prompt's stated object should be allowed to broaden into a wider
category (e.g. "TV budget" -> "home entertainment setup budget", "bed
budget" -> "bedroom furniture budget"), and recording that decision so
Landscape and Paths both respect it. **Reframer must not silently broaden
scope on its own** - if there isn't clear evidence for a broader frame, it
should either keep the narrower one or (per its existing `CLARIFY`/
`SUGGEST_REFRAME` states) surface the ambiguity rather than deciding it
unilaterally.

**Worked example, useful for testing once implemented:** "How should I
spend my £1,000 bed budget?" - "bed plus bedroom furniture" (wardrobe,
bedside tables, lamps) is scope creep and should be rejected by default.
"Bed plus directly bed-functional items" (frame, mattress, delivery,
bedding) is legitimately still "bed budget" and should be allowed. The
difference is whether the additional spend remains functionally
subordinate to the stated object, not whether it's a plausible-sounding
category.

---

## 33. "Wait" as a path - concluded very unlikely to ever be valid, with one narrow exception

Extensively pressure-tested via a hypothetical: a fully-capable future
system with real web search, aware of a genuine, dated, verifiable sale
event (e.g. an actual upcoming Black Friday), asked "how should I spend my
£3,500 TV budget?" Does a "wait for the sale, then decide" path become
legitimate once the honesty problem (the system fabricating a sale it has
no real basis for knowing about) is solved by giving it genuine real-time
information access?

**Concluded: no, and this holds independently of tool access.** Solving the
honesty problem does not solve the terminal-state problem (section 31,
rule 1). Whatever the outcome of waiting - the sale happens or it doesn't -
"wait" always resolves *into* one of the other paths once the event passes.
It is never itself a stable, entered reality, no matter how well-grounded
the reason to wait is. Real tool access would make the *reasoning* honest;
it would not make "wait" a valid destination.

A specific rescue attempt was also tested: a revealed-preference clarifier
("if you bought today and saw the same TV much cheaper in six months, would
that affect your enjoyment of the decision?"). Concluded this is a good,
well-formed clarifier in its own right, but answers a different question
than the one that matters - it measures the person's *regret sensitivity*
(a preference), not whether a price drop is actually *going to happen* (a
fact). A "yes" answer doesn't manufacture a legitimate wait path; instead,
it should feed into Guardian and Empathiser, making the existing "buy now"
path's risk assessment more accurate and evidenced. A "no" answer
legitimately closes the question entirely, since it establishes waiting
wouldn't matter even if the fact existed.

**Standing conclusion: "wait" is not likely to ever be a valid
Representative Path, with one narrow exception - when waiting IS the
actual governing objective itself** (e.g. "should I buy this now or wait"),
not an addition bolted onto a differently-framed decision. Even then, this
produces its own clean, separately-scoped 2-path decision (buy now / wait),
not a merger into an existing path set. This also retroactively explains,
rather than merely observes, why the original torture-test-era finding "0
and 1 paths are impossible, 4-path cases were never found" held up - not
by luck, but because the actual structural rules make a 4th "wait" path
essentially unconstructible under the current architecture.

---

## 34. Clarifier design - one more requirement added to section 28

**Still not built - this adds to, not replaces, section 28's existing
selective-panel-re-evaluation requirement.**

A useful distinction emerged, worth keeping as part of Clarifier's eventual
design: not all clarifying questions are the same *kind* of question, and
the "prefer revealed over stated preference" principle does not apply
equally to all of them.

- **Preference/values questions** (does this person actually care about X,
  even if they say they do/don't) - genuinely benefit from revealed-preference
  framing, since people are unreliable self-reporters of their own values
  and priorities. This is what the existing Clarifier voice work (Feynman
  Isolation, Human Consequence) was designed for.
- **Factual/scope questions** (does this £3,500 figure include peripherals
  or not) - people generally know the answer to these about their own
  stated intent. A direct question is not a weaker approach here; the
  revealed-preference principle was never meant to cover this category, and
  applying it where it doesn't belong (e.g. building an elaborate
  hypothetical to indirectly divine a scope boundary the person could just
  state directly) would be over-engineering, not rigor.

Worth building this distinction into Clarifier's eventual voice/method
selection logic, alongside the existing Feynman Isolation / Human
Consequence / Sober Auditor framework - a factual/scope question may
warrant a fourth, simpler mode that doesn't attempt indirection at all.

---

## 35. Current honest status - code vs. confirmed design conclusions

As of this update, there is a real, explicit gap between what has been
**tested and confirmed as correct through discussion** and what actually
**exists in `paths.ts`/`reframer.ts` right now**:

- Rules 1 and 2 (section 31) - **implemented in code**, tested, working.
- The scope-preservation rule and Reframer's category-drift authority
  (section 32) - **confirmed correct through discussion, NOT YET
  implemented in code.** The current `paths.ts` would still incorrectly
  produce something like the flawed 3-path TV-budget result if re-run today.
- The "wait is essentially never valid" conclusion (section 33) - already
  effectively enforced by Rule 1, no further code change believed
  necessary, but not independently re-tested after the Rule 1 refinement
  that specifically targeted timing-driven delay paths.

**Do not wire Paths into the live `runBraviaSlice.ts` pipeline before
section 32's correction is implemented and re-tested.** Wiring a
known-incomplete version into the live product would be a regression from
the discipline maintained everywhere else in this project so far.
