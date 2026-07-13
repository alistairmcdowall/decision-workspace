# Decision Workspace Schema

Canonical snapshot after the production-build fix commit.

This file describes the current implemented data model and rendering contract for Decision Workspace. If older Docs conflict with this file, this file should be treated as the working schema unless the code has moved on. If this file conflicts with the current TypeScript types, the TypeScript types and a green `npm run build` are the source of truth.

---

## 1. Project shape

Decision Workspace is a Next.js / TypeScript decision modelling app.

Current implemented app flow:

```text
User input / selected slice
→ DecisionContext
→ eventHorizons(context)
→ buildStructuredReport(context)
→ WorkspaceReportView
```

Main files:

```text
app/page.tsx
app/ui/WorkspaceReportView.tsx
app/engine/types.ts
app/engine/runCustomDecisionSlice.ts
app/engine/runBraviaSlice.ts
app/engine/runBraviaNavigatorSlice.ts
app/engine/runSingaporeSlice.ts
app/engine/runPortfolioSlice.ts
app/engine/eventHorizons.ts
app/engine/presentation/structuredReport.ts
app/engine/presentation/guidedRenderer.ts
app/engine/presentation/CleanRenderer.ts
lib/decisionengine.ts
```

Important casing:

```text
app/engine/presentation
```

The presentation folder is lowercase. This matters for Linux/Vercel builds.

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

---

## 3. Money amount

```ts
type MoneyAmount = {
  amount: number;
  currency: "GBP" | "USD" | "EUR" | "SGD";
};
```

Current app mostly uses GBP, but the wider currency type is retained for future relocation/international cases.

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

This is the headline identity of the decision.

Example:

```ts
decision: {
  subject: "a used Lexus GS",
  kind: "PURCHASE",
  price: {
    amount: 6500,
    currency: "GBP",
  },
}
```

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

  representativePaths: RepresentativePath[];

  eventHorizon?: EventHorizon;

  establishingShots?: EstablishingShot[];

  steelman?: SteelmanCase[];

  presentation?: PresentationState;

  navigator?: NavigatorState;

  diagnostics?: DiagnosticRecommendation[];
};
```

---

## 7. Facts

### `facts.userStated`

Captures facts explicitly extracted from the prompt or selected slice.

```ts
userStated: {
  subject: string;
  price?: MoneyAmount;
}
```

`price` is optional because relocation, portfolio, and general decisions may not have a direct purchase price.

### `facts.assumedForSlice`

Slice assumptions or custom-input metadata.

```ts
assumedForSlice: {
  marketClass?: string;
  pricePosition?: string;
  source?: string;
  kind?: DecisionKind;
}
```

Examples:

```ts
assumedForSlice: {
  marketClass: "investment_strategy",
  pricePosition: "long_term_growth_decision",
}
```

```ts
assumedForSlice: {
  source: "custom_decision_input",
  kind: "PURCHASE",
}
```

---

## 8. Landscape

Landscape captures the state of the decision after reframing/narrowing.

### `landscape.v1`

```ts
type LandscapeV1 = {
  subject: string;
  commitment: string;
  decisionAxes: string[];
  resolvedUncertainties: string[];
  remainingUncertainties: string[];
  state: "BROAD";
};
```

### `landscape.v2`

```ts
type LandscapeV2 = {
  subject: string;
  commitment: string;
  decisionAxes: string[];
  resolvedUncertainties: string[];
  remainingUncertainties: string[];
  state: "NARROWED";
};
```

Current custom decisions generally populate `v2`.

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
    currency: "GBP";
  };
  outcome: string;
};
```

Purpose: show distinct live options, not recommendations.

Example:

```ts
{
  id: "A",
  title: "Buy a used Lexus GS",
  requiredConditions: [
    "The price is fair for the condition and market.",
    "The seller and history checks do not reveal major concerns.",
    "The downside is acceptable if the purchase proves disappointing."
  ],
  commitment: {
    type: "purchase",
    amount: 0,
    currency: "GBP"
  },
  outcome: "You commit to buying a used Lexus GS."
}
```

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

Purpose: identify the point where the decision becomes materially harder to reverse.

Examples by kind:

| Kind | Event horizon |
|---|---|
| `PURCHASE` | payment / binding purchase commitment |
| `RELOCATION` | lease, school, job, visa, or household move commitment |
| `PORTFOLIO` | large trades placed / allocation materially changed |
| `GENERAL` | explicit irreversible commitment |

`eventHorizons(context)` enriches or normalises the event horizon.

---

## 11. Establishing shots

```ts
type EstablishingShot = {
  pathId: PathId;
  title?: string;
  shot: string;
};
```

Purpose: make each path feel concrete before evaluation.

Example:

```ts
{
  pathId: "A",
  title: "The purchase becomes ordinary",
  shot: "You are using the thing you bought on an ordinary day..."
}
```

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

Purpose: give the strongest fair case for each path.

Example:

```ts
{
  pathId: "B",
  objective: "Preserve flexibility",
  case: "The strongest case for not buying is that an attractive purchase can become a bad decision if verification is weak.",
  supportingConditions: [
    "Verification remains incomplete",
    "Condition or history is uncertain",
    "Price advantage is unclear"
  ]
}
```

---

## 13. Diagnostics

Diagnostics are evidence recommendations attached to uncertainty.

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

Current implementation is still decision-kind driven, but the intended direction is uncertainty-class driven.

Current examples:

| Decision kind | Diagnostic examples |
|---|---|
| `PURCHASE` | market price comparison, seller check, condition/history check, reversibility/warranty check |
| `RELOCATION` | employment dependency check, housing route check, schooling/family adaptation, exit route |
| `PORTFOLIO` | rolling-period stress test, drawdown tolerance check, allocation concentration check, wrapper/tax sequencing |
| `GENERAL` | reversibility check, downside check, dependency check |

Target future architecture:

```text
DecisionContext
→ unresolved uncertainties
→ uncertainty classes
→ diagnostic recommendations
→ evidence layer
```

Example uncertainty classes:

```text
price_value
counterparty_risk
condition_quality
reversibility
sequence_risk
volatility_tolerance
cashflow_sustainability
logistical_feasibility
legal_constraint
household_adaptation
dependency_risk
opportunity_cost
implementation_complexity
```

---

## 14. Navigator

Navigator is execution-mode support. It does not reopen the decision; it manages implementation of a selected path.

```ts
navigator?: {
  pathSelected: string;
  status: string;
  scale?: string;
  summary?: string;
  sections?: unknown[];
  pauseBeforeProceedingIf?: string[];
  nextAction?: string;
};
```

Current known use:

```text
Bravia + Navigator slice
```

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

Used to frame the report in natural language.

Example:

```ts
presentation: {
  decisionStateSummary:
    "The question is no longer whether growth is the objective. It is what kind of growth path is most suitable.",
  decisionTurn:
    "The decision now turns on risk tolerance, behavioural sustainability and implementation detail."
}
```

---

## 16. Structured report

`app/engine/presentation/structuredReport.ts` converts `DecisionContext` into the browser-facing shape.

Current output includes:

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

Main browser component:

```text
app/ui/WorkspaceReportView.tsx
```

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

The report UI should be driven by structured fields, not markdown parsing.

---

## 18. Implemented slices

### Bravia purchase

```text
app/engine/runBraviaSlice.ts
```

Fixed purchase slice.

### Bravia Navigator

```text
app/engine/runBraviaNavigatorSlice.ts
```

Execution-mode slice with Navigator.

### Singapore relocation

```text
app/engine/runSingaporeSlice.ts
```

Fixed relocation slice.

### Retirement portfolio

```text
app/engine/runPortfolioSlice.ts
```

Fixed portfolio slice.

### Custom decision

```text
app/engine/runCustomDecisionSlice.ts
```

Deterministic custom-input slice.

Current custom flow:

```text
input prompt
→ classify DecisionKind
→ extract subject
→ extract price / time horizon
→ build resolved uncertainties
→ build remaining uncertainties
→ build representative paths
→ build establishing shots
→ build steelman cases
→ add diagnostics
→ apply event horizon
→ return DecisionContext
```

Example prompts:

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

Current known fixed issues:

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
lib/decisionengine clarifiers aligned with Clarifier type
accidental Docs/Components/DecisionReport.tsx moved out of build path
```

---

## 20. Git rules

Do not use:

```bat
git add .
```

Docs changes may intentionally remain unstaged.

Use targeted adds.

Example:

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

## 21. Current doctrine

The repo is the source of truth.

The chat is not the source of truth.

Before changing code:

```text
inspect actual file
make one small edit
run build or relevant test
commit only targeted files
leave Docs noise alone unless explicitly instructed
```
