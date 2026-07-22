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

---

## 36. Three more Paths rules established - retesting section 32's fix exposed further gaps

**Still not implemented in code as of this update - same status as section
32's correction. `paths.ts` currently only has Rules 1 and 2 (section 31).
Everything below is confirmed through discussion, ready to write in, not
yet written in.**

Section 32's scope-preservation rule was implemented and retested. Result:
the bed-budget case correctly stopped inventing general furniture (no
wardrobes, no lamps) - that part of the fix worked. But retesting surfaced
two further, previously unnamed failure modes, plus a correction to
section 32's own reasoning on the TV case.

### Rule 3 - scope consistency across the whole path set, not just within one path

The TV-budget retest initially produced 3 paths again: full-TV-only /
TV-plus-accessories-full-spend / cheaper-TV-with-remainder-retained. The
first instinct (matching the original, since-corrected view from section
32) was to reject this as B and C being the same destination. Direct
challenge exposed the real problem is different and sharper:

**B and C use two incompatible definitions of what's in scope.** B treats
accessories as inside the "TV budget" boundary. C treats them as outside it
- because if they were inside it, C's "retained" money would just get spent
on accessories anyway, which would collapse C into B. Both cannot be true
about the same decision simultaneously. This is not a duplicate-destination
problem (Rule 1) and not an invented-item problem (Rule 2) - it is the path
*set* being internally inconsistent about its own scope boundary.

**Rule 3:** all paths in a single result must share one consistent answer
to what is in-scope and what is out-of-scope for this decision. Scope is
decided once, for the whole set - never per-path. Under the correct default
(no scope-broadening without explicit authorisation - see section 32),
accessories are out of scope entirely for a "TV budget" prompt unless
Reframer has explicitly authorised a broader frame. Applying this
correctly eliminates B (assumes unauthorised scope) and leaves A and C -
**genuinely 2 valid paths**, arrived at for a more defensible reason than
section 32's original "B and C are duplicates" argument, which itself was
identified as not quite right on reflection.

A remaining implementation bug, unrelated to the rule itself: the
generated Path C had `commitment.amount: 3500` while its own `outcome` text
said money was retained - an internal contradiction worth fixing in the
output validation regardless of the scope question.

### Rule 4 - no manufactured spectrum

The bed-budget retest correctly avoided general furniture, but produced 3
paths that are a different, previously unnamed problem: mattress-priority /
balanced / frame-priority - three arbitrary sample points along one
continuous "how is the money weighted across mattress vs. frame" dial, with
no natural breakpoint between them, all spending the full budget.

**Rule 4:** if the real variation between candidate paths is a continuous
weighting or trade-off with no natural, principled breakpoint, that is not
a valid path set - it is a preference question, and belongs to Clarifier
(see section 38's new third category), not to Paths manufacturing discrete
samples along the spectrum to avoid asking it directly.

### Rule 5 - minimum-functional-set tiebreaker for ambiguous scope objects

Separate from Rule 3 (which governs consistency across a path set) is the
question of where the correct scope boundary actually sits for a single,
inherently ambiguous stated object - e.g. does "bed" mean frame only, frame
plus mattress, or more. Direct discussion concluded:

**Rule 5:** when a stated object's boundary is genuinely ambiguous, default
to its minimum functional definition - the smallest set of components
without which the object could not fulfil its basic, literal purpose -
rather than a broader or more "complete" reading. For "bed": a frame alone
does not function as a place to sleep; frame plus mattress does; anything
beyond that (pillows, bedding, furniture) is enhancement, not function, and
is out of scope by default.

This was checked for consistency against the TV case rather than treated as
an isolated bed-specific judgment: a TV's minimum functional definition is
the TV alone (a screen fulfils "watch television" without a mount or
soundbar), which is why TV and bed correctly land on different-sized
minimum sets under the exact same rule, rather than the rule being bent
per-object. The rule is intentionally biased toward narrow, matching the
architecture's existing bias in Rules 2 and 3 - false positives (unwanted
scope creep) are treated as the worse failure mode throughout, not a
neutral toss-up between over- and under-inclusion.

Explicitly acknowledged as imperfect: this is a real judgment call the
system will not get right every time (a genuine type-1/type-2 tradeoff, not
a solvable-with-more-rigor problem) - the minimum-functional-set default is
the most defensible consistent tiebreaker available, not a claim of
certainty.

---

## 37. Updated Paths rule set - full list, for direct use when code is next touched

1. **Terminal-state** - a path must be an entered, stable, immediate
   outcome, not an open-ended process, pause, or route to another path.
2. **No-invention** - a path must be constructible entirely from
   information already present in the decision; the one exception is
   resolving an already-stated quantity (none/some/all of a budget).
3. **Scope consistency across the set** - every path in one result must
   share the same answer to what is in/out of scope; scope is decided once
   for the whole set, never assumed differently by different paths.
4. **No manufactured spectrum** - a continuous weighting/trade-off with no
   natural breakpoint is a Clarifier question, not a set of Paths.
5. **Minimum-functional-set default** - when a stated object's own scope
   boundary is ambiguous, default to the smallest set of components without
   which it could not fulfil its basic function, not a broader reading.

Plus, from section 32 (Reframer's side): Reframer, not Paths, has sole
authority to broaden a decision's stated object into a wider category, and
must not do so without real evidence - the default is always the narrow
reading, stated precisely enough in `governingObjective` that Landscape and
Paths can treat it as an authoritative boundary.

---

## 38. Clarifier question taxonomy - third category added

Extends section 34 (which established the factual/scope vs.
preference/values distinction). A third category emerged directly from
Rule 4 above:

- **Factual/scope** - does this fact hold (e.g. does the budget include
  accessories). Direct questions are appropriate; revealed-preference
  framing is unnecessary here.
- **Values/preference** - how does this person actually feel (e.g. would
  they stay at matched price). Revealed-preference framing genuinely
  matters, since stated self-report is unreliable for this category.
- **Allocation/trade-off (new)** - how should a continuous resource be
  weighted between competing uses (e.g. mattress quality vs. frame
  quality). Neither a pure fact nor a pure values question - closer to
  eliciting a preference *ratio* than a preference *direction*. Not yet
  clear what the right question style is for this category; worth genuine
  design attention when Clarifier is built, not just an extension of the
  other two styles by default.

---

## 39. Status - still not implemented, second instance of this warning

**Same situation as section 35, now covering a larger rule set. `paths.ts`
currently implements only Rules 1 and 2. Rules 3, 4, and 5, plus Reframer's
scope-authorisation responsibility (section 32) and the Clarifier taxonomy
addition (section 38), are all confirmed through discussion and NOT YET
written into any file.**

Do not treat the current live `paths.ts` (wired into `runBraviaSlice.ts` as
of the previous session) as reflecting this full rule set - it does not.
The two live decisions currently wired (Bravia purchase, Bravia +
Navigator) are both specific-item purchases, which only exercise Rules 1
and 2 correctly; neither exercises Rules 3-5, since neither is a
budget/allocation-shaped decision. This is why the live product currently
looks correct despite the gap - the gap simply hasn't been triggered by
either of the two decisions actually wired in yet.

---

## 40. Paths finalised - Rule 6 and single-path validity added

`app/engine/paths.ts` received its final round of fixes today, on top of
Rules 1-5 (sections 31-37):

**Rule 6 - no arbitrary component selection.** Both the TV-budget and
bed-budget cases were found to fork on one unresolved sub-component of a
compound object (display technology, or "mattress" specifically) with
nothing in the Landscape actually motivating that particular sub-component
over the alternatives. This is a specific instance of Rule 2 (no
invention), extended to cover invented *preference for one part of a
compound object*, not just invented whole alternatives. Confirmed fixed:
TV now correctly declines to fork on display technology (an unresolved,
undifferentiated axis); bed now correctly does not invent "mattress-only"
as a path.

**Single-path validity.** Established, through direct discussion, that
"there is no valid one-path Representative Paths state" was the wrong
conclusion from earlier reasoning - the corrected position is the opposite:
**a single, well-grounded path is a valid and honest output when no real
fork exists yet**, and should never be padded to two by inventing an
arbitrary second path just to reach a pair. `paths.ts` validation was
changed from requiring 2+ valid paths to requiring only 1+. Confirmed
working: the bed-budget case, once Rule 6 removed the invented
"mattress-only" fork, correctly settled on exactly one path - full
frame-and-mattress purchase - rather than being forced into two.

**Internal consistency, both directions.** The existing amount-vs-outcome
consistency check (section 31) only caught money-retained-but-labelled-
full-spend. A second, opposite bug was found and fixed: money-spent-but-
labelled-£0 (a partial-spend path whose `commitment.amount` incorrectly
showed `0` instead of a genuine partial figure). Prompt now explicitly
requires both directions to be consistent.

**All six rules are now implemented in code, not just documented.** This
closes the gap flagged in section 39 - `paths.ts` as it stands today
matches the full rule set in section 37.

---

## 41. Establishing Shots and Steelman - now real

`app/engine/establishingShots.ts` and `app/engine/steelman.ts` converted
from Bravia-hardcoded fixtures to real components, following the
established pattern (async, `callClaudeForJSON`, role-constrained lens
prompt, visible fallback). Both are genuinely dynamic over however many
paths exist - no hardcoded path count or IDs - confirmed by direct chapter
reading (Chapter 17/18) rather than assumption.

**Establishing Shot** takes the real `representativePaths`, `landscape`,
and `eventHorizon` as input, and is instructed to give every path strictly
equal semantic weight (a hard requirement per Chapter 17, not a style
preference) - one API call covering all paths at once, specifically to
make consistent treatment easier to guarantee than N independent calls
would.

**Steelman** takes `representativePaths` plus the real Guardian,
Pragmatist, Empathiser, and Auditor output (per Chapter 18's documented
inputs) - the first component whose prompt explicitly synthesises four
other real components' output into new content, rather than just reading
Landscape/Reframer.

**First full end-to-end real-pipeline result, quality assessment:** tested
live via the actual Bravia purchase page, not just an isolated route.
Result was genuinely strong - both paths' Steelman cases cited specific
real facts from upstream (Auditor's exact 35/100 score, Guardian's named
concerns, Pragmatist's actual requirements) rather than generic reasoning.
One minor asymmetry noted, not yet fixed: Path B's establishing shot read
slightly warmer/more resolved than Path A's, a small deviation from the
"perfectly equal treatment" rule - worth revisiting if it recurs, not
urgent from a single observation.

---

## 42. Reliability and performance work

**Retry logic added, shared across every real component.**
`app/engine/llm/callClaude.ts` now retries once automatically (after a
500ms delay) on any API failure or network error before falling back to
the visible "unavailable" placeholder. Added after a real, observed
transient failure: `paths()` genuinely failed once in the live pipeline
(visible as literal "Paths unavailable - proceed / do not proceed" text on
an otherwise fully real, high-quality report) - not a logic bug, a
transient failure under increased concurrent load, most likely triggered
by the same-day parallelization change (below). Confirmed via direct
observation: this exact fallback text is otherwise invisible-looking
enough that a user could easily mistake genuinely excellent surrounding
content (real Establishing Shot/Steelman text, unaffected by Paths' own
failure) for evidence that "the whole thing is basically working," missing
that one specific component silently broke. Worth remembering as a general
lesson: partial failure in a multi-component pipeline can be easy to miss
precisely because the surrounding real content looks so convincing.

**Partial parallelisation implemented.** Guardian, Pragmatist, and
Empathiser do not depend on each other's output - only Auditor genuinely
needs all three finished. `runBraviaSlice.ts` changed from four fully
sequential calls to `Promise.all([guardian, pragmatist, empathiser])`
followed by `auditor`. Cut real, observed load time roughly in half
(original single-run baseline was ~70s cold, ~14s warm for the whole
Bravia chain before this session's Establishing Shot/Steelman additions;
untested precisely post-change, but subjectively faster in testing).

**Client-side timeout tuned, and the reasoning behind the number matters.**
`page.tsx`'s `fetchWithTimeout` helper was initially set to 90 seconds, an
estimate made before retry logic existed. Once retries were added, real
observed full-chain timings (with the new Establishing Shot/Steelman
calls, and retries occasionally firing) reached 63-94 seconds in
successive real tests, all genuinely successful (`HTTP 200`) but
increasingly close to and eventually exceeding the original 90-second
client budget - which caused a real, confusing failure (a clean
"Couldn't load this report" client error, while the server request was
still correctly in flight and would have succeeded). Raised to 180
seconds. **Root cause understood, not just patched over:** more real
components in the chain, plus retry logic, both legitimately increase
worst-case latency; the timeout needs to track that, not be fixed once and
forgotten.

**Genuinely slow, not broken - and this is now the clear next task.**
Current honest state: a live Bravia report reliably succeeds, but takes
roughly 60-95 seconds end to end. This is a real UX problem worth solving
properly, not tolerating indefinitely. The identified, not-yet-implemented
fix: **`runBraviaSlice.ts` currently keeps Paths, Establishing Shots
waiting behind Auditor unnecessarily** - Auditor is the only component
that genuinely needs Guardian/Pragmatist/Empathiser's combined output;
Paths only needs Landscape V1/Pragmatist, and Establishing Shots only
needs Paths/Landscape/Event Horizon. A second parallel track (Landscape V2
-> Paths -> Establishing Shots, running alongside the Guardian/Pragmatist/
Empathiser -> Auditor track, both converging only at Steelman, which
genuinely needs everything) should cut meaningful additional real time,
not just raise the timeout further to tolerate the current shape.
**This restructuring is the clear first task for the next session** -
deliberately not attempted at the end of a long day, given several
fatigue-shaped mistakes already occurred today (leftover code fragments in
`panelHtml.ts`/`test-paths/route.ts` requiring multiple rounds of
correction, and the Rule 6 miss that was only caught because it was
independently re-checked rather than accepted on the first pass).

---

## 43. Updated implementation status - the live Bravia pipeline is now almost entirely real

As of this update: **Reframer, Landscape (V1 and V2), Guardian, Pragmatist,
Empathiser, Auditor, Representative Paths, Establishing Shots, and
Steelman are all real** in the live `runBraviaSlice.ts` pipeline. **Only
Clarifier remains a hardcoded fixture** within that pipeline - a
significant milestone, worth stating plainly rather than letting it pass
unremarked: eight of nine reasoning components in the flagship live
decision are now genuine reasoning, not fixture text.

This does not extend to Singapore, Portfolio, or the custom-decision path,
none of which were touched this session and remain exactly as described in
section 30/23 - still fixture, still client-side, still no connection to
any real component.

**What Clarifier being the last fixture actually means in practice, right
now:** the live Bravia report still shows a hardcoded clarifying question
and a hardcoded answer, which then feeds into the now-real Landscape V2 -
meaning Landscape V2's narrowing is real and well-tested (section 26), but
is currently always narrowing in response to the same fixed, fictional
answer rather than a real one. This is the natural, obvious next
foundational piece of work once the performance restructuring (section 42)
is done - not just because it's the last fixture, but because sections
28, 34, and 38's confirmed design requirements for Clarifier (selective
panel re-evaluation, the three-category question taxonomy) have been
sitting fully specified and completely unimplemented for several days now.

---

## 44. Performance restructuring - implemented, real gains confirmed

`app/engine/runBraviaSlice.ts` restructured based on the actual dependency
graph (checked directly against Chapters 15/17/18, not assumed):

```text
reframer -> landscape(v1)
-> [guardian, pragmatist, empathiser run in parallel]
-> merge panel results
-> two independent branches, run in parallel:
     Branch 1: auditor (needs panel results only)
     Branch 2: clarifier(fixture) -> landscape(v2) -> paths -> eventHorizons
-> merge both branches
-> [establishingShots, steelman run in parallel]
   (establishingShots needs paths/landscape/eventHorizon only;
    steelman needs paths/landscape/panel/auditor - neither needs the other)
```

This corrects yesterday's looser "two track" framing - the real dependency
graph supports parallelising establishingShots and steelman too, not just
the auditor/paths split, since neither depends on the other's output.

**Real, measured improvement:** pre-restructuring baseline was 60-95 seconds
per live Bravia load. Post-restructuring, repeated real runs landed in the
36-51 second range - roughly halved, not just faster in one lucky
observation.

---

## 45. Two intermittent bugs found via new diagnostic logging, both fixed

Console logging was added at all three possible failure points in the LLM
call chain (`callClaude`'s network/HTTP failure, `callClaudeForJSON`'s parse
failure, and each component's own shape-validation failure) after Paths
failed silently in the live pipeline with no way to diagnose why. This
logging should be considered a permanent, standing addition, not a
one-off debugging aid - it caught two real, different bugs within the same
testing session that would otherwise have looked identical from the
outside (both surfaced only as generic "unavailable" fallback text).

**Bug 1 - missing array brackets.** Several prompts (Establishing Shot,
Steelman, Paths) described the required output as "an array" in prose but
only showed a single bare object as the schema example, with no literal
`[` `]` shown. The model sometimes returned multiple separate top-level
JSON objects concatenated together instead of one array - a classic
under-specified-example failure. Fixed across all three files by replacing
every prose-only schema description with a literal, bracketed
two-item example array.

**Bug 2 - Paths occasionally returning a genuinely empty array.** Not
malformed, just zero entries - likely the combined weight of six rules
occasionally causing the model to conclude no valid path could be
constructed and give up entirely, rather than committing to the one
well-grounded path the rules explicitly say is always a valid outcome.
Fixed with an explicit one-time retry specifically for the empty-array
case (distinct from `callClaude`'s existing retry, which only fires on
network/HTTP failure, not on a technically-successful-but-empty response).

**Confirmed fixed via four consecutive clean runs after both fixes**,
versus two failures in three runs beforehand. Not proof the bugs can never
recur (both were always intermittent), but strong, real evidence, and the
permanent logging means any recurrence will now be immediately diagnosable
rather than another silent mystery.

---

## 46. Steelman internal-component-name leak - found and fixed

Live Steelman output was found directly citing internal architecture names
in user-facing text - e.g. *"directly protects against the Guardian's
identified risks,"* *"sidesteps the Empathiser's concern."* These are
internal component names with no meaning to an actual reader - a leaky
abstraction, not a stylistic issue. Root cause: `STEELMAN_SYSTEM_PROMPT`
labels its input sections by component name ("Guardian's findings,"
"Empathiser's findings"), and nothing told the model not to cite those
same labels back in its output.

**Fixed** with an explicit rule: Steelman must translate every finding into
plain, self-contained language describing the concern or fact itself,
never naming which internal component produced it.

**Standing house rule, agreed for any future component that reads another
named component's output** (relevant to a future Auditor enhancement, and
now to Establishing Shot, which was given the same four components'
output today - see section 47): internal component names must never appear
in any user-facing text. Confirmed Auditor's own existing output does not
currently have this leak (checked directly), so this was Steelman-specific,
not systemic - but worth checking any future component built the same way.

---

## 47. Establishing Shot - major rework, the deepest tuning pass of any component so far

Started from a direct complaint: yesterday's live output, while
technically rule-compliant, read as flat and added nothing - described in
discussion as "we've stripped so much away with the 'don'ts' that we're
left with a $2 steak." This section records the full diagnostic path, not
just the final rules, because the reasoning behind each one matters for
recognising similar failures in future components.

### Diagnosis 1 - constraints without positive modelling

The prompt had accumulated many "don't" rules (no bias, no invented
decline, no narrated time, no third person, no telling emotion, no
over-explaining) with almost no shown example of what excellent actually
looks like. LLMs respond far more strongly to being shown one genuinely
great example than to abstract rules alone. Fixed by pulling three real
worked examples directly from `Landscapes/working_draft_0.1` and
`Presentation_docs/Establishing_shot_presentation_ideas_0.1` into the
prompt itself, rather than paraphrasing around them.

### Diagnosis 2 - richness is a property of attention, not the object

Direct discussion (the espresso-machine/iPhone analogy) established: a
decision's inherent "worldly significance" must never affect how much care
the shot gives it - a television purchase deserves the same close,
respectful attention as a family relocation, because to the person asking,
it may carry equivalent real weight. This was added explicitly to the
prompt's Purpose section, not left implicit.

### Diagnosis 3 - richer input helps, confirmed by direct A/B test

Established that `establishingShots.ts` originally received only
Landscape/Paths/Event Horizon - never Guardian/Pragmatist/Empathiser/
Auditor's real findings, unlike Steelman, which gets all four. Tested
directly: giving Establishing Shot the same four inputs Steelman uses
produced a measurably richer result in the very next run (a specific,
socially-textured detail - deflecting a friend's comment about price -
directly traceable to a real Pragmatist requirement). **Confirmed real
improvement, not assumed.** `buildEstablishingShotUserPrompt` now includes
all four components' real output, explicitly framed as raw material for
finding a scene, not material to argue from (this is also why the
component-name leak rule from section 46 was extended to this file too).

### Diagnosis 4 - "afterlife, not the transaction"

Direct discussion (the £2k-savings/PS5-with-friends example) identified
that early shots kept the person tethered to the transaction itself
(holding a warranty folder, still comparing prices) rather than showing
life happening *through or because of* the decision, with the object
receded into the background. New rule added: a good shot depicts the
decision's afterlife - a shared moment, a feeling, an unrelated
possibility - never a moment still relating directly to the purchase
itself.

### Diagnosis 5 - the "frozen moment" rule was too literal, and its actual purpose is narrower than assumed

Checked directly against the docs rather than assumed: the frozen-fact
rule is never justified with an explicit rationale in the source material,
but its own worked examples reveal the real concern - inference over
narration. *"Your sister's last message remains unread"* works because it
lets the reader silently infer an entire backstory; the forbidden version
narrates a long-span change directly instead of showing one present fact.

**This means a short, continuous take (a scene unfolding over a few real
seconds - multiple small beats in one unbroken moment, like a single
camera take) is NOT the same violation as narrating change across weeks or
months, even though both technically involve "time."** The real test:
"am I narrating a long-span change, or showing one true present moment
(which may last a few seconds) and trusting the reader to infer the
rest." Confirmed via direct testing: the best results of the entire day
(the Friday-night film scene, the dinner-bill scene) were short continuous
takes, not single frozen images, and were explicitly judged as genuinely
excellent, not merely rule-compliant.

### Diagnosis 6 - ambient reactions are safe, caused/directed reactions are not, and this needs a further refinement

Direct discussion established a precise, causal test for when another
person's visible reaction is acceptable in a shot: **ambient and
unrelated to the decision (would happen identically regardless of which
path was chosen) is safe; caused by or directed at the decision itself
(a verdict on the choice) is not**, since it presumes an outcome the
Decision Model has not established. Confirmed with a real example: a
friend laughing about a dinner bill (unrelated, safe) versus a friend's
face changing on hearing news about the actual decision (a rendered
verdict, unsafe).

**Refinement identified during the sister-scenario stress test, not yet
written into the prompt:** the rule as stated only anticipated the person
being kept unaware reacting to a truth they don't yet know. It did not
anticipate a second person who IS aware of the situation (e.g. the sister
herself, in the "don't tell" path) having a reaction of their own (a
half-second glance, catching the reader's eye) that is arguably still
caused by the shared secret, not genuinely ambient. **Not yet fixed** - the
rule needs to cover any second person's reaction, not only the person
being protected from the truth.

### Two remaining open issues, confirmed via the sister-scenario stress test, neither yet fixed

**Occasional near-verbatim mirroring between paths.** One test run
produced two Establishing Shots that were nearly identical sentence-for-
sentence, differing only in the final swapped object - directly
contradicting the "equal dignity through difference, not mirroring" rule
already in the prompt. The rule clearly isn't reliably holding on its own
wording; a later run on the same Bravia case produced genuinely distinct,
non-mirrored results, so this is inconsistent rather than a hard failure -
worth a more concrete anti-mirroring instruction if it recurs, but
deliberately not chased further on Bravia alone, since Bravia is a
comparatively thin decision (one person, no relationship stakes) and the
richer sister scenario was judged the better test to prioritise instead.

**Path-outcome unfaithfulness - a real, more fundamental bug, confirmed
once, not yet recurring on retest.** One Establishing Shot for "tell the
best friend" actually depicted NOT telling him (phone turned face-down
unopened, friend still happily unaware) - directly contradicting that
same path's own stated `outcome` field ("friend learns of the affair
immediately"). This is a different, more serious class of problem than
tone or richness - the shot failed to render the correct path's actual
consequence at all, which Chapter 17 treats as a hard requirement, not a
style question. Two subsequent test runs on the same sister scenario did
NOT reproduce this - both were faithful to their paths' stated outcomes -
but two clean runs after one clear failure is not strong enough evidence
to call this resolved. **Flagged as the first thing to test directly next
time Establishing Shot is revisited**, likely via an explicit instruction
to check the shot against its own path's outcome before finalising.

### A genuine gap in Paths, found via the sister-scenario stress test, not yet fixed

Predicted, then tested twice, that a legitimate third path should exist
for the sister/best-friend scenario: "give the sister an ultimatum -
tell him yourself, or I will." Checked against all six Paths rules and
judged to pass every one - genuinely terminal (a real, different state:
no longer personally deciding whether disclosure happens), no invention
(both people already exist in the decision), and directly motivated by a
real, already-established finding (Empathiser's "betrayal by the
messenger" concern from a much earlier session). **This path did not
appear in either of two independent test runs** - both stayed strictly at
a binary tell/don't-tell. Two consistent misses on something specifically
predicted and defensible under the existing rules is real evidence of a
gap, not yet enough to be certain it's systemic. **Candidate rule for
Paths, not yet written or tested:** for decisions involving a third
party who could act instead of the decision-maker, explicitly check
whether that third party's own agency creates a genuine middle path
before settling for a binary.

---

## 48. Current status of Establishing Shot's rule set

All of the following are now implemented in `ESTABLISHING_SHOT_SYSTEM_PROMPT`:
worked examples in-prompt, richness-as-attention-not-object-significance,
afterlife-not-transaction, the corrected frozen-state/continuous-take
rule, the ambient-vs-caused-reaction rule (not yet covering aware third
parties - see section 47), equal-dignity-through-difference, second person
throughout, no internal component names.

**Not yet implemented, both confirmed necessary via direct testing:**
the aware-third-party refinement to the reaction rule, and any fix for
path-outcome faithfulness (currently unconfirmed whether it needs fixing
at all, given it hasn't recurred - worth testing more before assuming a
fix is even needed).

**Not yet implemented in Paths:** the third-party-agency rule suggested by
the missing ultimatum path, based on two consistent test misses.

---

## 49. End-of-session amendment - two Establishing Shot issues are recurring, not resolved

Further testing after section 47/48 found that two issues thought fixed
reappeared in a later run, despite the relevant prompt rules being present
throughout: the frozen-state/narrated-change rule (a shot used "longer than
you used to," the same forbidden pattern as before) and disclosure-path
outcome faithfulness (a shot for a "friend learns the truth" path showed no
signal - neither shown nor minimally told - that disclosure had occurred).

Both had been confirmed working cleanly in earlier runs the same night.
Their reappearance suggests these two failure modes are more deeply rooted
in how the model handles a disclosure-with-unshowable-reaction path than a
single wording fix reliably closes - worth treating as **open and
recurring**, not resolved, when this is next picked up. Do not assume a
clean run means either is fixed; retest a handful of times before trusting
either one.

Two smaller fixes were also made and appear solid: a delegation rule added
to `paths.ts` Rule 1 (rejecting "get someone else to disclose on your
behalf" as a false path, confirmed directly against the docs' own
"Tell your sister she must tell him... that is Navigator" example), and a
duration/memorability refinement added to Establishing Shot's Purpose
section (5-10 second window, "memorable enough to reference later without
rereading" as a second success test alongside recognition).

Also corrected from section 47: the "missing ultimatum path" flagged
earlier as a Paths gap was itself a misreading - the docs explicitly
reject that exact path shape as a valid Representative Path. Paths was
correct to never produce it; no fix needed there.

A readable HTML renderer for the Paths + Establishing Shots test route
(`renderPathsAndShotsHtml` in `panelHtml.ts`) was added, matching the
pattern already used for other test routes.

---

## 50. Establishing Shot - compression, tense, and camera-positioning fixes, all confirmed working

Continuing from section 49's flagged recurring issues (the frozen-state
narration slip and disclosure-path faithfulness), a separate, larger
problem was identified: shots had drifted into narrating short but real
*sequences* of several discrete actions (phone lights up, then you turn
it, then you reach for something, then he laughs, then he rewinds) -
technically brief, but genuinely accumulating real elapsed time, several
seconds to perhaps half a minute per shot. Confirmed via direct
discussion using a "bullet time" analogy (the Matrix): a huge amount of
visual detail can be shown while almost no real time passes, because it
is one compressed instant observed closely, not a short story with
several beats.

### Rule added and confirmed: one continuous action, not a sequence

A shot may contain ONE continuous action or gesture already in progress
(a laugh happening, a hand reaching, a cup beginning to tip) - this is
still one simultaneous instant despite having a natural duration. Two or
more discrete actions happening one after another is not allowed, however
briefly each is phrased. **Confirmed working across multiple retests** -
shots now consistently read as one tight moment rather than a chain of
triggered events.

### Rule added and confirmed: participle phrasing over simple present tense

A genuine grammatical finding, not just a style preference: present
participles ("your friend laughing," "the dog chasing") describe an
ongoing state with no defined start or end - exactly what a simultaneous
instant needs. Simple present tense ("your friend laughs," "the dog
chases") is what screenplay action lines use specifically because it
reads as a sequence of discrete, complete events - the opposite of what's
wanted here. Rule added: favour participle phrasing for background
detail, reserve simple-present verbs for at most the one true central
action. **Confirmed working** - directly tested by comparing two
near-identical sentences differing only in this grammatical choice.

### Rule added and confirmed: camera positioning can smuggle in a verdict, separately from person-reaction bias

A new, previously unnamed failure mode was found: a shot depicted the
narrator ("you") standing physically apart from a group while passively
watching them - *"you stand a few feet off... watching the two of them"* -
which reads as isolation/exclusion even though no emotion is stated
directly and no other person's reaction is shown. This is distinct from
the existing ambient-reaction rule (section 47), which only covers other
people's behaviour - this is about the narrator's own physical position
and stance relative to the group.

Two competing fixes were considered: removing "you" from shots entirely
(a fully external, disembodied camera), versus a narrower fix targeting
only the specific combination of physical distance plus passive
observation. **Tested directly against the project's own established gold-
standard examples** (the toast-on-the-knees / dinner-bill-with-friends
pair) - both of those already place "you" in the scene, but always close
among people, doing a small incidental action (settling onto a sofa arm,
sliding a phone across a table), never at a distance watching. This
confirmed the narrower fix was correct: **the problem is not whether "you"
appears, it's whether "you" is placed apart from others as an observer
versus among them as a participant.** Rule added accordingly and
**confirmed fixed on retest** - the next sister-scenario run correctly
kept "you" embedded and participatory (passing a beer, topping up a
glass) with no distance/observation language anywhere.

### Current honest status

All of the following in `ESTABLISHING_SHOT_SYSTEM_PROMPT` are now
confirmed working across multiple tests, not just single clean runs:
worked examples, richness-as-attention, afterlife-not-transaction,
frozen-state vs. continuous-take, compression (one action not a
sequence), participle phrasing, ambient-vs-caused reactions (including
aware third parties), the minimal-telling exception for disclosure paths,
faithfulness to stated path outcomes, anti-mirroring, and now
camera-positioning. This is the most heavily tested and iterated
component in the entire project. Two items from section 49
(frozen-state slip, disclosure faithfulness) had each individually
reappeared once after being marked fixed, then held clean across several
subsequent retests since - worth continued light monitoring rather than
further active work, since no clear pattern of recurrence has held.

---

## 51. A genuine third path confirmed for the sister/best-friend scenario, and a ready-made Event Horizon worked example

Direct discussion produced a clean, three-way irreversible-state analysis
for the sister/best-friend decision, offered as the actual definition of
that decision's Event Horizon (still fixture - see section 30) once real
Event Horizon reasoning is built:

1. **Say nothing** - a genuine, legitimate destination, not merely an
   absence of action - staying silent carries its own real, irreversible
   consequences (risk if the truth surfaces later, being seen as
   complicit) regardless of whether anything is ever said.
2. **Tell the best friend directly.**
3. **Tell the sister that you know** (without telling the friend) -
   confirmed as a genuinely separate, legitimate path, not a delegation
   attempt. This is different from the previously-rejected "press her to
   tell him herself" idea (section 32/49) - that was an uncertain attempt
   to cause path 2's outcome by another route. This is its own stable,
   irreversible destination: the sister now knows you know, the friend
   still knows nothing, and this cannot be undone.

None of these three can be reversed once entered, and each leads
somewhere genuinely different - a clean, ready-made illustration of what
Chapter 16's Event Horizon concept should identify for this decision,
worth using directly as a worked example when Event Horizon is next built
for real.

**Open, unresolved issue, confirmed distinct from tonight's Establishing
Shot work:** Paths (unchanged tonight) generates this third path
("confront sister, not friend") inconsistently across otherwise similar
runs of the same sister/best-friend prompt - present in some runs,
absent in others, with no code change between them. Not yet diagnosed -
worth investigating directly next time Paths is revisited, possibly
connected to how strongly a given run's Landscape happens to ground the
"confronting the sister" axis, but this is a hypothesis, not confirmed.

---

## 52. Establishing Shot - reroll mechanism, four more content fixes, and five new test scenarios

### Reroll mechanism built and confirmed working

`establishingShots()` now accepts an optional second parameter,
`previousAttempts: { pathId: string; shot: string }[]`. When provided,
the prompt explicitly lists what was already shown and instructs the
model to write a genuinely different scene, not a variation on the same
setting. **Confirmed working directly** - a dedicated test route ran the
same context twice in sequence, passing the first result into the
second call, and the two attempts used completely different material
(hawker-stall noodles vs. a rainy condo pool; Saturday football vs. a
birthday cake) with no repeated phrasing or imagery.

**Product principle established, not yet implemented in the UI (belongs
to the deferred "what's seen and not seen" conversation):** regeneration
should be capped at a small number (proposed: 3) for an architectural
reason, not just a UX one. The system's core premise is that most people
already know their real answer and the job is to help them *recognise*
it, not argue them into a different one - unlimited rerolling would let
someone route around that premise entirely (reroll "stay" until it
sounds bleak enough to justify a decision already made). A hard cap
keeps the tool honest to its own founding principle. This also raises
the bar on per-draw quality, since a user only gets a couple of chances,
not an unlimited search for a result they already wanted.

### Four content fixes made and confirmed via direct testing

1. **Stock cultural imagery.** The "stay" path repeatedly defaulted to
   generic British cultural furniture (Sunday roast, mother-in-law,
   neighbourhood football, a pub) across three independent runs of the
   Singapore relocation fixture - genre defaults standing in for genuine
   specificity. Fixed with an explicit instruction against this pattern
   when a decision has few concrete facts to draw from. **Confirmed
   fixed** - the same fixture subsequently produced condo/hawker-centre/
   grandmother's-kitchen detail with no repeated cliché across further
   runs.

2. **Named-person consistency.** A shot referred to the same person by
   name ("Vera") and then by role ("your spouse") as if they were two
   different people. Fixed with an explicit rule to pick one and use it
   consistently within a shot.

3. **Vague, unclear symbolism.** Two separate real examples surfaced -
   "her sentence ending where your sister's name used to sit" and a
   sketched floor plan meant to imply someone had left their job, but
   vague enough to mean almost anything (a house move, a renovation).
   Fixed with an explicit clarity rule: a confirming detail must be
   specific enough that it could only belong to this exact outcome, not
   merely compatible with several different situations.

4. **Viewpoint consistency when the decision concerns someone else.**
   When a prompt is framed as "should my wife take X," two independent
   test runs made opposite, unstated assumptions about whose perspective
   "you" occupies - one wrote "you" as the wife herself, the other as
   her husband watching alongside her. Fixed with an explicit rule: "you"
   must consistently mean the person actually facing and reasoning
   through the decision, matching how the prompt itself is framed - never
   shifting between paths or between generations of the same decision.

**One rule clarified, not changed in substance:** confirmed that a
duration describing a long-standing, unchanging routine ("the same
parents who've stood here every Saturday for three years") is allowed
under the frozen-state rule, since it asserts one continuous stable fact
with no implied contrast to an earlier, different state - distinct from
a duration that narrates a *change* (the previously forbidden "hasn't
lit up for weeks" pattern). This distinction was tested directly against
a real example before being confirmed, not assumed.

### Five new test scenarios run, several genuinely new findings

**Redundancy** (Vera, kept intentionally specific with agreement from
the user rather than generalised - see section 51's approach). A real,
generated PDF document from the old Constitution-era architecture was
found sitting unused in the repo (`Redundancy_Decision_Framework.pdf`),
proposing THREE paths including "negotiate an alternative" - structurally
identical to the previously-rejected "negotiate remote work" pattern
(a route toward an existing outcome, not a distinct destination). **The
current, tested architecture was run directly against this scenario and
correctly produced only 2 paths, declining to generate the negotiate
option** - a clean, concrete confirmation that today's rule set has
genuinely improved on the earlier architecture's actual output, not just
changed it in the abstract.

**Third child, framed with a partner explicitly present** ("should my
partner and I have a third child"). A hypothesis going in - that this
decision might create bias because neither path is a "safe" option the
way most prior fixtures had - was tested and found unsupported. Both
paths produced equally warm, equally dignified results with no implicit
favouring of either. Worth recording as a real, tested finding rather
than an assumption either way.

**Third child, framed without stating a partner** ("should I have a third
child") - deliberately built after the user identified this as a
materially different and harder test than the partnered framing. This is
the most significant finding of the two-day arc, detailed in section 53.

**Also confirmed:** for the "have a third child" decision, Reframer,
Landscape, and Paths all independently and correctly settled on exactly
2 paths - no valid third option exists (no partial/intermediate state -
"you can't be a bit pregnant"). This is now the second clean, concrete
Event Horizon worked example on file (alongside the sister/best-friend
scenario's three irreversible states from section 51) - a genuinely
absolute, binary, biologically-irreversible threshold, ready to use
directly whenever Event Horizon is built for real.

---

## 53. The central finding of this arc: Establishing Shot cannot fully solve an ambiguity that belongs to Clarifier

Testing "should I have a third child?" (no partner stated) surfaced a
real, precise problem: **Landscape and Auditor both correctly tracked
"is a partner involved/in agreement" as a genuine, explicitly-flagged
unresolved uncertainty** (visible directly in Auditor's `assumptions` and
`blockingUncertainties` fields) - but Establishing Shot initially ignored
this and confidently staged a specific partner doing specific things
anyway, contradicting what its own upstream input had explicitly said was
unknown.

This was **not** a case of upstream reasoning failing and needing a
fix - Reframer, Landscape, and Auditor all behaved correctly. The gap was
narrower and more precise: Establishing Shot had no instruction to check
whether something it was about to depict as settled fact was still
flagged as genuinely open elsewhere in its own input.

### Fix, iterated twice, second version confirmed working

First attempt: a general instruction added to the system prompt asking
Establishing Shot to respect Auditor's flagged uncertainties. **Tested
directly - only partially worked.** One path (no partner mentioned at
all) succeeded; the other path independently reintroduced a confidently-
staged partner in the same generation. Diagnosed as a structural
problem, not an instruction-strength problem: Auditor's `assumptions` and
`blockingUncertainties` were being passed into the prompt as one
unlabelled line buried among several other panels' worth of text,
competing for attention rather than being visually distinct.

Second attempt: `buildEstablishingShotUserPrompt` was restructured (not
just the system prompt) to pull Auditor's `assumptions` and
`blockingUncertainties` into their own clearly marked, impossible-to-miss
section, with an explicit self-check instruction appended ("before
finalising, check every detail in your own draft against this list").
**Confirmed working on retest** - the following generation produced two
shots with zero confident staging of a partner, built entirely from the
reader's own actions and the two existing children, with no loss of
vividness or specificity elsewhere in either shot.

### The architectural conclusion, agreed directly in discussion

Even with the fix now working, **this is fundamentally the wrong
component to be solving this problem in.** Vividness and honestly-hedged
uncertainty are in genuine tension by nature - every fix in this section
was fighting that tension with progressively louder prompt instructions,
with diminishing and uncertain returns. The actual correct architecture
is Clarifier: "is a partner involved in this decision?" is exactly the
single, high-value question the whole system exists to ask before
reasoning proceeds much further downstream. Once Clarifier resolves it,
Landscape V2 would carry a settled fact forward, and Establishing Shot
would never face this dilemma at all.

**This is now the strongest, most concrete motivating example on file for
building Clarifier for real** - stronger than the redundancy or sister
scenarios, because the ambiguity here cannot be fully resolved by writing
technique alone, no matter how well-tuned the prompt gets. The fix made
today should be kept (it's a genuine, working safeguard), but further
tuning of Establishing Shot in pursuit of this exact problem is
judged to have reached diminishing returns - the next real step is
Clarifier itself, not another round of Establishing Shot instructions.

---

## 54. Current status: Establishing Shot tuning arc considered complete for now

Across this and the previous session, Establishing Shot has been tested
against eight genuinely distinct decision shapes (TV/bed budgets, Lexus,
Bravia, sister/best-friend, Singapore relocation, redundancy, third child
both framings) and iterated through roughly twenty distinct rule
additions, each one added in direct response to a real, observed failure
rather than speculatively. It is judged the most heavily tested and
currently most reliable component in the pipeline, with one honest
caveat carried over from section 49: two early-arc issues (frozen-state
narration, disclosure-path faithfulness) each recurred once after being
marked fixed, then held clean across many subsequent retests since -
worth light continued monitoring, not further active work.

**Next recommended step, agreed directly: Clarifier.** Three separate,
independently-confirmed design requirements are already on file and ready
to build against: selective panel re-evaluation with loop-avoidance
(section 28), the three-category question taxonomy - factual/scope,
values/preference, allocation/trade-off (sections 34, 38), and now this
section's concrete "is a partner involved" case as a fourth, high-value
motivating example.

---

## 55. Clarifier - now real, built directly from Chapter 13, with a genuine methodological finding along the way

`app/engine/clarifier.ts` converted from a hardcoded fixture to a real
component, following the established pattern. Built directly from a
fresh, full re-read of Chapter 13 (not from memory of earlier
discussion) - Clarifier's job is to identify the SINGLE highest-value
clarifying question, driven primarily by Auditor's blocking
uncertainties, outputting four fields: target, method, question,
rationale.

**`ClarifierMethod` widened from 3 to 7 values.** The existing type
(`ISOLATION | THRESHOLD | COUNTERFACTUAL`) only overlapped with one of
Chapter 13's five named methods (isolation, comparison, prioritisation,
confirmation, decomposition). Since the chapter's own wording says these
are "examples," not a closed list, the type was widened to include all
seven rather than replacing the existing ones - `ISOLATION | COMPARISON
| PRIORITISATION | CONFIRMATION | DECOMPOSITION | THRESHOLD |
COUNTERFACTUAL`. Worth noting: the chapter's five methods map almost
exactly onto the three-category Clarifier taxonomy independently derived
through testing days earlier (factual/scope ~ CONFIRMATION,
values/preference ~ ISOLATION/COUNTERFACTUAL/THRESHOLD,
allocation/trade-off ~ PRIORITISATION) - genuine convergence between
empirical testing and the formal spec, not something imposed after the
fact.

### A genuine architectural question surfaced and resolved before building

Chapter 14 (Clarifier Response) explicitly lists what may be updated
after a clarification (Landscape, uncertainties, Auditor readiness,
Paths) and does NOT include re-running Guardian/Pragmatist/Empathiser -
in real tension with the broadband test's finding (recorded weeks
earlier) that Empathiser produces measurably richer output when it can
see a revealed-preference answer. Rather than silently picking a side,
this was surfaced directly and resolved by examining actual switching
cost: since Empathiser already reads `clarifierResponse` when present
(built weeks ago for the broadband test), building strictly to the
documented spec first, and adding selective panel re-evaluation later if
still warranted, was judged the lower-risk path in both directions.
**Decision: build to the documented spec now (Clarifier/Clarifier
Response do not trigger panel re-runs); revisit selective re-evaluation
as a separate, later decision once real Clarifier output exists to
evaluate it against.**

### The critical, late-discovered correction: Clarifier answers are NOT free text

After building and testing Clarifier Response around free-text answers
(and getting genuinely good results interpreting a clean answer, a
deliberately hedged/ambiguous answer, and a missing answer), it was
identified that this was built on a wrong assumption: **real user
answers to a Clarifier question should be selected from a small,
fixed set of options (radio-button style), never free text.** This
was confirmed by checking every worked example across both the chapter
and the dedicated Clarifier voice document - every single example
question is grammatically closed-form ("would you...", "does it feel
like..."), consistent with a small answer set, never an open prompt for
elaboration.

**Both components were revised accordingly:**
- `clarifier.ts`'s output gained a new required field, `answerOptions:
  string[]` - the system prompt now requires 2-4 mutually exclusive
  options, including "Not sure" whenever genuine uncertainty in the
  person's own answer is plausible.
- `clarifierResponse.ts` was simplified to take a selected option
  (`string | null`) rather than a raw sentence - genuinely simpler code,
  since it no longer needs to parse open-ended interpretation, only
  determine the semantic effect of a known, bounded selection.

**Confirmed working on retest against the frozen fixture (see below):**
both real options correctly resolved to RESOLVED with accurate,
consequence-stating effect text; "Not sure" correctly resolved to
DEEPENED rather than being forced into a false resolution; no-selection
correctly triggered the explicit default-assumption fallback.

### A significant methodology finding: re-running the full chain confounds test results

Testing Clarifier's question quality initially involved re-running the
entire chain (Reframer through Auditor) fresh for every test. This was
found to be a real problem, not just inefficient: Auditor's own output
varied meaningfully between otherwise-identical runs of the same
prompt (different blocking uncertainties surfaced each time), making it
impossible to tell whether a change in Clarifier's output reflected a
prompt fix working or failing, versus simply reacting to different
upstream input. **A frozen-context test fixture
(`cofounderFrozenClarifierTestContext`) was built, hand-authoring
Reframer/Landscape/Panel/Auditor output once and holding it constant
across repeated Clarifier-only test runs.** This immediately clarified
a real result: five runs against frozen input showed near-total
consistency in Clarifier's target/method/question, and clearly isolated
one instruction that had completely failed to take effect (see below) -
a distinction that would have been impossible to draw confidently
against a re-generated chain. **This frozen-context approach should be
the default for testing any single component's prompt changes going
forward** - full-chain re-runs remain useful for genuine end-to-end
tests, but not for isolating whether one specific prompt edit worked.

### Four real Clarifier question-quality fixes, each confirmed via direct testing

1. **Test the difficult hypothetical, not the easy one.** An early
   Lexus test asked "if the inspection comes back clean, would you still
   want it?" - almost always yields yes, low information value. Fixed:
   revealed-preference questions must test the unfavourable case ("if it
   needed £X of work, would you still proceed?"), while still remaining
   fair and open (not stacking multiple worst-case details to steer
   toward one answer).

2. **Don't span two magnitudes in one threshold question.** A
   subsequent version asked about "a few hundred to a couple thousand
   pounds" as one range - two genuinely different scales of risk that
   can't be distinguished by one answer. Fixed with an explicit
   instruction to pick a single decision-relevant point.

3. **Never bundle two facts with "or"/"and."** A cofounder-scenario
   question asked about two distinct legal facts in one sentence. Fixed
   with an explicit anti-bundling rule.

4. **Don't substitute a superficially-similar but different mechanism.**
   The clearest, hardest-won fix of the four: a question about "letting
   the company fold" (informal, passive withdrawal of support) kept
   defaulting to asking about formal "dissolution" (an active legal
   procedure) - not the same thing, and a dissolution-agreement clause
   would not necessarily prevent someone from simply walking away.
   **A first, abstract instruction ("these are different, don't
   conflate them") completely failed against the frozen fixture - 0 of 5
   runs corrected the behaviour.** A second, more concrete version
   (explicitly naming and defining two labelled categories -
   FORMAL/ACTIVE vs. INFORMAL/PASSIVE - with a direct test for which one
   a given scenario matches) succeeded completely - 5 of 5 runs
   correctly reasoned about passive withdrawal on retest. **Worth
   recording as a general lesson beyond this one fix: abstract
   "don't do X" instructions can lose against a strong pattern-matching
   pull in the underlying model (here, far more training data exists
   about formal legal dissolution than informal business collapse);
   naming concrete, labelled categories and giving an explicit test
   between them succeeded where the abstract version did not.**

### A methodological lesson worth keeping independent of any specific fix

While investigating the third-child-solo scenario's partner-related
Clarifier question, it was determined - after real back-and-forth, not
assumed - that partner involvement was never actually the right target
for that specific fixture's prompt ("should I have a third child," not
"should we"). The question Clarifier had already produced (testing the
person's own desire, held constant against external circumstances) was
correct all along; two sessions of treating "partner ambiguity" as the
thing to fix had drifted from what was actually asked. **Worth recording
as a standing discipline: periodically re-derive the actual target from
first principles (what did the prompt actually ask) rather than
continuing to optimise toward an assumption that became load-bearing
simply because it was the thing being discussed for a while.**

---

## 56. Note on source reliability, given this is now the second confirmed instance

A claim relayed from ChatGPT this session ("Reframer owns Clarifiers; the
panel consumes clarified context but doesn't request clarification
itself; Clarifiers exist before the panel begins reasoning") was checked
directly against the actual Chapter 13 text and found to be a direct
contradiction: the chapter explicitly states Clarifier "is driven
primarily by the Auditor" (a panel member), which is only coherent if
Clarifier runs after the panel, not before - exactly matching the
architecture already built and tested for weeks. This claim was
discarded rather than incorporated.

This is at least the second time in this project's history that a
confidently-stated recollection from ChatGPT has been checked against
primary source material and found to be incorrect (the first being the
still-unverified "House of Horrors" / "98 out of 100" testing
philosophy, never found in any document despite being cited with
confidence on two separate occasions). **Standing practice, already
being followed and worth continuing deliberately: treat any
ChatGPT-relayed claim about prior project history or architecture as
requiring direct verification against the actual source documents or
tested code before being acted on, never as authoritative on its own.**

---

## 57. Current status - Clarifier and Clarifier Response both real, more work remains

Both components are built, tested against a frozen fixture with multiple
genuinely different response types, and behaving correctly. This is a
real, working addition to the pipeline - but explicitly not yet
integrated into any live slice (Bravia's pipeline still uses the
hardcoded clarifier fixture and a hardcoded clarifierResponse). Wiring
real Clarifier/Clarifier Response into the live pipeline, and building
whatever UI is needed to actually present `answerOptions` as selectable
choices to a real user, remain open next steps - explicitly acknowledged
as unfinished, not a small remaining detail.

---

## 58. Clarifier UI - a real mockup, and four genuine design findings (none yet implemented)

A live, working mockup of a Clarifier question was built and demonstrated
directly - a card presenting the question text, rationale, and 2-4
selectable answer options (matching `answerOptions`), each option a
clickable, radio-style choice rather than free text. This confirmed the
radio-button design decision from section 55 is genuinely buildable and
reads well, not just correct in principle.

**None of the following is yet implemented in code - all are design
conclusions from direct discussion, ready to build against once the
front-end work begins.**

### Friction is not the only cost of asking more questions

A real, valuable observation: because a vanishing, low-friction
radio-card question costs almost nothing to answer (no scrolling, no
permanent chat clutter), the traditional "minimise questions" discipline
might seem less necessary than in a heavier chat-based interaction.
**This is genuinely true for one input to that discipline (UI/UX
friction) but not for a second, independent input: each answer can
change what the next highest-value question even is.** Clarifier's job
is to select the single best question given the Decision Model as it
currently stands; pre-selecting a batch of several questions up front
would mean later questions in the batch are answered against stale
context - functionally the same "questionnaire, not focused reasoning"
failure Chapter 13 explicitly rejects, just wearing a nicer UI.

**Resolved design: low-friction UI makes several SEQUENTIAL, adaptive
rounds pleasant and fast (ask one, incorporate the answer, re-evaluate,
only ask again if a new highest-value question genuinely still exists) -
it does not license presenting several questions SIMULTANEOUSLY as a
batch.** Logging each round's question and answer for later review is a
good, separate idea, worth keeping regardless of this distinction.

### A genuine gap: no "undo" exists

If a person selects the wrong option, or immediately realises they meant
a different one, there is currently no way to correct it -
`clarifierResponse()` treats a selection as immediately final. This is a
real, acknowledged missing requirement for whenever the UI is built, not
a hypothetical edge case.

### Progress indicators would be dishonest, given how the architecture actually works

A literal "Question 2 of 4" style progress bar was considered and
rejected: the system genuinely does not know in advance how many
clarifying rounds will be needed (each round is independently decided,
per Chapter 13's explicit rejection of pre-planning a full question
set), so a numbered total would be a false promise, not a UI nicety.

**Resolved instead: contextual, honest primer text instead of a
progress bar.** No primer at all when zero clarifiers are needed (the
common case). "One quick question before we go further" when exactly one
is needed. Something like "One more thing worth checking" only if a
second round genuinely becomes warranted after the first answer - never
stated in advance, since it isn't true in advance.

---

## 59. Clarifier voice selection - Feynman Isolation vs. Human Consequence, tested against the real chapter text

A list of ten "Human Consequence" example questions, originally
generated by ChatGPT under a self-invented label, was checked directly
against the actual dedicated voice document
(`Presentation_docs/Clarifier_presentation_ideas_0.1`) rather than taken
at face value - consistent with the standing practice recorded in
section 56. Several genuinely diverged from the documented shape: some
bundled two questions in one, several were open-ended essay prompts with
no reducible answer set (directly incompatible with the radio-button
design), and a few read as generic, ungrounded pop-psychology rather
than the doc's own requirement that the scenario be concretely anchored
to established facts. Two of the ten (once user-reviewed) were judged to
have crossed into an unwanted tone entirely.

### The real, documented core shapes, confirmed by direct reading

**Feynman Isolation** - two valid moves, both confirmed in the source
text:
- **Move A (remove one uncertainty):** "Suppose X is solved. Would the
  decision still feel blocked?"
- **Move B (isolate one factor):** "Forget everything except X. Does X
  materially change the decision?"

**Human Consequence** - one core shape: "Imagine X has happened. The
initial feeling has faded. Now you are living with the consequence.
Does it still feel acceptable?"

The document also contains its own ten-point Clarifier quality self-test
(e.g. "is it testing one hinge only," "does it avoid adding facts,"
"what would Answer A/B change in the Decision Model," "is the scenario
short enough") - richer than the single self-check currently built into
`clarifier.ts`. **Not yet incorporated into the real prompt - worth
adding in full next time Clarifier is revisited.**

### A recurrence of an already-solved Establishing Shot problem, caught and fixed in wording

A generated Human Consequence example included "the tension of the
standoff has faded" - directly narrating an emotional change rather than
showing a concrete detail that implies it, exactly the "tell, don't
show" failure spent an entire prior session eliminating from
Establishing Shot. Confirmed as a real recurrence, not a one-off: the
doc's own template phrase ("the initial excitement/fear/pressure has
faded") risks the identical failure by construction. **Worth explicitly
importing Establishing Shot's show-don't-tell discipline into Human
Consequence's construction, not just describing the core shape - a
concrete image doing the same work ("you watch the company carry on
without you") is what actually earns the "time has passed" quality, not
a stated feeling.**

### A working hypothesis for choosing between the two voices, tested across four scenarios

Initial hypothesis (domain-based: emotional topic leads to Human
Consequence, logical topic leads to Feynman) was tested directly against
Bravia, Singapore relocation, third-child (solo framing), and the
cofounder buyout - and found to make a wrong prediction for Singapore,
an emotionally loaded decision the user nonetheless judged as still
better served by Feynman.

**Corrected hypothesis, arrived at through discussion, explicitly held
as a working brief rather than confirmed architecture:** the real axis
is not how emotional the topic is, but whether the targeted uncertainty
is a fact or probability about the world (however emotionally loaded the
subject - "will the child settle happily" is still a predictive fact)
versus a preference that has no existence until imagined (e.g. genuine
desire for a third child, which cannot be externally verified at all,
only surfaced by inhabiting it). Fact/probability uncertainties favour
Feynman; ungroundable preference uncertainties favour Human Consequence.
Confirmed by the user's own independent judgment across all four test
scenarios once articulated this way, including correctly predicting why
Singapore felt "close" but still Feynman-favoured, and why third child
was "no debate" in Human Consequence's favour.

**Status: explicitly a working hypothesis, not yet written into
`clarifier.ts`'s method-selection logic, and not confirmed against the
actual documentation (no textual support was found connecting voice
choice to this specific fact-vs-preference distinction - this is a
genuine synthesis from this session's discussion, not a rediscovered
documented rule).** To be used until a real test case breaks it, per
explicit agreement, then revised.

---

## 60. Two real UI visibility gaps closed - Clarifier surfaced, Auditor staleness explained

Following section 58's finding that Clarifier's question/answer was entirely
invisible on the actual rendered page, and that Auditor's output could
visibly contradict Landscape's own resolved facts once Clarifier
successfully narrowed something Auditor had flagged, both were fixed and
confirmed working via direct screenshot.

**A significant process note, worth flagging on its own:** while
investigating this, it was discovered that the local reference copies of
`structuredReport.ts`, `WorkspaceReportView.tsx`, `eventHorizons.ts`, and
`landscape.ts` were all meaningfully out of date relative to the real,
live repo - missing fields and functions that had genuinely been added
over past sessions. Proceeding on the stale copies would have produced
incorrect instructions. **Standing practice going forward, worth treating
as firm: before editing any file that has been touched across multiple
past sessions, ask for its current real content rather than trust a
locally-held copy, especially for files central to rendering or type
definitions.**

### Clarifier surfaced in the live report

Added `StructuredClarifier` type (question, answerOptions, selectedAnswer,
effect) to `structuredReport.ts`, mapped from real `context.clarifier` /
`context.clarifierResponse`. Added a corresponding `ClarifierSection` to
`WorkspaceReportView.tsx`, rendered between the Reasoning Panel and
Auditor sections, showing the real question, all options with the
actually-selected one visually highlighted, and the genuine computed
effect. **Confirmed rendering correctly via screenshot.**

### Auditor staleness explained rather than architecturally fixed

Rather than re-running Auditor after Clarifier resolves something (which
would reopen the deliberately-deferred "selective panel re-evaluation"
question from section 55), a one-line honest caption was added directly
beneath the Auditor section whenever a clarifier exists: *"this
assessment reflects the decision as it stood before the clarifying
question below was answered."* This turns a visible, unexplained
contradiction into something that makes sense once the full sequence is
visible - solves the immediate user-facing confusion without reopening
the bigger architectural decision. **Confirmed rendering correctly via
screenshot.**

---

## 61. Landscape - taught to apply general product-pricing knowledge, with a real calibration correction along the way

A genuine architectural question was raised: should the system be able to
independently infer that a stated price looks unusual for a named
product (the way Auditor once spontaneously, correctly flagged a Lexus
hybrid reliability concern), rather than relying on the below-market
signal being hand-authored into a test fixture (as Bravia's
`pricePosition: "materially_below_expected_market"` always was)?
**Resolved: yes** - `LANDSCAPE_V1_SYSTEM_PROMPT` was given explicit
permission to apply general knowledge of typical pricing for specific,
identifiable products, clearly labelled as a reasoned estimate rather
than a verified fact, and only when real confidence exists (not for
generic or unfamiliar items).

### A real, generalisable calibration error found and fixed on first test

The first test produced an unwanted side effect: Landscape expressed
doubt about whether "Sony Bravia 9 II" was a real product at all,
displacing the actual pricing question. Confirmed via direct web search
that the product is real and correctly priced by Landscape's own
estimate (~£3,000-£3,500) - the doubt was unwarranted. **Root cause,
worth recording as a general lesson, not a one-off:** specificity had
been treated as a risk signal rather than evidence of realism. A name
closely matching a real product line's naming convention is MORE likely
to be genuine, not less - a fabricated name would more plausibly be
vague or generic. Fixed with an explicit instruction: treat close,
well-formed matches (even with a plausible minor discrepancy, like a
likely typo in a model number) as a near-match to assume and move past,
not a reason to doubt existence - reserve genuine doubt for names that
don't resemble any real pattern at all. **Confirmed fixed on retest** -
product existence was accepted without hesitation, and Reframer
correctly escalated to `PREREQUISITE_REQUIRED` based on the now-properly-
surfaced pricing anomaly, with Clarifier correctly asking about seller
channel (the one fact that genuinely could not be inferred) rather than
repeating a now-redundant "is this a discount" question.

### A related Clarifier fix: redundant answer options

Noted directly: two generated options ("cannot verify who is selling
it" and "not sure") were functional duplicates. Added an explicit
self-check to `clarifier.ts`: before finalising, check every pair of
options against each other, and merge any that would lead to the same
semantic effect - "Not sure" is generally the better, plainer version
to retain.

### Full-chain validation of the alternate (private-seller) branch

Using the real, corrected pipeline, the private-seller branch of the
Bravia scenario was run in full (forcing the clarifier selection via a
test route, since no real UI exists yet to collect this) and confirmed
to produce genuinely differentiated reasoning throughout, not a merely
darker copy of the retailer branch: Landscape V2 introduced a materially
new remaining uncertainty ("whether the unit is stolen, counterfeit, or
otherwise problematic") that never existed in the retailer branch; Paths
renamed itself to reflect the specific channel; Establishing Shot
correctly avoided stating the risk directly while still obliquely
gesturing at it (an unopened, unneeded "stapled receipt and a scrawled
phone number"); Steelman's case for buying explicitly named forgoing
retailer protections as a real, load-bearing condition rather than
glossing over it. This is the clearest demonstration to date of the full
pipeline (Reframer through Steelman) reasoning as one coherent system
around a single resolved fact, rather than eight independently-plausible
components.

---

## 62. Event Horizon - now real, built from Chapter 16 and confirmed via frozen-context testing

`app/engine/eventHorizons.ts` converted from a `DecisionKind`-branching
fixture to a real component, built directly from a fresh full re-read of
Chapter 16. Outputs trigger, label, explanation, `irreversibleAfter[]`,
and `transition` (a semantic "X to Y" change in the nature of the
decision, not merely the mechanical action) - the type already supported
these fields (`irreversibleAfter`, `transition`), they were simply never
populated by the old fixture.

**Directly incorporates the section-29 correction from weeks earlier:**
explicitly checks whether a genuine, formal reversal right exists for
this specific decision (a statutory cooling-off period, a return policy)
- if yes, the horizon is losing that right; if no (the common case for
private sales and most life decisions), the horizon is the moment of
commitment itself, since even a later-reversed consequence (e.g.
reselling an asset) never undoes the fact that the commitment was made.

### Honest assessment of the component's actual value, discussed directly before building

Agreed directly: Event Horizon's value is real but narrower than its
name suggests. For the user, it mainly earns its place in cases where
the reversal structure is genuinely non-obvious (exactly the private-
seller-vs-retailer case tested here) rather than adding insight into the
decision itself. Architecturally, its primary designed purpose - a clean
handoff point to Navigator - is currently unrealised, since Navigator
does not yet exist. **Not treated as a reason to deprioritise it, but
worth recording as an honest, calibrated expectation rather than
overstating its current impact.**

### A real bug found via testing methodology, not a logic error

Two initial test attempts used independent, freshly-generated full-chain
re-runs for the retailer vs. private-seller comparison, exactly the
confound already identified and fixed for Clarifier in section 55 - both
attempts produced answers to a DIFFERENT clarifying question each time
(screen size, not seller channel), invalidating the comparison entirely
without the mistake being obvious at first glance. **Fixed by building
frozen fixtures directly from two already-validated real outputs**
(`braviaRetailerFrozenContext`, `braviaPrivateSellerFrozenContext`),
holding everything constant except the one fact under test. **Worth
restating as a firm, recurring lesson: the frozen-context testing
discipline established for Clarifier applies to every component's
prompt testing, not just Clarifier's - any time two runs are being
compared to isolate one variable, freeze everything else first.**

### Confirmed working, cleanly differentiated result

Retailer branch: correctly identified the return window's expiry as the
real horizon, explicitly reasoning that payment alone is only
"provisionally reversible" until that window lapses. Private-seller
branch: correctly identified payment and handover itself as the horizon,
explicitly reasoning through the absence of any statutory or retailer
protection. Two genuinely differentiated, well-reasoned outputs from
identical inputs bar one fact - confirms the component works as
intended.

---

## 63. Updated implementation status

As of this update, real (not fixture) components in the live Bravia
pipeline: Reframer, Landscape (V1/V2), Guardian, Pragmatist, Empathiser,
Auditor, Clarifier, Clarifier Response, Representative Paths,
Establishing Shots, Steelman, and now Event Horizon. **No components in
the live Bravia pipeline remain fixture.** Navigator remains unbuilt
(explicitly out of scope until the decision-formation pipeline is fully
real, which it now is) and the custom-decision path, Singapore, and
Portfolio slices remain untouched and still fixture, as previously
recorded.

**Still an acknowledged, real limitation:** Clarifier's "selected answer"
in the live pipeline is a placeholder (auto-picks the first non-"Not
sure" option) rather than a genuine user selection, since no interactive
UI exists yet to collect one. The mockups from section 58 remain
designs, not implementation.

---

## 64. The Bravia pipeline split into two real phases - the Clarifier UI is now genuinely functional

`runBraviaSlice()` was split into `runBraviaSlicePhase1()` (Reframer through
generating the real clarifying question) and `runBraviaSlicePhase2()`
(Clarifier Response through the final report), since a single unbroken
server call cannot pause for a genuine human answer. Two API routes now
exist: `/api/run-bravia` (Phase 1, returns the intermediate context plus
the question) and `/api/run-bravia/resume` (Phase 2, takes that context
back plus the real selected answer, returns the finished report).
`page.tsx` was rewritten to orchestrate this properly - calling Phase 1,
rendering a real, clickable question card (`ClarifierWaitingCard`) with
the actual generated options, then calling `resume` with whichever option
was clicked and rendering the final report once it returns.

**Confirmed working end-to-end via direct testing**, including the exact
private-vs-authorised-retailer branch tested manually days earlier now
reachable through a genuine click rather than a forced test route. This
replaces the temporary auto-selected placeholder (section 60/63) with a
real user choice for the first time.

### A genuine bug found and fixed as a direct result of the split, unrelated to the UI work itself

While restructuring the two phases, it was discovered that Auditor and
Clarifier previously ran in the SAME parallel branch off IDENTICAL
pre-Auditor context (`Promise.all` for both the Auditor branch and the
Paths/Clarifier branch) - meaning **Clarifier in the live pipeline had
never actually seen real Auditor output**, despite `clarifier.ts`'s own
prompt explicitly treating Auditor's `blockingUncertainties` as its
primary source of candidates. It had been silently falling back to
Landscape's remaining uncertainties alone on every live run since
Clarifier went real. **Fixed by making the ordering strictly sequential
where it matters:** Auditor now genuinely completes before Clarifier
runs, at a small, deliberate cost to overall parallelism, in exchange for
Clarifier finally working as documented. Confirmed working correctly in
the live pipeline afterward (real Clarifier questions now correctly
reference genuine Auditor-flagged uncertainties, e.g. seller-channel
questions grounded in Auditor's actual blocking list).

### Ripple fixes required by the split (same pattern as every prior real-component conversion)

`runBraviaNavigatorSlice.ts` and the standalone CLI script `run.ts` both
called the old single-shot `runBraviaSlice()` - both updated to call
Phase 1 then Phase 2 in sequence with the existing placeholder-selection
logic, since neither has any way to collect a genuine answer either.

### A repeated process lesson from this session, worth restating plainly

Several local reference copies of files central to today's work
(`structuredReport.ts`, `WorkspaceReportView.tsx`, `page.tsx`,
`landscape.ts`) were found stale relative to the real, live repo more than
once. **Standing practice, now reinforced by repeated direct evidence:
always ask for a file's current real content before editing it, rather
than trust a locally-held copy - this is not a one-off caution, it
recurred multiple times in a single session.**

---

## 65. Two precision fixes confirmed via direct retest

**Removed a stale, overriding hardcoded fixture fact.** Bravia's initial
context still set `assumedForSlice.pricePosition:
"materially_below_expected_market"` - a leftover from before real
Landscape existed, and it was silently forcing Reframer's escalation to
`PREREQUISITE_REQUIRED` before Landscape's own, more nuanced reasoning
ever got a chance to run. Removed entirely. **Confirmed on retest:**
Reframer now correctly returns `PASS` when Landscape's real reasoning
judges the price merely "plausible but on the low end," and correctly
still escalates to `PREREQUISITE_REQUIRED` when Landscape's real
reasoning independently derives a genuinely material anomaly - the
escalation decision is now driven by real reasoning, not a hardcoded
assumption from weeks before real pricing-inference existed.

**Fixed an overclaiming pattern in Clarifier Response.** A real generated
effect claimed that confirming a private-seller channel "explains the
below-market price" - it does not; it only explains the absence of
retailer protections, while the actual reason for the low price remains
a separate, genuinely open question (correctly still listed in the same
report's own `remaining` uncertainties, an internal contradiction worth
catching). Fixed with an explicit instruction distinguishing "makes X
plausible/consistent" from "actually resolves X," with a worked example
using this exact case. **Confirmed on retest**, including correctly
handling a genuine "Not sure" answer with properly hedged, non-overclaiming
language.

---

## 66. Reframer's PASS state - confirmed correct via direct chapter reading, and a real UI rule established

A concern was raised that Reframer's `PASS` output looks thin -
essentially restating the prompt with no visible added value - using the
Bravia case as an example, and comparing it against a richer-sounding
reframe generated by a different LLM.

**Resolved via direct reading of Chapter 7 (not from memory):** the
chapter explicitly states Reframer "deliberately performs no evaluation.
It determines WHAT should be analysed. It does not determine HOW it
should be analysed." Both the user's proposed reframes and the external
LLM's example ("are there better alternatives at this price," "should
peripherals be considered") are questions about HOW to evaluate the
decision, not WHAT the decision is - by the chapter's own explicit
division of labour, that is Landscape's and Paths' job. Confirmed
directly that the real, current Bravia Landscape output already
independently surfaces exactly this alternatives question as a genuine,
earned uncertainty on its own - the concern was valid, but the gap (if
any) belongs to a different, already-functioning component, not
Reframer.

**A real, generalisable UI rule established as a result, worth applying
across the whole "what's seen vs hidden" question, not just Reframer:**
Reframer's PASS state means, by its own documented definition, "nothing
needed to be caught, no problem existed" - showing it to a user risks
implying something meaningful happened when nothing did. **Default
visibility for any component should track whether it changed or caught
something, not merely whether it ran.** Reframer's other four states
(CLARIFY, SUGGEST_REFRAME, PREREQUISITE_REQUIRED, ROUTE_TO_NAVIGATOR) are
all genuinely meaningful and worth surfacing; PASS should likely be
hidden by default. Not yet implemented - recorded for the deferred UI
visibility session.

---

## 67. A genuinely difficult, realistic messy-prompt test - and a major reliability fix for SUGGEST_REFRAME

A deliberately constructed, realistic 100-word rambling prompt (framed as
tension between personal ambition and a relationship, heavy with
emotional venting and self-judgment, explicitly confirmed as a fully
fictional test case, not a real personal situation) was run against real
Reframer specifically to stress-test its documented core purpose
(separating symptom from decision) for the first time with genuinely
messy input, rather than the clean single-sentence prompts used in every
prior test.

**Result: a strong, clean pass.** Reframer correctly extracted the real
underlying decision (pursue the ambition vs. scale back for the
relationship) while discarding all the surrounding emotional narrative,
and correctly judged it as one decision (`PASS`), not two bundled ones -
despite surface language ("should I dial it back," "should I stop
pretending") that could have misled a less disciplined system into
treating this as multiple decisions or drifting into melodrama.

### SUGGEST_REFRAME fired for the first time in this project's history - but inconsistently

Five repeated runs on the identical prompt produced `SUGGEST_REFRAME`
only once, with the other four returning `PASS`. Directly investigated
rather than dismissed as expected rarity (the earlier, days-old
conclusion that "SUGGEST_REFRAME is genuinely rare" was based on it
never firing across dozens of clean-prompt tests - an absence of
evidence, not evidence of absence).

**When it did fire, the content was genuinely excellent** - correctly
identifying that the prompt's own framing asserted a false binary
("scale back or pursue and risk the relationship") and suggesting the
real question might be "how to openly negotiate a shared path
accommodating both," rather than accepting the self-imposed either/or.

### A user-proposed trigger mechanism tested against real evidence and found not to hold, with a better one derived in its place

Proposed hypothesis: SUGGEST_REFRAME should correlate with how much a
decision will need Clarifier's help later (fewer clarifying facts needed
-> less need to reframe). **Tested directly against existing data and
found to point the opposite direction from the evidence:** Lexus needs
extensive factual clarification (inspection, service history, seller)
and has never once produced SUGGEST_REFRAME across dozens of runs; the
messy relationship prompt needs almost no factual clarification (it's
almost entirely a values question) and is the one case that did produce
it.

**The actual distinguishing feature, derived by direct comparison of the
two cases:** not "how much clarification will be needed," but **whether
the prompt's own wording asserts an explicit binary/either-or framing** -
Lexus and Bravia's prompts are neutral ("should I buy X"), with no
self-imposed dichotomy to challenge; the messy prompt explicitly built
its own false binary ("dial it back... or... stop pretending").

**Root cause of the inconsistency, once investigated:** the existing
prompt's only worked example for SUGGEST_REFRAME was the generic
"narrow item vs. broader budget" pattern - the exact template already
identified and rejected earlier the same day as too generic and
ungrounded (the "should you consider peripherals instead" pattern). The
prompt had never been given the actual mechanism that produces good
reframes (false-dichotomy detection), only a different, weaker one -
explaining why it fired unreliably.

**Fixed with an explicit, concrete, labelled mechanism** (check for a
self-asserted either/or in the prompt's own wording; if present, ask
whether a broader, non-binary option is plausible; explicit instruction
NOT to default to the generic budget-reframe pattern; explicit
permission to lean toward surfacing this readily, since it costs the
user nothing to see and reject). **Confirmed fixed via five further
repeated runs on identical input: 5 of 5 correctly and consistently
produced SUGGEST_REFRAME**, with genuinely varied wording each time, all
correctly targeting the real false dichotomy rather than drifting toward
the generic rejected pattern.

**This is now the second confirmed instance of the same general lesson**
(the first being Clarifier's formal/informal mechanism fix): an abstract
"don't do X" instruction can lose reliably against a strong underlying
pull in the model; naming the actual mechanism concretely, with a real
worked example, and explicitly naming the wrong pattern to avoid, wins
cleanly where the abstract version did not. Worth treating this as a
general technique to reach for whenever an instruction is holding
inconsistently, not just fixing each recurrence as a one-off.

**Also confirmed directly from the chapter text:** "whenever ambiguity
exists, it should be exposed rather than hidden... the Reframer should
not silently guess" - providing real textual support for the "fire more
liberally, since it's advisory-only" philosophy that motivated this
whole investigation.

---

## 68. Agreed next steps, explicitly deferred rather than started

**A dedicated "voices" implementation session** - Feynman Isolation and
Human Consequence were designed and extensively tested in isolation
(section 59) but never actually wired into `clarifier.ts`'s real prompt;
the current live Clarifier only uses the seven abstract methods with no
style guidance at all. Agreed to implement and test one component's voice
work fully before moving to the next, rather than a scattered pass across
several - and to first take a fuller inventory of which components have
dedicated voice documents in `Docs/Presentation_docs/` before starting,
given how many gaps this session alone surfaced between what's designed
and what's actually wired.

**Perceived performance / progressive reveal** - raised directly: this
will be used on mobile, and waiting through an opaque, multi-step
reasoning chain is a real concern. Agreed that the underlying wall-clock
time is a genuine, structural cost of doing real sequential reasoning
(today's own Auditor-before-Clarifier fix is a direct example of
correctness being deliberately chosen over raw speed) and won't
disappear - but that progressive, step-by-step reveal of each component's
result as it completes (rather than one opaque wait per phase), plus
specific rather than generic loading text, are genuine, buildable
improvements to perceived speed, not yet implemented.

---

## 69. Genuine multi-round Clarifier support - built, and a chain of real bugs found and fixed along the way

### Correction to last session's write-up

Section 68 recorded the Feynman/Human Consequence voice work as "not yet
wired" - this was wrong. Direct inspection of the live `clarifier.ts`
showed the full voice-selection logic (fact/probability vs. ungroundable
preference, both Feynman moves, Human Consequence's core shape, the
show-don't-tell fix) was already present and complete, evidently folded
in during an earlier combined-fix pass without being tracked. **Confirmed
working correctly via direct testing this session** on a genuine
Human-Consequence-shaped question (third-child desire) - worth recording
the correction plainly rather than let the wrong status stand.

### Multi-round architecture built

- `DecisionContext["clarifier"]` widened to make every field except
  `hasQuestion: boolean` optional, allowing an honest `{ hasQuestion:
  false }` response when no further question is warranted, rather than
  forcing a question to exist.
- `clarifier()` now accepts an `isFollowUpRound` flag; when true, the
  prompt applies a stricter self-check and explicitly permits declining
  to ask further.
- `landscape()` generalised to always narrow from the MOST RECENT state
  (`v2` if it already exists from an earlier round, otherwise `v1`)
  rather than always restarting from `v1` and discarding prior
  narrowing - `v1` itself is preserved unchanged as the original
  baseline; `v2` always holds the current, most-narrowed state
  regardless of how many rounds produced it.
- A new `rerunPanelAndAuditor()` helper re-runs Guardian, Pragmatist, and
  Empathiser (in parallel) followed by Auditor, intended to run after
  each answered round before a follow-up Clarifier call.

### The scope decision this required, made deliberately rather than by default

Building this forced a real decision on the "selective panel
re-evaluation" question deferred since section 55: **the full panel
(Guardian, Pragmatist, Empathiser) now re-runs alongside Auditor between
rounds, not just Auditor alone.** Reasoned through directly: a resolved
answer (e.g. "no, I don't want this") should meaningfully change
Guardian's concerns, Pragmatist's requirements, and Empathiser's framing,
not just Auditor's readiness assessment - leaving the other three stale
would reproduce the same kind of internal contradiction already found
and fixed elsewhere (Auditor reflecting new information, other output
still reflecting old). Chapter 14's own explicit list (only Landscape/
uncertainties/Auditor/Paths) is treated as superseded by this decision,
consistent with how the broadband-test evidence already overrode it once
before.

### A significant methodological near-miss, caught mid-session

An early multi-round test used a hand-typed answer
("no, it feels driven mainly by outside expectations or pressure")
instead of one of Clarifier's own actual generated `answerOptions`. This
produced a misleading result (Landscape appeared to over-interpret a
generic "no" into a specific causal narrative) that was nearly
diagnosed as a real bug before being caught - the actual generated
options never contained that specific phrase. **Standing lesson: always
verify a test answer is one of the real, generated `answerOptions`
values, never a plausible-sounding hand-typed substitute** - the same
category of rigor as the "test with a frozen context, not a fresh
re-run" lesson from the Clarifier work weeks earlier.

### Four real bugs found and fixed through repeated, disciplined retesting

1. **Landscape silently assuming a partner exists.** A prompt written in
   the first person singular ("should I have a third child") had its
   `resolvedUncertainties` silently include "implying two existing
   children and prior parenting experience" - manufacturing a two-parent
   household from nothing. Fixed with an explicit instruction never to
   assume a partner/co-decision-maker unless the prompt states or clearly
   implies one; unresolved partner-status is now correctly a
   `remainingUncertainty`.

2. **Landscape/Pragmatist silently assuming the decision-maker's own
   biological role.** Requirements like "confirmed physical capacity to
   conceive and carry a pregnancy" were phrased generically ("the
   parent(s)") in a way that glossed over whose body the requirement
   actually applied to - itself unestablished by the bare prompt. Fixed
   with an explicit instruction treating this as its own genuine
   `remainingUncertainty`, the same category of gap as unconfirmed
   partner-existence, never defaulted or phrased around.

3. **Auditor's blockingUncertainties not prioritised correctly.** For a
   first-person-singular decision, Auditor was listing another person's
   view (a partner's) ahead of the decision-maker's own stance, even
   though the latter is normally the more foundational, sequencing-
   relevant uncertainty (many other questions become moot depending on
   it). Fixed with an explicit ordering instruction; confirmed Clarifier
   subsequently respects Auditor's stated priority rather than
   re-deriving its own competing view of what's structurally important
   (a second, related fix - Clarifier was independently overriding
   Auditor's ordering with its own reasoning about what "must" be
   resolved first).

4. **Auditor failing to check its own output against Landscape's
   already-resolved facts.** After a round-one answer was correctly
   resolved into Landscape's `resolvedUncertainties`, a freshly re-run
   Auditor still listed the same fact as a top blockingUncertainty -
   re-deriving it fresh from Guardian/Pragmatist/Empathiser's individual
   (not-yet-updated) framing rather than checking whether Landscape had
   already settled it. Fixed with an explicit cross-check instruction.
   Confirmed working: Auditor now correctly excludes resolved facts from
   blocking/missing lists, while still honestly flagging
   `internalConsistency: INCONSISTENT` when it notices individual lenses
   still silently resting on assumptions Landscape has since resolved -
   a subtle, correct distinction between "this is still blocking" and
   "this reasoning hasn't fully caught up yet," both real and both worth
   surfacing differently.

5. **Clarifier repeating the same underlying question in a follow-up
   round**, even when correctly identifying that the same target
   genuinely still needed firming up (e.g. a vague "something feels
   missing" answer). The follow-up round re-asked an almost identical
   Human Consequence scenario, reworded, rather than probing a genuinely
   different angle (e.g. what specifically feels missing). Fixed with an
   explicit instruction: a follow-up round on the same target must use a
   genuinely different angle or method, never restate the same scenario
   - and must return `hasQuestion: false` if no genuinely distinct angle
   exists, rather than manufacturing a cosmetic reword.

### Confirmed working end-to-end after all four fixes

A final test run produced a genuinely well-formed two-round sequence:
round one (Human Consequence, probing genuine desire, correctly using
`REDUCED` rather than a false `RESOLVED` for an ambivalent answer), round
two (correctly pivoting to the distinct, previously-flagged biological-
role uncertainty, correctly using plain CONFIRMATION rather than either
voice since it's a fact question) - no repetition, correct voice
selection throughout, correct priority ordering, correct handling of
partial/ambiguous resolution.

### Current status

This is built and validated via direct test routes only - **not yet
wired into the live Bravia pipeline or `page.tsx`'s UI.** The live
product still runs a single Clarifier round. Wiring multi-round support
into the actual user-facing flow (showing a second question card if one
is generated, with a hard cap of 2 rounds per the standing design
principle) remains the next concrete step before this reaches real
users.

### Deferred: a genuine real-world test case, deliberately held back

A real (not test-fixture) three-way espresso machine purchase comparison
(Londinium Vectis vs. Bezzera Strega vs. Quick Mill Rapida) was proposed
as the next strong test case once the above work is complete - chosen
because it is a genuine three-way NAMED comparison (never tested; every
prior test has been binary or budget-allocation), involves niche/
specialist products (untested territory for Landscape's knowledge-
confidence calibration), and is a real decision with real stakes, unlike
every fixture used so far. Deliberately NOT run yet, given today's two
outstanding gaps (now the live-wiring gap specifically, following this
session's fixes) - agreed to hold it until the pipeline is in a state
worth trusting for something that actually matters.

---

## 70. Multi-round Clarifier wired into the live pipeline, tested end-to-end through the real browser flow

`rerunPanelAndAuditor()` (built but never actually exercised in section 69)
is now genuinely used: `runBraviaSlicePhase2` uses it as intended, and the
whole architecture was wired through three real routes
(`/api/run-bravia`, `/api/run-bravia/resume`, a new
`/api/run-bravia/resume2`) and `page.tsx`, replacing every remaining
placeholder auto-selection with genuine user clicks.

### A real, serious bug found and fixed live in the browser

The first end-to-end test produced a runaway loop - six consecutive
clarifying questions in a single page load, all variants of the same
underlying pricing uncertainty, when the design explicitly caps this at
two rounds. **Root cause: `page.tsx` had no concept of "which round am I
on"** - `selectClarifierAnswer` always posted to `/api/run-bravia/resume`
(Phase 2 logic) regardless of round, so a round-2 answer would trigger
another full Phase 2 pass (re-run panel, re-run Auditor, ask Clarifier
again with `isFollowUpRound: true`) instead of routing to Phase 3, which
is the only phase designed to always finish. Since Auditor's own
imperfect resolution of a pricing question could plausibly keep
re-triggering a "not quite settled" follow-up, this had no natural
ceiling. **Fixed by adding explicit round-tracking state to
`braviaPending`** (`round: 1 | 2`), with `selectClarifierAnswer` routing
to `resume` only for round 1 and unconditionally to `resume2` (which
always finishes) for round 2 - restoring the intended hard cap.

**Confirmed fixed and the full architecture validated end-to-end**: two
genuinely distinct clarifying questions appeared in sequence with real
waits between them, both correctly answerable via click, producing a
final report that reasons coherently across both rounds with no
contradictions, no repetition, and no further questions beyond the
second.

### Smaller UX fix made alongside

`ClarifierWaitingCard` gave no visual feedback that a click had
registered before the (multi-second) wait began. Fixed: selecting an
option now immediately highlights it, dims and disables the other
options to prevent a stray double-click mid-wait, and shows a small
"Thinking this through…" note.

---

## 71. A major, previously-undetected data-loss problem found and fixed: full reasoning history is now preserved and viewable

Reviewing a complete real run via screenshots (not just JSON) surfaced a
significant gap: **the polished report only ever shows the LATEST
Clarifier question and answer** - `clarifierResponse` was being
overwritten each round, meaning round one's actual question and the
user's actual answer to it were completely and permanently gone from
what a user could ever see or what any test/audit could recover, once a
second round completed. Auditor's own "missing information" panel in
the same report still implicitly referenced context from the vanished
first round, with nothing shown explaining why.

**Fixed by adding `clarifierHistory` to `DecisionContext`** - an array
that accumulates every round's question, answer options, selected
answer, effect, and resolution state, appended to (not overwritten) at
each `runBraviaSlicePhase2`/`Phase3` call. **Confirmed working** - a full
two-round test correctly showed both rounds' complete Q&A in order.

### A new, separate, deliberately-scoped "full reasoning" view built

Rather than complicate the existing polished `WorkspaceReportView`, a
new, separate `FullReasoningView` component was built - a plain,
organised (not stylised) dump of every real reasoning step in true
execution order: Reframer, Landscape V1, the initial Guardian/
Pragmatist/Empathiser pass, Auditor, the complete Clarifier history
(all rounds), Landscape V2, Representative Paths with their Establishing
Shots and Steelman cases, and Event Horizon. A toggle button
("Show full reasoning (every step)") switches between this and the
polished report. This required also returning the full, raw
`DecisionContext` (`fullContext`) from both resume routes, not just the
polished `StructuredReport`, since the full view needs data the polished
report deliberately never surfaces (decision axes, the initial Landscape
pass, the initial panel pass, etc.).

**Explicitly deferred, not decided:** whether any of this should be
shown to a real user by default, versus hidden behind a toggle or
omitted entirely, remains part of the still-open "what's seen vs
hidden" conversation. The purpose of this work was narrower and
concrete: ensure a complete, honest, non-lossy record of every real
reasoning step exists and can be inspected, independent of what a future
default-visibility decision settles on - you cannot make a good decision
about what to hide if the underlying information has already been
silently destroyed.

### A known, explicitly accepted limitation, and a stated future design goal

**Current limitation:** the "Guardian / Pragmatist / Empathiser" section
of the full reasoning view only shows their LATEST state (after the most
recent re-run), not their state before a clarifying answer changed it -
unlike Clarifier, which now correctly preserves full history. Section
labels were corrected to be honest about this (e.g. "shown here is the
LATEST pass, after clarifying answer(s)" rather than a misleading
"(initial pass)" label found and corrected during review - the same
review also correctly caught Auditor's section being mislabelled
"(final pass)" when, depending on the run, it may only ever have run
once, or may itself be a re-run rather than an initial pass).

**Stated design goal, explicitly recorded now even though not built:**
the long-term target is not just showing latest-state snapshots, but a
genuine **before / after / differential** view for every component whose
output changes as a result of a clarifying answer - not just Clarifier's
own question-and-answer history, but what specifically changed in
Guardian's, Pragmatist's, Empathiser's, and Auditor's actual reasoning
as a direct result of each answer. This is a larger piece of work than
today's fix and was deliberately not attempted this session, but is
recorded here as the intended direction for whenever the full-reasoning
transparency work is next picked up.

---

## 72. A content-quality observation, flagged but not yet investigated

While reviewing the same full test run, Empathiser's output for the
Bravia scenario was noted as reading somewhat presumptuous about the
user's psychology - "the buyer's confident assertion that their use case
'genuinely' needs flagship performance may reflect a personal need for
self-justification, easing residual guilt... about spending £2,000 on a
want that could be framed as excess." This resembles the same
speculative-psychoanalysis pattern already identified and rejected in
the Clarifier voice work days earlier (the "who benefits, who quietly
pays the price" style questions). **Not yet investigated or fixed** -
worth checking whether Empathiser's prompt has a similar over-reach
tendency the next time that component is revisited.

---

## 73. Milestone: a genuine real-world decision run end-to-end, the strongest single result the project has produced

The multi-round architecture (sections 69-70) was generalised beyond
Bravia and pointed at a real, live decision the user was actually facing
- not a constructed test fixture. `runBraviaSlicePhase1()` was made to
accept an optional starting context (defaulting to the existing Bravia
context for every prior caller, so nothing already working changed), and
a parallel set of routes (`/api/run-espresso` and its `resume`/`resume2`
pair) and a new `page.tsx` tile were added, reusing every already-built
component unchanged.

**The real prompt:** *"I've got a Sage DTP but I want a lever machine and
I can't decide between the Londinium Vectis, the Bezzera Strega and the
Quick Mill Rapida - which one should I buy?"* Deliberately harder than
any prior test in three specific ways, chosen precisely because none had
been tried: a genuine three-way NAMED comparison (every previous test was
binary or budget-allocation), no stated budget at all, and genuinely
niche/specialist products (untested territory for Landscape's
knowledge-confidence calibration).

### A real, useful gap found before the test even properly began

The first clarifying question offered four options (thermal stability,
ease of use, footprint/aesthetics, brand support) - none of which
actually matched the user's genuine answer ("upgrade my existing setup to
improve my coffee"), forcing a "closest fit" pick instead. **Identified as
a real, generalisable design gap**: the radio-button design has an
escape hatch for genuine uncertainty ("Not sure") but none for "my honest
answer doesn't fit any offered category." Proceeded pragmatically with
the closest-fit pick, explicitly flagged as an imperfect proxy.

**The system's own handling of this imperfect input turned out to be a
significant, unprompted validation:** `clarifierResponse` correctly
returned `resolutionState: "REPLACED"` rather than falsely accepting the
answer as resolving the original question, with an honest effect
description stating the priority "doesn't map onto any of the three
targeted attributes... introduces forgiving/ease-of-use as the actual
decision-driving quality... previously unscoped attribute." The
following Clarifier round correctly rebuilt its options around what had
actually been revealed, rather than repeating the original ill-fitting
frame. This is real evidence the architecture has a genuine safety net
against a real, unplanned failure mode, not just against the specific
cases it was deliberately tested against.

### Full results, reviewed via the FullReasoningView (not raw JSON, given its length)

**Reframer, Landscape, and the panel handled the novel three-way,
no-budget, niche-product shape without any new prompt fixes required** -
correctly recognised as one decision (not split), correctly avoided
inventing a budget or specific prices, correctly reasoned about genuine
uncertainty (`evidenceStrength: LOW`, `readinessState: RED`) rather than
either false confidence or an unhelpfully generic response.

**Two clarifying rounds, well-sequenced and causally connected, not
independent facts:** round one resolved a real budget ceiling (~£1,500-
£2,500). Round two - a clean Feynman Isolation move ("setting aside your
design preferences for a moment, have you owned a lever machine
before?") - revealed the user is a first-time lever buyer, which then
correctly reshaped Landscape's own framing toward favouring
"forgiving, PID-assisted options over fully manual ones requiring
existing skill."

**Representative Paths correctly produced a genuine three-way
comparison** (Path A: Vectis, Path B: Strega, Path C: Rapida) - the
first true multi-way named comparison this project has ever tested,
confirmed as legitimate under the existing no-invention rule (these are
options the user themselves named, not invented alternatives).

**Steelman built three genuinely distinct, non-arbitrary cases directly
from a real tension Empathiser had already identified** (wanting
hands-on mastery vs. needing forgiveness as a beginner) - Vectis for
someone who wants the demanding, authentic manual experience; Strega for
craft with a safety net; Rapida for long-term durability/support over
either. This is the "shared concern, different lens" discipline
(originally tuned into Guardian/Pragmatist/Empathiser weeks earlier)
holding correctly across three paths, not just two.

**Establishing Shots passed every rule established across the entire,
lengthy Establishing Shot tuning arc** - in-motion openings, the
object/decision genuinely receded into the background (an unanswered
phone message, unopened post, the Sage DTP now dark/unplugged), no
invented bias between paths, and - worth noting specifically - no
recurrence of the internal-sensation stock-phrase problem (each path
used a distinct physical technique: forearm tension, a phone's glow, a
kettle ticking, rather than three variations of "something settles in
your chest").

**Event Horizon correctly reasoned through private-purchase logic** with
no formal return right assumed, correct "evaluation to ownership"
transition.

**One small, already-known limitation recurred as expected, not a new
finding:** Auditor's `assumptions` retained a stale note about a budget
range "assumed... without landscape confirmation" from before round one
resolved it - the same latest-snapshot-only limitation already
documented in section 71.

### Significance

This is treated as the strongest single validation of the architecture
produced to date - not because it is flawless, but because it is the
first time a genuinely novel, real, unplanned decision (not constructed
to exercise a specific rule) was run through the complete real pipeline
end to end and held together coherently, including surfacing and
honestly handling its own imperfect input along the way.

---

## 74. A major design conversation, prompted directly by the espresso machine milestone - all design, nothing built yet

The strength of section 73's result immediately surfaced a real,
previously unexamined architectural gap: the current pipeline has no
defence against a genuinely large number of named alternatives (the
motivating real example: seven used luxury car models the user was
actually considering, sourced from a prior ChatGPT conversation). This
section records a substantial design conversation that followed,
resolved through direct back-and-forth rather than settled in one pass -
several early proposals were tested against the user's real example and
found wanting before the final shape emerged. **None of this is
implemented in code. All of it is design, deliberately captured now so
it is not lost, to be built or revisited later.**

### The core problem: Representative Paths currently conflates two different jobs

Representative Paths was found to be doing both SHORTLISTING (which of
many named options are even worth deep consideration) and DEEP
DEVELOPMENT (Establishing Shot, Steelman, Event Horizon per path) in a
single step. This works at N=2-3, where deep-developing everything is
cheap and where weeks of hard-won fairness/anti-bias/anti-mirroring work
(the entire Establishing Shot tuning arc, section 47-54) was tuned and
validated. It was never tested, and there is no reason to assume it
would hold, at N=5-7 - and deep-developing seven named options is both
expensive and poor UX regardless.

### An initial proposed fix (extending Rule 4) was tested honestly against real data and found insufficient

First proposal: extend Rule 4 (no manufactured spectrum, section 31) from
operating only "within one option" to operating across whole named
alternatives - collapsing options that represent the same underlying
STRATEGY (e.g. two ultra-formal JDM flagship sedans) while keeping
options that represent genuinely different strategies (sporty vs.
formal vs. understated) as separate paths.

**Tested directly and honestly against the user's real seven-car list**
(Lexus GS450, Jaguar XJ, Infiniti Q70, Toyota Century, Honda Legend,
Toyota Crown Majesta, Lexus LS460) rather than assumed to work. Result:
only 2 of the 7 (Century and Crown Majesta) genuinely collapse under
this test - the rest represent real, distinct strategic choices. **The
rule, honestly applied, does not reduce most large real lists down to
2-3 at all** - this was an important, deliberately-not-glossed-over
finding, since a weaker version of this project might have quietly
declared the rule sufficient without checking it against real data.

### The real, load-bearing constraint that reframed the whole conversation: Navigator cannot receive multiple live candidates

Navigator's entire documented purpose (its own two large, as-yet-unused
voice documents, noted in section 68's inventory) is post-decision
EXECUTION support for a single, already-chosen path. If a user could
reach Navigator while still holding 4-5 live candidates, that is proof
the decision was never actually finished, not a case for Navigator to
handle multiple options. **This settled that genuine triage/narrowing
must complete as its own distinct step, fully separate from and prior
to Representative Paths, not as a stronger version of an existing rule.**

### The two-tier triage design that emerged

**Tier 1 - revealed-preference gut-check (the default first move):**
Grounded directly in this project's own founding premise (people usually
already know their real answer) and confirmed live, in this very
conversation, when the user was asked to consider their own real
7-car list and immediately named a real 1-2 car preference without any
elimination process at all. The correct first move for genuine triage is
therefore a single, well-formed revealed-preference question in the
Feynman/Human Consequence tradition (worked example, independently
proposed by the user without invoking either label by name: "if all
seven were in a showroom, which would you go and look at first?") -
NOT a flat "which do you prefer" stated-preference question, and NOT a
default assumption that elimination-by-category is always required.

**Tier 2 - category-elimination (fallback only, for the genuine minority
who don't already have a clear lean):** Feynman-style dealbreaker
questions designed to eliminate multiple candidates AT ONCE where
possible (e.g. "would you accept an import with no verifiable service
history?" eliminates an entire category in one answer, not one
candidate at a time) - a genuinely different Clarifier objective
function than its normal one (find the single most valuable fact about
one already-framed decision); triage-mode Clarifier should instead
optimise for "the single question that eliminates the most currently-
live candidates at once."

### The stopping condition for triage - deliberately NOT open-ended

A core, explicit product principle was stated directly and treated as
non-negotiable: **"we are specifically designing an anti-LLM process...
we aren't the talk-to-me-forever app, we're the 'you are going to take
some responsibility for your decisions' app."** Endless, open-ended
clarification is treated as a direct violation of the project's purpose,
not a quality worth maximising.

Resolved design: triage's stopping condition is a STRUCTURAL COUNT, not
a re-use of Auditor's existing confidence-based `readinessScore` (which
answers a different question - "do we have enough evidence about an
already-framed decision" - not "how many live candidates remain").
Triage's own readiness is: **has the count of genuinely distinct, still-
live named candidates been reduced to 2, through real elimination (not
arbitrary truncation)?** Backstopped by a hard round-cap regardless of
whether the count target is reached, so the system is guaranteed to stop
and proceed with whatever currently exists rather than continue
indefinitely - honestly stating what remains unresolved rather than
pretending completeness.

**Directly confirmed as aligned with original project intent, not just a
new idea:** independent re-reading of Chapter 12 found "high readiness
suggests presentation may proceed" as Auditor's own documented purpose -
matching the user's own recollection from the original ChatGPT-era
design conversations that this was always the reason `readinessScore`
was built. Genuine agreement between primary source and independent
recollection, not another instance requiring the source-verification
scepticism recorded in section 56.

### The decline path - resolved as a standing option, not a triage target

"Don't buy any of them" is explicitly NOT one of the candidates triage
eliminates - it is structurally always available (subject to Reframer's
own judgment about whether a specific prompt's framing has genuinely
foreclosed it - see the SUGGEST_REFRAME connection below), independent
of how many named alternatives exist or how triage narrows them.
**Resolved target: triage narrows named alternatives to exactly 2, with
decline added afterward as a free third slot** - deliberately fitting
`PathId`'s existing, real, hard `"A" | "B" | "C"` type ceiling (section
55) without needing to widen it. Explicitly NOT a confidence hedge (a
weak third option added because the reasoning behind the top two might
not feel bulletproof) - if the reasoning is genuinely strong, two
well-evidenced finalists plus the always-available decline option is
the correct, sufficient result; a hedge option undermines rather than
reinforces confidence in the result.

**Left genuinely open, not resolved:** whether the target should
sometimes be 3 named finalists (not 2) when Reframer's own reading of a
prompt has firmly foreclosed decline as a real option (e.g. "I've
decided to become a pilot" vs. "which pilot school should I attend") -
versus always reserving a decline slot as the simpler, safer default
even when it turns out unused. Recorded as an open question.

### A second concrete example surfaced for the standing SUGGEST_REFRAME investigation

"I want a lever machine, which one?" was identified as potentially the
same false-binary pattern that made SUGGEST_REFRAME fire reliably for
the first time (section 67, the "scale back or pursue and risk the
relationship" case) - a stated intention that may be silently
foreclosing a real "don't get one at all" option, the same way "I want
a third child" framings were examined in earlier sessions. Explicitly
NOT resolved either way - genuinely uncertain whether "I want X" is firm
enough to correctly treat as settled (closer to "I've decided to become
a pilot") or should be tested for the same false-binary pattern. Worth
testing directly whenever this work is picked up.

### Whether this generalises beyond shopping

Directly considered and concluded: the real trigger condition is not
"shopping" as a category, but **"the person arrives already holding a
pre-researched shortlist of more than 2-3 named options"** - common in
shopping (especially after a prior LLM conversation, exactly matching
how the user's own real 7-car list originated), but not exclusive to it;
the same shape could arise with job offers, cities, schools, or any
other prompt presenting several named alternatives at once.

---

## 75. A significant reframing of the project's own purpose - worth returning to repeatedly, not just a one-off insight

In the course of the triage discussion, the user articulated something
treated as significant enough to record as its own standing reference
point, not folded into the technical design notes above.

**The core statement, in the user's own words: "give me a reason to do
the thing I know needs to be done anyway"** - proceeding from the
observation, confirmed live in this very conversation (the user named
their real preference among 7 cars instantly, unprompted, matching the
project's own founding "recognition, not search" premise), that most
people facing a decision already have a strong lean, and that the actual
barrier is rarely information - it is the ability to justify having
acted on that lean, to themselves or to others, with real, defensible
reasoning rather than "I just felt like it."

**Reframing, arrived at jointly and explicitly endorsed as accurate,
not overstated:** this project may be better described as a PERMISSION
MACHINE than a decision machine. Its function is not primarily to tell
someone what to decide (most people, most of the time, do not need
this) - it is to earn, or honestly withhold, the right to act on a
decision already leaning strongly one way, by subjecting it to real,
undodgeable scrutiny (Guardian's protected values, Pragmatist's
requirements, Auditor's honest readiness assessment, Steelman building
the actual case) rather than either rubber-stamping the existing lean or
second-guessing it into paralysis.

**Explicitly stated as NOT changing what any component does** - Guardian,
Pragmatist, Empathiser, Auditor, Steelman all continue doing exactly
what they have always done. What changes is the accuracy of the stated
reason WHY each of them matters: the entire architecture's
"validate-or-reject honestly, never simply flatter" discipline (built
and defended repeatedly throughout this project, e.g. section on
avoiding sycophancy, the repeated refusal to let any lens become a
rubber stamp) is precisely what stops this reframing from collapsing
into "just tell people what they want to hear" - without those
safeguards, a permission machine would be indistinguishable from
flattery, which is the one outcome the whole project has consistently
built against.

**Origin connection, volunteered directly and worth preserving as real
project history:** this entire architecture traces back to the user
manually running an equivalent process by hand, months before any of
this code existed - independently having three different AIs (this
model, ChatGPT, Gemini) each draft a full investment portfolio for a
genuine, six-figure family financial decision, then have each blindly
rate and re-rate the others' work, rewriting identified deficiencies,
until the surviving result could withstand scrutiny from every angle.
The stated reason: needing to be able to justify to himself, whatever
the eventual outcome, that the best or least-worst decision had genuinely
been made. **Decision Workspace is, in effect, an attempt to make that
same manual, effortful cross-examination process repeatable, faster,
and available for decisions far smaller than six figures** - the
underlying human need it answers (being able to say "I did this
properly, whatever happens next") does not only appear at high stakes,
it is simply quieter at low ones.

**Status: recorded as a standing reference point for this project, worth
returning to when future design decisions are unclear - not a
one-off insight to file away and forget.**
