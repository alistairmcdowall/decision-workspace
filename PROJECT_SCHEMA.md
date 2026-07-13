# Decision Workspace Schema

Canonical snapshot after the production-build fix commit, corrected against a
line-by-line read of the live `app/engine` code.

This file describes the current implemented data model and rendering contract
for Decision Workspace. If older Docs conflict with this file, this file
should be treated as the working schema unless the code has moved on. If this
file conflicts with the current TypeScript types, the TypeScript types and a
green `npm run build` are the source of truth.

Standing decisions for this version:

- `app/engine` wins over `lib/decisionengine.ts`.
- A green build wins over `DECISION_WORKSPACE_CONSTITUTION.md`.
- `lib/decisionengine.ts` is legacy/dead code unless explicitly revived.
- No LLM wiring exists yet, anywhere.
- No code changes until this schema is agreed.

---

## 1. Project shape

Decision Workspace is a Next.js / TypeScript decision modelling app.

**There is no single implemented app flow.** Three different patterns
currently coexist under `app/engine`, and which one runs depends on which
slice is selected.

### Pattern A - full pipeline (used by exactly one slice: Bravia)

```text
reframer(context)
-> landscape(context)          [v1]
-> guardian(context)
-> pragmatist(context)
-> empathiser(context)
-> auditor(context)
-> clarifier(context)
-> landscape(context)          [v2, re-run after clarifier response]
-> paths(context)
-> eventHorizons(context)
-> establishingShots(context)
-> steelman(context)
-> buildStructuredReport(context)
-> WorkspaceReportView
```

Used only by `runBraviaSlice.ts` (and `runBraviaNavigatorSlice.ts`, which
wraps it and adds a `navigator` field).

### Pattern B - hand-authored fixture, no shared functions

```text
DecisionContext literal, built by hand
(panel: {}, landscape: { v2 } only, eventHorizon set directly)
-> buildStructuredReport(context)
-> WorkspaceReportView
```

Used by `runSingaporeSlice.ts` and `runPortfolioSlice.ts`. Neither calls
`reframer`, `landscape`, `guardian`, `pragmatist`, `empathiser`, `auditor`,
`clarifier`, `paths`, or `eventHorizons`. The `panel` field is an empty
object, so these two slices currently render **no** Guardian, Pragmatist,
Empathiser, or Auditor content in the UI.

### Pattern C - deterministic classifier + local templates

```text
input prompt
-> classify DecisionKind (regex/keyword match: PURCHASE/RELOCATION/PORTFOLIO/GENERAL)
-> extract subject, price, time horizon
-> build resolved/remaining uncertainties (local template logic)
-> build representative paths (local template logic)
-> build establishing shots (local template logic)
-> build steelman cases (local template logic)
-> add diagnostics (local template logic)
-> eventHorizons(context)        [the one shared function this pattern uses]
-> buildStructuredReport(context)
-> WorkspaceReportView
```

Used by `runCustomDecisionSlice.ts` - the only slice that accepts arbitrary
user input rather than a fixed prompt.

**Practical consequence:** the individual files under `app/engine`
(`guardian.ts`, `pragmatist.ts`, `empathiser.ts`, `auditor.ts`, `clarifier.ts`,
`landscape.ts`, `paths.ts`, `establishingShots.ts`, `steelman.ts`,
`reframer.ts`) are laid out like reusable components but are currently
**single-use fixtures**: each one ignores its `context` argument and returns
hardcoded Sony Bravia text regardless of what decision is passed in. E.g.
`landscape.ts` always returns `subject: "Sony Bravia 9 II purchase"`. This is
why Patterns B and C don't call them - doing so would inject Bravia-specific
text into an unrelated decision.

**The one exception:** `eventHorizons.ts` genuinely branches on
`context.decision.kind` (PURCHASE / RELOCATION / PORTFOLIO / fallback) and
produces kind-appropriate output. It's the only component in the engine that
behaves like a real, reusable function today. If/when the other components
are generalised, this is the pattern to follow.

Main files:

```text
app/page.tsx
app/ui/WorkspaceReportView.tsx
app/engine/types.ts
app/engine/reframer.ts            (Pattern A only - hardcoded fixture)
app/engine/landscape.ts           (Pattern A only - hardcoded fixture)
app/engine/guardian.ts            (Pattern A only - hardcoded fixture)
app/engine/pragmatist.ts          (Pattern A only - hardcoded fixture)
app/engine/empathiser.ts          (Pattern A only - hardcoded fixture)
app/engine/auditor.ts             (Pattern A only - hardcoded fixture)
app/engine/clarifier.ts           (Pattern A only - hardcoded fixture)
app/engine/paths.ts               (Pattern A only - hardcoded fixture)
app/engine/establishingShots.ts   (Pattern A only - hardcoded fixture)
app/engine/steelman.ts            (Pattern A only - hardcoded fixture)
app/engine/eventHorizons.ts       (shared, genuinely DecisionKind-aware)
app/engine/runCustomDecisionSlice.ts
app/engine/runBraviaSlice.ts
app/engine/runBraviaNavigatorSlice.ts
app/engine/runSingaporeSlice.ts
app/engine/runPortfolioSlice.ts
app/engine/presentation/structuredReport.ts
app/engine/presentation/guidedRenderer.ts
app/engine/presentation/CleanRenderer.ts
```

**Not a main file:** `lib/decisionengine.ts` exists in the repo but is
imported nowhere. See section 22.

Important casing:

```text
app/engine/presentation
```

The presentation folder is lowercase. This matters for Linux/Vercel builds.
This has been fixed and is confirmed consistent in git-tracked paths as of
the last pack.

---

## 2. Decision kinds

```ts
type DecisionKind =
  | "PURCHASE"
  | "RELOCATION"
  | "PORTFOLIO"
  | "GENERAL";
```

| Kind | Used for |
|---|---|
| `PURCHASE` | Buying a thing, vehicle, equipment, product, asset |
| `RELOCATION` | Moving country/city/home or major household relocation |
| `PORTFOLIO` | Investment allocation or retirement portfolio decisions |
| `GENERAL` | Fallback for decisions that do not classify cleanly |

Confirmed exact match to `types.ts`.

---

## 3. Money amount

```ts
type MoneyAmount = {
  amount: number;
  currency: "GBP" | "USD" | "EUR" | "SGD";
};
```

Confirmed exact match to `types.ts`. This is the type that was previously
duplicated with a conflicting `"GBP"`-only definition (fixed - see section
21). Current app mostly uses GBP; the wider currency type is retained for
future relocation/international cases, but note `RepresentativePath.commitment.currency`
(section 9) is separately typed as the literal `"GBP"` only, not this wider
union - that's a real, current inconsistency in `types.ts` itself, not a
schema error. Worth deciding whether that's intentional.

---

## 4. Decision core

```ts
type DecisionCore = {
  subject: string;
  kind: DecisionKind;
  commitment?: string;
  price?: MoneyAmount;
};
```

Confirmed exact match to `types.ts`.

---

## 5. Path IDs

```ts
type PathId = "A" | "B" | "C";
```

Two-path decisions usually use:

```text
A = act / proceed
B = do not act / preserve current path
```

Three-path decisions usually use:

```text
A = higher growth / higher commitment
B = balanced / simpler
C = cautious / lower risk
```

No slice currently uses a third path (`C`) in practice - all five
implemented slices are two-path. `C` exists in the type but is unexercised.

---

## 6. DecisionContext

`DecisionContext` is the canonical engine-side decision object.

```ts
type DecisionContext = {
  prompt: string;
  decision: DecisionCore;

  facts: {
    userStated: {
      subject: string;
      price?: MoneyAmount;
    };
    assumedForSlice: {
      marketClass?: string;
      pricePosition?: string;
      source?: string;
      kind?: DecisionKind;
    };
  };

  reframer?: ReframerState;

  landscape?: {
    v1?: LandscapeV1;
    v2?: LandscapeV2;
  };

  panel: PanelState;

  auditor?: AuditorState;

  clarifier?: ClarifierState;
  clarifierResponse?: { answer: string; effect: string };

  representativePaths?: RepresentativePath[];   // optional - see correction below

  eventHorizon?: EventHorizon;

  establishingShots?: EstablishingShot[];

  steelman?: SteelmanCase[];

  presentation?: PresentationState;

  navigator?: NavigatorState;

  diagnostics?: DiagnosticRecommendation[];

  finalOutput?: string;
};
```

**Correction from prior version:** `representativePaths` is optional
(`?`) in `types.ts`, not required. `clarifier` and `clarifierResponse` were
missing from the prior version of this schema entirely - added here.

### `PanelState` (previously undefined in this doc)

```ts
panel: {
  guardian?: { protectedValue: string; concern: string }[];
  pragmatist?: { requirement: string }[];
  empathiser?: { humanFactor: string }[];
};
```

Note: no `auditor` field inside `panel` - Auditor has its own top-level
`auditor?` field on `DecisionContext`, sibling to `panel`, not nested inside
it.

---

## 7. Facts

Unchanged from prior version - confirmed exact match to `types.ts`.

```ts
userStated: {
  subject: string;
  price?: MoneyAmount;
}

assumedForSlice: {
  marketClass?: string;
  pricePosition?: string;
  source?: string;
  kind?: DecisionKind;
}
```

---

## 8. Landscape

```ts
type LandscapeV1 = {
  subject: string;
  commitment: string;
  decisionAxes: string[];
  resolvedUncertainties: string[];
  remainingUncertainties: string[];
  state: "BROAD";
};

type LandscapeV2 = {
  subject: string;
  commitment: string;
  decisionAxes: string[];
  resolvedUncertainties: string[];
  remainingUncertainties: string[];
  state: "NARROWED";
};
```

Confirmed exact match to `types.ts`. Note per section 1: only the Bravia
slice populates both `v1` and `v2` via the shared `landscape.ts` function
(itself hardcoded). Singapore and Portfolio slices populate `v2` only, by
hand, with no `v1` ever produced. Custom decision slice populates `v2` only,
built by local template logic.

---

## 9. Representative paths

```ts
type RepresentativePath = {
  id: PathId;
  title: string;
  requiredConditions: string[];
  commitment: {
    type: string;
    amount: number;
    currency: "GBP";        // literal GBP only - not the wider MoneyAmount union
  };
  outcome: string;
};
```

Purpose: show distinct live options, not recommendations.

---

## 10. Event horizon

```ts
type EventHorizon = {
  trigger: string;
  label?: string;
  explanation?: string;
  irreversibleAfter?: string[];
  transition?: string;
};
```

`eventHorizons(context)` is the one genuinely generic, `DecisionKind`-driven
component in the engine (see section 1). It branches on `PURCHASE` /
`RELOCATION` / `PORTFOLIO` / fallback and returns kind-appropriate content.
Used by the custom-decision slice for all inputs; used by Bravia via the
shared pipeline; **not used** by Singapore or Portfolio, which set
`eventHorizon` directly by hand instead (their hand-set values happen to
match what the function would produce, but that's not enforced or tested).

---

## 11. Establishing shots

```ts
type EstablishingShot = {
  pathId: PathId;
  title?: string;
  shot: string;
};
```

`establishingShots.ts` is a Bravia-only fixture (section 1). Singapore and
Portfolio slices hand-author their own establishing shots inline. Custom
decision slice builds them via local template logic keyed on `DecisionKind`.

---

## 12. Steelman cases

```ts
type SteelmanCase = {
  pathId: PathId;
  objective: string;
  case: string;
  supportingConditions: string[];
};
```

Same pattern as section 11 - `steelman.ts` is Bravia-only; other slices
either hand-author or use local templates.

---

## 13. Diagnostics

```ts
type DiagnosticStatus = "available" | "manual" | "future";

type DiagnosticRecommendation = {
  id: string;
  name: string;
  uncertaintyClass: string;
  reason: string;
  inputsNeeded: string[];
  status: DiagnosticStatus;
};
```

Current implementation is decision-kind driven (in `runCustomDecisionSlice.ts`
only); the intended direction is uncertainty-class driven. Not yet built.

Target future architecture:

```text
DecisionContext
-> unresolved uncertainties
-> uncertainty classes
-> diagnostic recommendations
-> evidence layer
```

---

## 14. Navigator

```ts
navigator?: {
  pathSelected: string;
  status: string;
  scale: "CHECKLIST" | "IMPLEMENTATION_PLAN" | "PROGRAMME_MAP";  // required, strict literal
  summary: string;                                                // required
  sections: { title: string; items: string[] }[];                 // required, typed
  pauseBeforeProceedingIf?: string[];
  nextAction?: string;
};
```

**Correction from prior version:** `scale`, `summary`, and `sections` are
required in `types.ts`, not optional. `scale` is a strict three-value union,
not a free string. `sections` is a typed array (`{ title, items }[]`), not
`unknown[]`.

Currently used only by `runBraviaNavigatorSlice.ts`, which wraps
`runBraviaSlice()` and adds this field on top.

Mode distinction:

| Mode | Meaning |
|---|---|
| Exploration | Compare and understand possible paths |
| Execution | A path has been selected; Navigator supports implementation |

---

## 15. Presentation metadata

```ts
presentation?: {
  decisionStateSummary?: string;
  decisionTurn?: string;
};
```

Confirmed exact match to `types.ts`.

---

## 16. Structured report

`app/engine/presentation/structuredReport.ts` converts `DecisionContext` into
the browser-facing shape. Not independently re-verified line-by-line in this
pass - carried forward from prior schema version pending direct review.

```ts
type StructuredReport = {
  title: string;
  prompt: string;
  mode: "exploration" | "execution";
  decisionKind: DecisionKind | "GENERAL";
  selectedPath?: string;
  executionStatus?: string;

  decisionFrame: {
    subject: string;
    commitment?: string;
    summary?: string;
    decisionTurn?: string;
  };

  resolvedUncertainties: string[];
  remainingUncertainties: string[];

  paths: StructuredPath[];

  eventHorizon?: StructuredEventHorizon;

  diagnostics: StructuredDiagnostic[];

  navigator?: StructuredNavigator;

  closingNote: string;
};
```

The UI should consume `StructuredReport`, not parse markdown.

---

## 17. Browser UI contract

```text
app/ui/WorkspaceReportView.tsx
```

Not independently re-verified line-by-line in this pass - carried forward
pending direct review.

Expected rendered sections:

```text
Decision frame
Workspace summary strip
Execution state strip, if execution mode
Resolved uncertainties
Remaining blockers / uncertainties
Representative paths
Event horizon
Evidence layer / recommended diagnostics
Navigator panel, if execution mode
Closing note
Structured JSON debug toggle
```

---

## 18. Implemented slices - corrected status

| Slice | Pattern | Panel populated? | v1 landscape? | Uses shared eventHorizons()? |
|---|---|---|---|---|
| `runBraviaSlice.ts` | A (full pipeline) | Yes (Guardian, Pragmatist, Empathiser, Auditor all run) | Yes | Yes |
| `runBraviaNavigatorSlice.ts` | A + Navigator wrapper | Yes (inherited) | Yes (inherited) | Yes (inherited) |
| `runSingaporeSlice.ts` | B (hand fixture) | No - `panel: {}` | No | No - set by hand |
| `runPortfolioSlice.ts` | B (hand fixture) | No - `panel: {}` | No | No - set by hand |
| `runCustomDecisionSlice.ts` | C (classifier + templates) | Not populated (no panel logic in this pattern) | No | Yes |

Example prompts for the custom-decision slice:

```text
Should I buy a used Lexus GS for £6,500?
Should we move to Singapore for Vera's job?
How should I invest my retirement portfolio for the next 10 years?
```

---

## 19. Build expectations

Production build must remain green:

```bat
npm run build
```

Known fixed issues (carried forward, confirmed):

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

**Removed from this list:** "lib/decisionengine clarifiers aligned with
Clarifier type." That file is not imported anywhere in the codebase (confirmed
by full-repo grep). Whatever alignment work happened there did not wire it
into the app. See section 22.

---

## 20. Git rules

Do not use:

```bat
git add .
```

Docs changes may intentionally remain unstaged. Use targeted adds.

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

---

## 21. Currency type history

`MoneyAmount` was previously declared twice in `types.ts` with conflicting
shapes (one four-currency, one GBP-only), which produced a hard
`TS2300: Duplicate identifier` build error. Fixed by keeping the four-currency
definition and removing the duplicate. Confirmed resolved - only one
declaration exists now.

---

## 22. `lib/decisionengine.ts` and the Constitution - status, not resolution

`lib/decisionengine.ts` (396 lines) exists in the repo but is imported by
nothing - confirmed by a full-repo grep for its filename and its exported
symbols. It is not part of the running app in any way.

Its shape is not arbitrary: it closely mirrors
`DECISION_WORKSPACE_CONSTITUTION.md` - a `JudgeOutput` type with exactly
`Guardian`, `Pragmatist`, `Auditor`, `Reframer` (no Empathiser, Reframer
treated as a judge rather than a pre-panel stage), a `comparison: { agreement,
tension, uncertainty }` field matching the Constitution's "Comparison Layer,"
and a flat `summary -> clarifiers -> analysis -> comparison` flow matching the
Constitution's Decision Flow exactly.

The live `app/engine` code has diverged from this: it has four different
judges (Guardian, Pragmatist, **Empathiser**, Auditor, with Reframer as a
separate pre-panel stage), no Comparison Layer anywhere, and a much longer
pipeline (Landscape v1/v2, Representative Paths, Event Horizon, Establishing
Shots, Steelman) that the Constitution doesn't mention at all.

Per standing decision at the top of this file: `app/engine` wins, and
`lib/decisionengine.ts` is legacy/dead code. This section exists so that fact
is visible in the schema itself rather than only in chat history. **This is a
status note, not a design decision** - whether to delete
`lib/decisionengine.ts`, revive it, or fold the Comparison Layer concept into
`app/engine` (e.g. as new Auditor output) is still open and unresolved.

---

## 23. What isn't built yet, stated plainly

- No LLM or reasoning-model call exists anywhere in the codebase. Every
  component that looks like reasoning (`guardian.ts`, `pragmatist.ts`,
  `empathiser.ts`, `auditor.ts`, `clarifier.ts`, `reframer.ts`) returns fixed
  text regardless of input. `package.json` has no AI SDK dependency.
- Of the five reasoning/judge components, only `eventHorizons.ts` actually
  branches on decision content (`DecisionKind`). The rest are single-scenario
  fixtures dressed as modular components.
- Two of five slices (Singapore, Portfolio) don't exercise the panel at all -
  in the live UI today, selecting either of those shows no Guardian,
  Pragmatist, Empathiser, or Auditor output.
- No diagnostic recommendation is uncertainty-class driven yet, despite that
  being the stated target architecture (section 13).
- `lib/decisionengine.ts` / Constitution reconciliation is unresolved
  (section 22).