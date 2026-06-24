# Decision Workspace: Architectural Discoveries

This document records architectural discoveries that emerged through testing.

These are not feature ideas.

They are lessons that survived contact with implementation and should be considered before future architecture changes.

---

## Discovery 1: The Interaction Loop Matters More Than Additional Intelligence

The first major milestone was proving:

User Prompt

↓

First-pass Output

↓

Clarifier

↓

User Answer

↓

Reasoning Changes

↓

Output Changes

This loop is currently considered more important than adding additional judges, templates or UI complexity.

---

## Discovery 2: The Architecture Generalises

Portfolio and Property tests demonstrated that:

- Guardian travels

- Pragmatist travels

- Auditor travels

- Reframer travels

- Comparison layer travels

- Clarifier philosophy travels

The architecture appears more general than the individual decision domains.

---

## Discovery 3: Templates Are Not The Product

The project originally appeared to move toward:

Decision

↓

Classify

↓

Template

↓

Output

Testing increasingly suggested:

Decision

↓

Judges

↓

Comparison

↓

Clarifiers

↓

Recommendation

The judge system appears to be the product.

Templates are scaffolding.

---

## Discovery 4: Prefer Revealed Preference Over Stated Preference

Strong clarifiers do not ask:

"What is your risk tolerance?"

They ask:

"If £500k fell to £350k, would you stay invested?"

Strong clarifiers:

- present a plausible future reality

- force a meaningful trade-off

- ask what the user would actually do

Behaviour is often more informative than self-description.

---

## Discovery 5: Show, Don't Tell

Decision Workspace should prefer:

- consequences

- trade-offs

- alternative futures

- ranges of outcomes

over asserting recommendations.

The goal is to make the decision visible rather than win the argument.

---

## Discovery 6: Decision Landscape May Be The Next Missing Layer

Both portfolio and property testing exposed the same pattern:

The system naturally tries to discuss:

- Option A

- Option B

- Option C

and their consequences.

The Summary section is currently overloaded because there is no dedicated place for this information.

Potential future layer:

Decision Landscape

Alternative Futures

↓

Consequences

↓

Recommendation

---

## Discovery 7: Hardcoded Domains Do Not Scale

Portfolio and Property tests worked because reasoning was manually authored.

The Redundancy test exposed a limitation:

Adding new domains indefinitely leads back toward a template system.

Future direction is likely:

Decision

↓

Dynamic Judge Reasoning

↓

Comparison

↓

Clarifiers

rather than increasing numbers of hardcoded decision types.

---

## Discovery 8: Do Not Build The Final Intelligence Yet

A recurring project principle:

Prove the loop first.

Do not prematurely optimise:

- judge generation

- confidence scoring

- domain packs

- complex recommendation engines

The current objective is proving that reasoning visibly changes when meaningful new information arrives.