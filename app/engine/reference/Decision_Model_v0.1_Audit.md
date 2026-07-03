# Decision Model v0.1 Normalisation Audit

Reference specimen:
Decision_Model_v0.1_Bravia.json

## Audit Questions

For every field ask:

1. Does this represent meaning, or language?
2. Is this concept atomic, or are multiple concepts hidden together?
3. Is this the canonical place for this information?
4. Could two Presentation Engines produce materially different prose from this field without inventing reasoning?

## Audit Table

| Field | Status | Issue | Proposed v0.2 Treatment |
|---|---|---|---|
| prompt | KEEP | Raw user input; canonical source of original decision request. | No change. |
| facts | REVIEW | Uses prose sentences rather than structured assertions. | Convert to atomic fact objects. |
| panel.guardian | KEEP | Structured protected value + concern pairs. | No change. |
| panel.pragmatist | KEEP | Requirements are represented as atomic execution constraints. | No change. |
| panel.empathiser | KEEP | Human factors are represented as atomic semantic concepts. | No change. |
| reframer | KEEP | Produces structured reasoning outcome (status, governing objective, route, reason). The "reason" should remain under review in future versions to ensure it represents semantic justification rather than polished prose. | No change for v0.1. Review "reason" during future normalisation. |
| landscape.v1 | KEEP | Represents the initial decision structure rather than narrative. Fields are atomic and semantically meaningful. | No change. |
| landscape.v2 | KEEP | Correctly represents the evolved decision structure after clarification without duplicating v1 semantics. | No change. |
| auditor | NORMALISE | Several fields are semantic (assumptions, missingInformation, blockingUncertainties). However, `readinessScore` and `readinessState` require architectural review to determine whether they are reasoning outputs or presentation-oriented summaries. | Retain for v0.1. Revisit readiness representation during v0.2. |
| clarifier | NORMALISE | Contains both semantic intent and a fully rendered user-facing question. The question is presentation, while the target and method are reasoning. | Separate clarifier intent from rendered wording. The Decision Model should store only the semantic objective of the clarification. |
| clarifierResponse | NORMALISE | Stores a natural-language answer and effect. The answer may originate from a real user, a test harness, or an assumed slice, but this distinction is not represented. | Represent the semantic outcome of the clarification separately from its textual form, and identify the response source (e.g. USER, ASSUMED, TEST). |
| representativePaths | KEEP | Correctly models alternative decision paths with conditions, commitments and consequences. Structure is semantic rather than narrative. | No change. |
| eventHorizon | KEEP | Trigger, irreversible conditions and architectural meaning are distinct semantic concepts. | No change. |
| establishingShots | KEEP | Correctly stores only path references. Presentation is responsible for generating scene, timeframe and narration. | No change. |
| steelman | KEEP | Objectives and supporting conditions are represented as structured reasoning without prescribing presentation. | No change. |