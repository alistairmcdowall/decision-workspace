# Decision Workspace Engineering Manual

**Version:** 0.1 (Working Draft)

---

## Purpose

This manual describes the architecture of Decision Workspace as it has emerged through the design process.

Its purpose is to document the system faithfully rather than redesign it.

Where possible, architectural statements are grounded in the design discussions that led to their creation. The manual therefore records the architecture that exists rather than proposing a preferred alternative.

---

# Status of this Specification

This manual contains two classes of material.

## Constitutional Chapters

These chapters describe architectural principles that have been established through repeated design discussion and should be treated as the current specification for Decision Workspace.

They include:

- Philosophy
- Core Design Principles
- Decision Model
- Semantic Ownership
- Reasoning Engine
- Component Specifications

Changes to these chapters should normally arise from new architectural discoveries rather than editorial preference.

---

## Experimental Chapters

These chapters document areas of active research.

They record the current direction of investigation rather than fixed architecture.

Examples include:

- Presentation Engine
- Presentation Styles
- Renderer Experiments
- Future Research

These chapters are expected to evolve as new experiments are performed.

---

# Engineering Principle

Throughout this manual a distinction is maintained between:

- observation
- synthesis
- speculation

Architectural statements should describe the system as evidenced by the design process.

Ideas that have not yet been established should remain within experimental chapters until supported by further investigation.

---

# Living Specification

Decision Workspace is treated as a system that is discovered rather than invented.

This manual should evolve only as understanding of the architecture improves.

Where uncertainty exists it should be recorded explicitly rather than hidden by certainty of language.

Truthful documentation is preferred over elegant documentation.

"The purpose of this manual is not to describe the best architecture we can imagine, but the architecture we have actually discovered."












# Decision Workspace Engineering Manual

**Version:** 1.0 (Draft)

**Status:** Living Specification

---

## Purpose

This document is the authoritative engineering specification for Decision Workspace.

Its purpose is to preserve the intent, philosophy, architecture and engineering decisions of the project independently of any individual conversation, engineer or AI model.

The code implements this document.

This document defines the architecture.

If implementation and architecture disagree, the architecture is considered the source of truth until intentionally revised.

---

## How to Read This Manual

The manual is divided into a number of major sections.

1. Vision
2. Philosophy
3. Architectural Laws
4. System Architecture
5. Component Specifications
6. Decision Model Specification
7. Presentation Engine
8. Development Principles
9. Anti-patterns
10. Roadmap

Earlier chapters explain *why* the project exists.

Later chapters explain *how* it is built.

---

# Chapter 1 – Vision
1.1 Purpose

Decision Workspace exists to help people make better decisions.

Not faster decisions.

Not more confident decisions.

Better decisions.

It achieves this by separating the activities that humans naturally conflate:

understanding a problem,
reasoning about a problem,
communicating a problem,
and choosing an action.

Most existing AI systems perform all four simultaneously. They receive a prompt, generate reasoning internally, present prose, and often conclude with a recommendation.

Decision Workspace deliberately refuses this architecture.

Instead it decomposes decision making into independent stages, each with a clearly defined responsibility.

This separation is not merely an implementation detail. It is the defining architectural principle of the project.

1.2 The Problem

Large language models are remarkably capable conversational systems.

They are not, however, decision systems.

Several characteristics make them poorly suited to supporting important decisions directly.

Hidden reasoning

Users cannot inspect the structure of the reasoning process.

The system presents conclusions but not the semantic architecture that produced them.

Single-perspective synthesis

Most assistants naturally collapse multiple viewpoints into one narrative voice.

As a result, disagreement disappears.

Trade-offs become softened.

Important tensions become invisible.

Presentation and reasoning are inseparable

Current assistants generate prose while simultaneously deciding what they believe.

This makes it impossible to distinguish:

what was actually reasoned,

from

how that reasoning happened to be expressed.

Consequently the presentation can subtly change the meaning.

False certainty

Language models are naturally fluent.

Fluency often appears more certain than the underlying evidence deserves.

Decision Workspace attempts to expose uncertainty rather than conceal it.

1.3 Design Goal

The project does not attempt to replace human judgement.

Its goal is considerably narrower.

It seeks to improve the quality of human judgement by improving the quality of the reasoning environment.

This distinction is fundamental.

Decision Workspace is not an autonomous decision maker.

It is a reasoning workspace.

1.4 Core Idea

Every decision contains several different kinds of information.

For example:

facts
assumptions
values
uncertainty
competing objectives
emotional pressures
practical constraints
future consequences

Traditional conversations mix all of these together.

Decision Workspace deliberately separates them.

Each component examines only one aspect of the decision.

The resulting understanding is then assembled into a coherent semantic representation.

1.5 Why Multiple Perspectives Exist

The project originally experimented with the idea of "multiple judges."

This was never intended as theatre.

Each perspective exists because different reasoning disciplines naturally reveal different aspects of reality.

For example:

Guardian protects values that might otherwise be sacrificed.

Pragmatist asks what must actually be true before action is possible.

Empathiser examines the human experience rather than the financial or logical outcome.

Auditor challenges confidence.

Clarifier reduces uncertainty.

These are not personalities.

They are reasoning disciplines.

Future implementations may represent them differently.

The architectural requirement is that these reasoning functions continue to exist.

1.6 Why Recommendations Are Secondary

Many AI systems attempt to answer the question:

What should I do?

Decision Workspace deliberately asks a different question.

What is actually happening inside this decision?

This distinction changes almost every architectural choice.

Recommendations become one possible consequence of understanding rather than the primary objective.

If a user reaches their own conclusion after exploring the workspace, the system has succeeded even if no recommendation was ever produced.

1.7 Success Criteria

Decision Workspace succeeds when:

the structure of a decision becomes clearer;
uncertainty becomes explicit;
assumptions become visible;
competing viewpoints remain intact rather than being prematurely merged;
presentation accurately reflects reasoning;
users understand why a conclusion exists, not merely what it is.

Conversely, the system has failed if it merely produces persuasive prose.

1.8 Non-Goals

Decision Workspace is intentionally not:

a chatbot with better prompts;
an automated decision maker;
a report generator;
a chain-of-thought viewer;
a voting system between AI models;
a personality simulator.

Although it may use conversational language, its architecture is fundamentally different.

Its primary artefact is not a conversation.

It is a semantic representation of a decision.

1.9 The Central Insight

During the evolution of the project, one architectural insight gradually became dominant:

Reasoning and presentation are different engineering problems.

Once recognised, this insight reshaped the entire system.

The Reasoning Engine no longer produces prose.

It produces meaning.

The Presentation Engine no longer performs reasoning.

It renders meaning into language.

The object that separates those responsibilities is the Decision Model.

The Decision Model is therefore not merely a data structure.

It is the architectural boundary that makes every other part of the system possible.

End of Chapter 1

Chapter 2 – Philosophy
2.1 Decisions are explored, not solved

Decision Workspace does not exist to provide answers.

It exists to improve understanding.

A recommendation may emerge from the reasoning process, but the recommendation is never the objective.

The objective is that the user understands the decision more completely than they did before entering the workspace.

A user who reaches their own conclusion through a clearer understanding of the decision has achieved a better outcome than one who simply follows an AI recommendation.

2.2 Human judgement remains central

Decision Workspace assumes that important decisions contain elements that cannot always be formalised.

Personal values.

Relationships.

Risk tolerance.

Ambition.

Regret.

Identity.

These are not defects in the reasoning process.

They are legitimate components of the decision itself.

The purpose of the system is therefore not to replace human judgement but to support it.

The final decision always belongs to the user.

2.3 Clarity is more valuable than certainty

Many reasoning systems optimise for confidence.

Decision Workspace deliberately optimises for clarity.

An uncertain decision that is well understood is preferable to a confident conclusion built upon hidden assumptions.

The system therefore seeks to expose uncertainty wherever it exists rather than smoothing it away in the interests of producing a more persuasive narrative.

2.4 Every reasoning discipline reveals different truths

No single perspective can fully describe a complex decision.

Financial reasoning may reveal one set of constraints.

Emotional reasoning another.

Practical reasoning another.

Risk analysis another.

Rather than forcing these viewpoints into immediate agreement, Decision Workspace preserves them long enough for the user to understand the tensions between them.

Disagreement is not considered a failure.

It is evidence that the decision genuinely contains competing values.

2.5 Structure precedes communication

The project distinguishes between understanding and explaining.

A decision should first exist as a coherent semantic structure.

Only once that structure exists should it be communicated.

This ordering prevents the language used to describe a decision from subtly changing the reasoning itself.

The architecture therefore separates reasoning from presentation.

This separation is fundamental rather than cosmetic.

2.6 Language is an interface

Words are not the reasoning.

They are an interface through which reasoning is experienced.

Different users benefit from different styles of communication.

Some prefer concise technical summaries.

Others prefer richer narrative.

Others respond more effectively to metaphor or analogy.

Decision Workspace therefore treats language as a presentation layer rather than part of the reasoning process.

Multiple presentations may legitimately exist for the same underlying decision.

All are equally valid provided they preserve the same semantic meaning.

2.7 Richness without distortion

The project actively encourages expressive language.

Metaphor.

Narrative.

Imagery.

Humour.

Documentary style.

Detective style.

Literary style.

These are not considered embellishments.

They are tools for improving human understanding.

However, expressive language must never introduce new facts or alter existing meaning.

Presentation may illuminate.

It must never persuade by changing the reasoning.

2.8 Simplicity is not the goal

Real decisions are often complicated.

The role of the system is not to make them appear simpler than they are.

Instead it seeks to organise complexity into forms that humans can understand.

Complexity should be reduced only where it is genuinely unnecessary.

Necessary complexity should remain visible.

2.9 Truth over elegance

Throughout the project a consistent principle applies.

Whenever there is tension between architectural elegance and faithful representation of reality, reality takes precedence.

The system exists to model decisions honestly rather than beautifully.

Elegant architecture is desirable.

Faithful reasoning is essential.

2.10 Philosophy before implementation

The implementation may evolve.

The programming language may change.

The user interface may change.

The reasoning techniques may become more sophisticated.

The philosophy should remain stable.

Every future architectural decision should be judged against the principles described in this chapter.

Where implementation conflicts with philosophy, the implementation should be reconsidered.

Design rationale

The philosophy deliberately precedes architecture because architectural decisions derive their legitimacy from these principles.

Without an explicit philosophy, future changes risk optimising implementation while unintentionally undermining the original purpose of the system.

Alternatives considered
AI as decision maker

Rejected.

The system should assist rather than replace human judgement.

Single authoritative recommendation

Rejected.

Complex decisions often support multiple defensible conclusions.

The objective is understanding rather than prescription.

Purely factual reporting

Rejected.

Humans do not reason using facts alone.

Values, uncertainty and emotion are legitimate parts of decision making and should remain visible.

Consequences

This philosophy has several direct architectural consequences.

Multiple reasoning perspectives become necessary.
Reasoning and presentation become separate concerns.
The Decision Model becomes the primary artefact of the system.
Presentation Engines may vary in style while remaining semantically identical.
Human judgement remains outside the system boundary.


# Chapter 3 – Architectural Laws

The following laws define the architectural boundaries of Decision Workspace.

Unlike implementation details, these laws are intended to remain stable across versions of the project.

Any proposal that violates one or more of these laws should explicitly justify why the law should be changed.

Architectural convenience alone is not considered sufficient justification.

---

## Law 1 — The Decision Model is the Contract

The Decision Model is the canonical representation of a decision.

Every component within the Reasoning Engine contributes semantic information to the Decision Model.

Every Presentation Engine consumes the Decision Model.

No Presentation Engine should require access to the internal workings of the Reasoning Engine.

Likewise, the Reasoning Engine should have no knowledge of how the Decision Model will eventually be presented.

The Decision Model therefore forms the architectural boundary between reasoning and communication.

---

## Law 2 — Reasoning Owns Semantics

The Reasoning Engine is responsible for determining meaning.

It may:

- identify assumptions
- expose uncertainty
- construct representative paths
- identify competing values
- analyse evidence
- discover tensions

It must not concern itself with:

- writing reports
- formatting output
- narrative style
- literary quality
- presentation preferences

The output of reasoning is semantic structure.

Nothing more.

---

## Law 3 — Presentation Owns Language

Presentation Engines consume the Decision Model.

They exist solely to improve human understanding.

Presentation Engines may:

- reorder information
- improve readability
- improve pacing
- choose narrative style
- use metaphor
- use analogy
- vary tone
- target different audiences

Presentation Engines must not:

- invent facts
- change meaning
- strengthen conclusions
- weaken uncertainty
- introduce recommendations
- reinterpret semantics

Presentation is therefore a rendering process rather than a reasoning process.

---

## Law 4 — Presentation Must Be Lossless

Every Presentation Engine should preserve the complete semantic meaning contained within the Decision Model.

Different renderers may express that meaning differently.

However, two users reading different renderers should ultimately understand the same decision.

Presentation quality is judged by clarity rather than creativity.

Expressive language is encouraged only where it preserves semantic fidelity.

---

## Law 5 — Components Own Exactly One Responsibility

Each reasoning component exists for one clearly defined purpose.

Responsibilities should not overlap.

Examples include:

- Reframer determines what decision is being analysed.
- Guardian identifies protected values.
- Pragmatist identifies practical requirements.
- Empathiser identifies human factors.
- Auditor evaluates evidential quality.
- Clarifier reduces uncertainty.

Whenever a component begins performing work that belongs elsewhere, the architecture should be reconsidered.

---

## Law 6 — Meaning Should Exist Only Once

Each semantic concept should have a single canonical location within the Decision Model.

Duplicate representations introduce ambiguity.

Whenever the same meaning appears in multiple places, one representation should become canonical.

Other components should reference it rather than reproduce it.

Semantic duplication is considered an architectural defect.

---

## Law 7 — Uncertainty Is First-Class

Uncertainty is not an implementation inconvenience.

It is a property of reality.

Decision Workspace therefore treats uncertainty as explicit information.

The system should expose:

- missing evidence
- unresolved assumptions
- competing interpretations
- unknown outcomes

Uncertainty should never be hidden merely to produce a cleaner narrative.

---

## Law 8 — Recommendations Are Derived, Not Assumed

The system should never begin by attempting to answer:

"What should the user do?"

Instead it should ask:

"What is actually true about this decision?"

Recommendations, where they exist, emerge from the reasoning process.

They are consequences of understanding rather than objectives.

---

## Law 9 — Human Judgement Lies Outside the System Boundary

Decision Workspace assists human judgement.

It does not replace it.

The system may improve understanding.

It may identify trade-offs.

It may expose uncertainty.

It may organise competing perspectives.

The final decision remains the responsibility of the user.

---

## Law 10 — The Architecture Must Be Explainable

Every major architectural decision should be explainable in plain language.

If an engineer cannot explain why a component exists, the component probably should not exist.

Architectural complexity is justified only where it improves reasoning fidelity.

Complexity for its own sake is rejected.

---

# Design Rationale

These laws deliberately separate enduring principles from implementation.

Programming languages, user interfaces and reasoning techniques will inevitably evolve.

The architectural laws provide continuity across those changes.

Future contributors should regard these laws as constraints rather than suggestions.

---

# Alternatives Considered

### Single monolithic reasoning engine

Rejected.

Independent responsibilities produce cleaner reasoning and reduce hidden coupling.

---

### Report generation inside the Reasoning Engine

Rejected.

Combining reasoning and presentation makes semantic verification impossible and prevents multiple renderers.

---

### Presentation-specific Decision Models

Rejected.

Different presentation styles should consume identical semantic structures.

The Decision Model must therefore remain presentation-independent.

---

### Recommendation-first architecture

Rejected.

Optimising for recommendations encourages premature certainty and obscures competing perspectives.

---

# Consequences

These laws create several important properties.

✓ Multiple Presentation Engines become possible.

✓ JSON becomes a valid reference renderer.

✓ New reasoning components can be introduced without changing renderers.

✓ Presentation styles can evolve independently.

✓ Semantic validation becomes possible.

✓ The architecture becomes testable at the Decision Model boundary.

At the same time they impose useful constraints.

✗ Presentation cannot invent reasoning.

✗ Components cannot duplicate responsibilities.

✗ Semantic meaning cannot depend upon prose.

✗ Convenience alone is insufficient reason to change the architecture.



# Chapter 4 – System Architecture

## 4.1 Overview

Decision Workspace is constructed as a pipeline.

Each stage has a single responsibility.

Each stage communicates with the next using a clearly defined interface.

No stage is permitted to bypass another.

The architecture is intentionally layered in order to separate concerns that are traditionally mixed together inside conversational AI systems.

The pipeline is shown below.

```
Natural Language Prompt
            │
            ▼
    Reasoning Engine
            │
            ▼
     Decision Model
            │
            ▼
 Presentation Engine
            │
            ▼
   Human-readable Report
```

Although this diagram appears simple, each boundary is architecturally significant.

The most important boundary is the Decision Model.

Everything above it creates meaning.

Everything below it communicates meaning.

---

## 4.2 Inputs

Every execution begins with a prompt.

The prompt represents the user's description of a decision.

The system deliberately treats the prompt as raw input rather than as structured information.

No assumptions are made regarding:

- wording
- quality
- completeness
- ambiguity

The purpose of the Reasoning Engine is to transform this unstructured input into an explicit semantic representation.

---

## 4.3 The Reasoning Engine

The Reasoning Engine is responsible for understanding the decision.

It performs semantic analysis rather than report generation.

Its output is never intended to be read directly by end users.

Instead it incrementally constructs a Decision Model.

Each reasoning component contributes one specific aspect of understanding.

For example:

- Reframer determines the governing objective.
- Landscape identifies the decision space.
- Guardian identifies protected values.
- Pragmatist identifies practical requirements.
- Empathiser identifies human considerations.
- Auditor evaluates confidence.
- Clarifier reduces uncertainty.
- Representative Paths define meaningful alternatives.
- Event Horizon identifies irreversible commitment.
- Establishing Shot creates comparable views.
- Steelman constructs the strongest case for each path.

Each component enriches the Decision Model.

No component is responsible for presentation.

---

## 4.4 The Decision Model

The Decision Model is the semantic representation of the decision.

It is the primary product produced by the Reasoning Engine.

Contrary to traditional conversational systems, the report is not considered the primary artefact.

The report is merely one possible rendering.

The Decision Model contains structured meaning rather than prose.

It should be sufficiently complete that multiple Presentation Engines can produce materially different reports while preserving identical semantics.

The Decision Model therefore forms the contractual interface between reasoning and presentation.

---

## 4.5 The Presentation Engine

Presentation Engines consume the Decision Model.

They do not perform reasoning.

Instead they transform semantic structures into forms that improve human understanding.

Presentation Engines may vary considerably.

Examples include:

- technical reports
- executive summaries
- investigative narratives
- documentary style
- interactive visualisations
- educational explanations

All of these remain valid provided they preserve the semantic content of the Decision Model.

The existence of multiple renderers should never require changes to the Reasoning Engine.

---

## 4.6 Outputs

The final output presented to the user is a rendered interpretation of the Decision Model.

Importantly, the report is not itself part of the reasoning process.

It is a communication artefact.

Different reports may legitimately exist for the same decision.

The Decision Model remains the canonical representation.

---

## 4.7 Information Flow

Information flows strictly in one direction.

```
Prompt

↓

Reasoning Engine

↓

Decision Model

↓

Presentation Engine

↓

Report
```

Presentation must never modify the Decision Model.

Similarly, the Reasoning Engine must never depend upon presentation decisions.

This one-way flow simplifies testing, improves modularity and prevents hidden coupling between reasoning and communication.

---

## 4.8 Architectural Boundaries

The architecture intentionally defines four major boundaries.

### Prompt → Reasoning

Natural language becomes structured understanding.

---

### Reasoning → Decision Model

Semantic understanding becomes explicit.

---

### Decision Model → Presentation

Meaning becomes language.

---

### Presentation → User

Language becomes human understanding.

Each boundary transforms information into a new representation without changing the underlying decision.

---

## 4.9 Why the Architecture Appears Unusual

Most conversational AI systems perform reasoning and presentation simultaneously.

Decision Workspace deliberately rejects this approach.

Instead it behaves more like a compiler.

```
Source language

↓

Semantic analysis

↓

Intermediate Representation

↓

Rendering
```

The prompt is analogous to source code.

The Decision Model is analogous to an Intermediate Representation (IR).

Presentation Engines are analogous to code generators targeting different output formats.

This architecture allows reasoning and communication to evolve independently while remaining semantically consistent.

---

# Design Rationale

The layered architecture exists to preserve semantic integrity.

Separating reasoning from presentation allows each concern to evolve independently.

Reasoning becomes easier to verify.

Presentation becomes easier to improve.

The Decision Model becomes testable in isolation.

---

# Alternatives Considered

### Direct prompt → report generation

Rejected.

Reasoning becomes inseparable from presentation.

Intermediate semantics cannot be validated.

Multiple renderers become impossible.

---

### Component-specific reports

Rejected.

Each component should contribute semantic information rather than prose.

Narrative belongs to the Presentation Engine.

---

### Multiple Decision Models

Rejected.

A single canonical semantic representation provides consistency across all renderers.

---

# Consequences

The architecture enables:

✓ independent Presentation Engines

✓ semantic validation

✓ automated testing at the Decision Model boundary

✓ richer narrative styles

✓ future visual renderers

✓ future interactive interfaces

while preventing:

✗ presentation-driven reasoning

✗ duplicated semantics

✗ renderer-specific logic inside reasoning components

✗ hidden coupling between understanding and communication.



# Chapter 5 – The Decision Model

## 5.1 Introduction

The Decision Model is the central architectural concept of Decision Workspace.

It is not a report.

It is not an internal data structure.

It is not merely a collection of fields.

The Decision Model is the semantic representation of a decision.

It captures what the Reasoning Engine has understood, independently of how that understanding will eventually be communicated.

Everything in Decision Workspace either contributes to the Decision Model or consumes it.

Nothing bypasses it.

For this reason, the Decision Model is regarded as the architectural heart of the system.

---

## 5.2 Why the Decision Model Exists

Most AI systems generate prose directly from reasoning.

As a consequence, reasoning and communication become inseparable.

This creates several problems.

Reasoning cannot easily be inspected.

Presentation cannot evolve independently.

Alternative styles of communication require repeating the reasoning process.

Semantic correctness becomes difficult to verify.

Decision Workspace rejects this architecture.

Instead it introduces an explicit semantic representation between reasoning and presentation.

That representation is the Decision Model.

---

## 5.3 A Semantic Intermediate Representation

The Decision Model should be thought of as an Intermediate Representation (IR).

Its purpose is not to be beautiful.

Its purpose is to preserve meaning.

In compiler design, source code is transformed into an intermediate representation before machine code is produced.

The intermediate representation allows optimisation, validation and multiple output targets without changing the meaning of the program.

Decision Workspace adopts the same philosophy.

```
User Prompt

↓

Reasoning

↓

Decision Model

↓

Presentation
```

The Decision Model therefore plays the same architectural role as an IR.

It is the stable representation through which every later stage operates.

---

## 5.4 The Primary Artefact

A common misunderstanding is to assume that the final report is the product of the system.

It is not.

The report is simply one rendering.

The Decision Model is the real product.

This distinction has profound architectural consequences.

If the Decision Model is correct, any number of reports can be generated.

If the Decision Model is incorrect, no presentation can repair it.

For this reason, the quality of Decision Workspace is measured primarily by the quality of the Decision Model rather than the quality of the prose it produces.

---

## 5.5 Semantics Before Language

Every field within the Decision Model should represent meaning rather than wording.

For example, a field should describe:

- uncertainty
- commitment
- assumptions
- governing objectives
- representative paths

It should not attempt to describe how those concepts ought to be expressed to a reader.

Language belongs to the Presentation Engine.

Meaning belongs to the Decision Model.

---

## 5.6 Canonical Meaning

Every semantic concept should exist once and only once within the Decision Model.

If multiple components require access to the same meaning, they should reference the canonical representation rather than duplicate it.

Duplicate semantics introduce ambiguity.

Ambiguity reduces confidence.

The Decision Model therefore serves as the single source of truth for every concept discovered during reasoning.

---

## 5.7 Stability

Presentation styles may evolve.

Reasoning techniques may evolve.

Components may evolve.

The Decision Model should evolve more cautiously.

Because it forms the contract between the Reasoning Engine and every Presentation Engine, unnecessary changes create unnecessary instability.

Whenever possible, new capabilities should be expressed through extensions rather than redesign.

Stability of the contract is regarded as a significant architectural virtue.

---

## 5.8 Validation

One consequence of separating semantics from presentation is that the Decision Model can be validated directly.

It becomes possible to ask questions such as:

- Is every required field present?
- Does every representative path have a corresponding steelman?
- Has every uncertainty either been resolved or explicitly preserved?
- Are commitments represented consistently?
- Are semantic concepts duplicated?

These questions are independent of presentation.

This significantly improves testability.

---

## 5.9 Multiple Presentation Engines

Because the Decision Model contains only semantics, many Presentation Engines can legitimately consume the same model.

Examples include:

- executive summaries
- engineering reports
- documentary narratives
- educational explanations
- visual interfaces
- interactive decision exploration
- accessibility-focused renderers
- future interfaces not yet conceived

Each renderer may differ dramatically in style.

None should differ in meaning.

---

## 5.10 Ownership

Responsibility for the Decision Model is shared.

Reasoning components contribute semantic information.

No individual component owns the model.

Similarly, Presentation Engines consume the model but never modify it.

This creates a clean separation of responsibility.

```
Reasoning

creates

Decision Model

consumed by

Presentation
```

The Decision Model therefore remains independent of both.

---

## 5.11 Evolution

The Decision Model is expected to evolve.

However, evolution should be conservative.

Every new field should satisfy three questions.

1. Does it represent genuine semantic information?

2. Does that meaning already exist elsewhere?

3. Could two Presentation Engines legitimately express this field differently while preserving meaning?

If the answer to any of these questions is unsatisfactory, the proposed change should be reconsidered.

---

# Design Rationale

The Decision Model exists because reasoning and communication are fundamentally different activities.

By introducing a semantic representation between them, Decision Workspace gains modularity, testability and architectural clarity without sacrificing expressive presentation.

---

# Alternatives Considered

### Direct report generation

Rejected.

Reasoning becomes inseparable from presentation.

---

### Presentation-specific models

Rejected.

Every renderer should consume the same semantics.

---

### Multiple semantic models

Rejected.

One decision should have one canonical semantic representation.

---

### Presentation embedded within reasoning

Rejected.

Narrative is not semantics.

---

# Consequences

The Decision Model enables:

✓ independent Presentation Engines

✓ semantic validation

✓ stable architectural boundaries

✓ multiple output formats

✓ compiler-style testing

✓ future visual renderers

✓ future interactive interfaces

while preventing:

✗ presentation altering reasoning

✗ duplicated semantics

✗ renderer-specific reasoning

✗ hidden coupling between architecture layers


# Chapter 6 – The Reasoning Engine

## 6.1 Purpose

The Reasoning Engine is responsible for transforming an unstructured decision into a structured semantic representation.

It is the analytical core of Decision Workspace.

Unlike conventional conversational AI systems, the Reasoning Engine does not attempt to communicate with the user directly.

Its purpose is not to produce fluent language.

Its purpose is to understand.

The result of that understanding is expressed as a Decision Model.

---

## 6.2 Responsibility

The Reasoning Engine owns semantic interpretation.

It is responsible for discovering and organising information such as:

- objectives
- assumptions
- uncertainty
- competing values
- practical constraints
- human considerations
- representative futures
- evidential strength

Every output from the Reasoning Engine should answer one question:

> "What has been understood?"

It should never answer:

> "How should this be explained?"

That distinction belongs to the Presentation Engine.

---

## 6.3 A Collaborative System

The Reasoning Engine is not a single algorithm.

It is a collection of specialised reasoning components.

Each component contributes one perspective.

No component attempts to understand the entire decision in isolation.

Instead, each component enriches the shared Decision Model.

The overall understanding emerges from collaboration rather than centralised control.

---

## 6.4 The Processing Pipeline

Although implementation may evolve, reasoning follows a broadly consistent sequence.

```
Prompt

↓

Reframer

↓

Decision Landscape

↓

Reasoning Panel

↓

Auditor

↓

Clarifier

↓

Decision Landscape (updated)

↓

Representative Paths

↓

Event Horizon

↓

Establishing Shot

↓

Steelman

↓

Decision Model
```

This sequence is not arbitrary.

Each stage depends upon information generated earlier in the pipeline.

The ordering therefore reflects dependency rather than preference.

---

## 6.5 Incremental Understanding

Reasoning is cumulative.

No component starts from scratch.

Each component receives the Decision Model as it currently exists.

It contributes additional semantic information.

It then returns the enriched model.

The Decision Model therefore evolves gradually throughout the reasoning process.

Understanding is accumulated rather than regenerated.

---

## 6.6 Semantic Ownership

Every component owns only the semantic concepts assigned to it.

For example:

- Guardian owns protected values.
- Pragmatist owns practical requirements.
- Empathiser owns human considerations.
- Auditor owns evidential evaluation.

A component should not modify semantic information owned by another component.

This preserves clear architectural responsibility.

---

## 6.7 Independence

Reasoning components should remain independent wherever possible.

A component should require only the semantic information necessary to perform its own analysis.

Excessive coupling between components increases architectural fragility and reduces the ability to evolve the engine.

Shared understanding should occur through the Decision Model rather than through direct communication between components.

---

## 6.8 Determinism

Given identical inputs and identical assumptions, the Reasoning Engine should produce the same Decision Model.

Presentation may legitimately vary.

Reasoning should not.

Deterministic behaviour simplifies testing and improves confidence in the architecture.

---

## 6.9 Extensibility

The architecture assumes that new reasoning components will be introduced over time.

Examples might include:

- ethical analysis
- legal reasoning
- systems thinking
- environmental impact
- probabilistic modelling

Adding such components should require minimal modification to the existing engine.

The architecture therefore favours composition over replacement.

---

## 6.10 What the Reasoning Engine Does Not Do

The Reasoning Engine deliberately avoids several responsibilities.

It does not:

- write reports
- choose narrative style
- optimise readability
- persuade users
- embellish conclusions
- select visual presentation

Those concerns belong exclusively to Presentation Engines.

Maintaining this separation preserves semantic integrity.

---

# Design Rationale

The Reasoning Engine exists to convert uncertainty into understanding.

It deliberately avoids communication responsibilities so that semantic correctness can be developed and tested independently from presentation.

This separation also enables multiple Presentation Engines to coexist without duplicating reasoning.

---

# Alternatives Considered

### Monolithic reasoning

Rejected.

Large reasoning systems become difficult to understand, validate and extend.

---

### Conversational reasoning

Rejected.

Conversation encourages presentation concerns to leak into semantic analysis.

---

### Presentation-aware reasoning

Rejected.

Reasoning should remain independent of any particular report style or user interface.

---

# Consequences

The architecture enables:

✓ independent reasoning components

✓ incremental semantic enrichment

✓ deterministic Decision Models

✓ isolated testing

✓ future reasoning extensions

✓ presentation independence

while preventing:

✗ presentation affecting reasoning

✗ uncontrolled component coupling

✗ duplicated analytical responsibilities

✗ narrative-driven semantic decisions



# Component Overview

The Reasoning Engine is composed of a number of specialised components.

Each component exists to answer one specific question about the decision.

No component attempts to solve the entire decision independently.

Instead, each contributes a distinct semantic perspective to the Decision Model.

Collectively, these components transform an unstructured prompt into a structured representation that can later be presented in many different forms.

The following table summarises the purpose of each component.

| Component | Primary Responsibility | Key Question |
|------------|------------------------|--------------|
| **Reframer** | Determine what decision is actually being analysed. | *What is the real decision?* |
| **Decision Landscape** | Define the structure, boundaries and uncertainties of the decision. | *What does this decision space look like?* |
| **Guardian** | Identify values that may be unintentionally sacrificed. | *What must not be lost?* |
| **Pragmatist** | Identify practical requirements that determine feasibility. | *What must be true before action is possible?* |
| **Empathiser** | Surface the human experience of the decision. | *How does this affect the people involved?* |
| **Auditor** | Evaluate evidential quality and reasoning readiness. | *How trustworthy is our current understanding?* |
| **Clarifier** | Resolve uncertainties that materially affect the decision. | *What question most improves understanding?* |
| **Representative Paths** | Construct the principal alternatives available to the decision maker. | *What are the meaningful choices?* |
| **Event Horizon** | Identify the point beyond which the decision becomes materially irreversible. | *When does this stop being a decision?* |
| **Establishing Shot** | Create comparable viewpoints from which the decision can be examined. | *How should the alternatives be viewed?* |
| **Steelman** | Construct the strongest possible case for each representative path. | *What is the best argument for this path?* |
| **Navigator** *(Future)* | Guide execution after a decision has been reached. | *How should the chosen path now be carried out?* |

---

## Collaboration

No component is considered more important than another.

Each exists because it reveals information that would otherwise remain hidden.

A decision is therefore understood through the accumulation of multiple specialised perspectives rather than through a single general-purpose analysis.

---

## Shared Responsibility

Although each component owns a distinct responsibility, no component owns the decision.

Each contributes semantic information to the shared Decision Model.

The Decision Model therefore represents the collective understanding of the Reasoning Engine rather than the output of any individual component.

---

## Reading Guide

The chapters that follow describe each component individually.

Each specification follows the same structure.

- Purpose
- Responsibilities
- Inputs
- Outputs
- Semantic Ownership
- Interaction with Other Components
- Design Rationale
- Alternatives Considered
- Consequences

This consistent format is intended to make the reasoning architecture easier to understand, compare and evolve over time.



# Chapter 7 – Reframer

## Key Question

> **What decision is actually being analysed?**

---

## Purpose

The Reframer is responsible for transforming the user's prompt into a clearly defined decision.

Users frequently describe symptoms rather than decisions.

They may describe frustrations, possibilities, constraints or aspirations without explicitly stating what choice is actually being considered.

The Reframer identifies the underlying decision that the remainder of the Reasoning Engine will analyse.

Without a correctly framed decision, every subsequent stage risks reasoning about the wrong problem.

---

## Responsibilities

The Reframer is responsible for:

- identifying the primary decision
- distinguishing decisions from background context
- identifying the governing objective
- recognising when multiple independent decisions exist
- determining whether the prompt should proceed through the Decision Workspace pipeline

The Reframer deliberately performs no evaluation.

It determines *what* should be analysed.

It does not determine *how* it should be analysed.

---

## Inputs

The Reframer receives:

- the user's natural language prompt
- any explicitly provided contextual information

The prompt is assumed to be unstructured.

No assumptions are made regarding completeness or quality.

---

## Outputs

The Reframer contributes semantic information describing:

- the governing objective
- the identified decision
- routing information
- framing diagnostics

This information becomes part of the Decision Model.

---

## Semantic Ownership

The Reframer owns the semantic definition of the decision itself.

No later component should redefine the decision.

Subsequent components assume that the Reframer has correctly identified the subject of analysis.

If the decision itself changes, the reasoning process should begin again.

---

## Interaction with Other Components

The Reframer precedes every other reasoning component.

Its output directly influences:

- Decision Landscape
- Guardian
- Pragmatist
- Empathiser
- Auditor
- Clarifier

Every subsequent component assumes that the decision has already been correctly framed.

---

## Design Principles

The Reframer follows several principles.

### One decision at a time

The engine should reason about one decision.

If multiple independent decisions are detected, they should be separated rather than analysed simultaneously.

---

### Separate context from choice

Background information provides context.

It is not necessarily the decision.

The Reframer distinguishes between the two.

---

### Preserve user intent

The Reframer should clarify the user's objective without altering it.

It should not reinterpret the decision into one that is easier to analyse.

---

### Prefer explicit framing

Whenever ambiguity exists, it should be exposed rather than hidden.

The Clarifier exists to resolve uncertainty.

The Reframer should not silently guess.

---

## Design Rationale

Accurate reasoning depends upon analysing the correct decision.

Errors introduced during framing propagate throughout the entire reasoning pipeline.

The Reframer therefore acts as the foundation upon which all later reasoning is built.

---

## Alternatives Considered

### Allow every component to interpret the prompt independently

Rejected.

Different components would inevitably analyse different decisions.

The resulting Decision Model would become internally inconsistent.

---

### Allow the Decision Landscape to identify the decision

Rejected.

The Landscape assumes that the decision has already been defined.

Separating framing from landscape construction produces clearer responsibilities.

---

### Merge the Reframer with the Clarifier

Rejected.

Framing determines what decision exists.

Clarification reduces uncertainty within that decision.

Although related, these responsibilities are distinct.

---

## Consequences

The Reframer enables:

✓ consistent reasoning

✓ stable routing

✓ clearer governing objectives

✓ explicit decision boundaries

✓ deterministic reasoning pipelines

while preventing:

✗ multiple competing interpretations

✗ hidden shifts in decision scope

✗ components analysing different problems

✗ ambiguity propagating through the Reasoning Engine

---

## Future Evolution

Future versions of the Reframer may support:

- decomposition of compound decisions
- automatic identification of nested decisions
- recognition of decision dependencies
- confidence scoring for framing quality

These enhancements should strengthen framing accuracy without changing the Reframer's fundamental responsibility.

That responsibility remains unchanged:

> **Determine what decision is actually being analysed.**


# Chapter 8 – Decision Landscape

## Key Question

> **What does this decision space actually look like?**

---

## Purpose

The Decision Landscape is responsible for constructing a semantic representation of the decision itself.

Rather than evaluating alternatives, it seeks to understand the environment in which those alternatives exist.

The Landscape defines:

- the subject of the decision
- the scope of the decision
- the governing objective
- commitments already known
- commitments still required
- uncertainties
- decision boundaries
- the current state of understanding

It therefore provides the structural context within which all subsequent reasoning occurs.

---

## Responsibilities

The Decision Landscape is responsible for:

- defining the decision space
- identifying the major dimensions of the decision
- distinguishing resolved knowledge from unresolved uncertainty
- recording how understanding evolves during reasoning
- maintaining the current state of the decision throughout the reasoning process

Unlike later components, the Landscape does not argue for any particular course of action.

It simply describes the territory.

---

## Inputs

The Decision Landscape receives:

- the framed decision from the Reframer
- contextual information provided by the user
- semantic updates produced by later reasoning components

The Landscape therefore evolves as understanding increases.

---

## Outputs

The Landscape contributes structured semantic information describing:

- decision subject
- governing objective
- commitments
- decision axes
- resolved uncertainties
- remaining uncertainties
- current reasoning state

These become part of the Decision Model.

---

## Semantic Ownership

The Decision Landscape owns the structural representation of the decision.

Other components contribute information that may change the Landscape, but they do not own it.

For example:

Clarifier may resolve uncertainty.

Auditor may identify missing evidence.

Guardian may reveal protected values.

The Landscape records those changes without becoming responsible for discovering them.

---

## Evolution

The Landscape is expected to change during reasoning.

It is not static.

Understanding develops progressively.

Decision Workspace therefore distinguishes between successive versions of the Landscape.

For example:

Decision Landscape V1

↓

Clarification

↓

Decision Landscape V2

↓

Further reasoning

↓

Decision Landscape V3

Each version represents a more complete understanding of the same decision.

---

## Decision Axes

Most important decisions are not one-dimensional.

A purchase decision, for example, may involve:

- financial value
- transaction risk
- emotional value
- opportunity cost

The Landscape identifies these dimensions without attempting to prioritise them.

Their relative importance emerges later through reasoning.

---

## Resolved and Remaining Uncertainty

A central responsibility of the Landscape is to distinguish between:

What is now understood.

and

What remains unknown.

This distinction allows progress through the reasoning process to be measured explicitly.

As clarification occurs, uncertainties migrate from unresolved to resolved.

The Landscape therefore acts as the memory of the reasoning process.

---

## State

The Landscape records the current maturity of understanding.

Examples include:

- Initial
- Broad
- Narrowed
- Mature

These states do not measure correctness.

They measure how well the decision has been explored.

---

## Interaction with Other Components

The Landscape is influenced by almost every reasoning component.

Reframer defines the initial decision.

Guardian introduces protected values.

Pragmatist introduces practical constraints.

Empathiser introduces human considerations.

Auditor exposes weaknesses.

Clarifier resolves uncertainty.

Representative Paths emerge from the mature Landscape.

The Landscape therefore becomes the shared semantic context for the remainder of the Reasoning Engine.

---

## Design Principles

### Describe rather than evaluate

The Landscape should represent reality.

It should not recommend action.

---

### Evolve continuously

Understanding grows throughout reasoning.

The Landscape should therefore be capable of representing multiple successive states.

---

### Preserve uncertainty

Unknowns are legitimate features of the decision.

Removing them prematurely reduces reasoning quality.

---

### Represent structure

The Landscape is concerned with the architecture of the decision.

It does not construct arguments.

---

## Design Rationale

Traditional reasoning systems often jump directly from a prompt to recommendations.

Decision Workspace instead constructs an explicit representation of the decision itself.

This intermediate understanding enables every later component to reason within a shared semantic context.

---

## Alternatives Considered

### No explicit Landscape

Rejected.

Reasoning components would lack a shared understanding of the decision.

---

### Static Landscape

Rejected.

Understanding evolves throughout reasoning.

The Landscape should evolve with it.

---

### Landscape as report text

Rejected.

The Landscape represents semantic structure rather than narrative.

Presentation belongs elsewhere.

---

## Consequences

The Decision Landscape enables:

✓ explicit decision structure

✓ progressive refinement

✓ measurable reasoning progress

✓ shared semantic context

✓ explicit uncertainty tracking

✓ future visualisation of decision spaces

while preventing:

✗ hidden changes in understanding

✗ inconsistent reasoning context

✗ loss of intermediate reasoning state

✗ premature convergence on recommendations

---

## Future Evolution

Future versions of the Decision Landscape may include:

- hierarchical decision spaces
- nested sub-decisions
- dependency graphs
- probabilistic uncertainty
- temporal reasoning
- causal relationships

These extensions should deepen the representation of the decision without altering the Landscape's primary responsibility.

That responsibility remains unchanged:

> **Represent the structure of the decision itself.**


# Chapter 9 – Guardian

## Key Question

> **What must not be unintentionally sacrificed?**

---

## Purpose

The Guardian exists to identify values that are at risk of being lost during the decision-making process.

Many decisions naturally optimise towards one objective.

Increasing wealth may reduce family time.

Reducing risk may sacrifice opportunity.

Improving efficiency may diminish quality.

These trade-offs are not necessarily wrong.

However, they should be recognised consciously rather than occurring accidentally.

The Guardian therefore acts as the custodian of protected values throughout the reasoning process.

---

## Responsibilities

The Guardian is responsible for:

- identifying values exposed by the decision
- recognising where those values may be threatened
- distinguishing protected values from ordinary preferences
- ensuring important trade-offs remain visible
- preventing optimisation from becoming unintended sacrifice

The Guardian does not decide whether a sacrifice is acceptable.

It merely ensures that the sacrifice becomes explicit.

---

## Inputs

The Guardian receives:

- the current Decision Landscape
- the governing objective
- contextual information supplied by the user

From these it identifies values that appear vulnerable.

---

## Outputs

The Guardian contributes structured semantic information describing:

- protected values
- associated concerns
- potential value conflicts

These become part of the Decision Model.

---

## Semantic Ownership

The Guardian owns semantic information relating to protected values.

Other components may influence those values.

For example:

- the Empathiser may reveal emotional consequences;
- the Pragmatist may expose practical necessity;
- the Auditor may identify unsupported assumptions.

However, only the Guardian determines which values require explicit protection.

---

## Protected Values

Protected values are principles, assets or qualities that the user is unlikely to wish to sacrifice without deliberate consideration.

Examples include:

- financial security
- health
- family relationships
- integrity
- freedom
- optionality
- reputation
- personal identity
- long-term opportunity

Protected values are highly dependent upon context.

The Guardian therefore identifies them dynamically rather than using a fixed catalogue.

---

## Concern

Every protected value is paired with a concern.

The concern describes how the decision may threaten that value.

Examples include:

Protected Value

Financial Optionality

Concern

Large capital commitment.

---

Protected Value

Family Stability

Concern

Increased travel requirements.

---

Protected Value

Professional Reputation

Concern

Association with a high-risk project.

The concern is descriptive rather than predictive.

It identifies exposure rather than outcome.

---

## Design Principles

### Values are not recommendations

The Guardian does not recommend preserving every value.

Sometimes sacrificing one value enables another.

Its responsibility is simply to ensure that the decision maker understands what is being exchanged.

---

### Visibility before optimisation

Values should become visible before optimisation begins.

Optimising a decision without understanding what is at stake risks producing technically correct but personally unacceptable outcomes.

---

### Human values matter

Not all important considerations are financial or measurable.

The Guardian therefore treats subjective values as legitimate components of the decision.

---

### Protection is contextual

A value becomes protected because of its importance within the current decision.

The same value may be insignificant in another context.

---

## Interaction with Other Components

The Guardian informs almost every later stage.

Representative Paths should preserve awareness of protected values.

Steelman arguments should acknowledge the values they preserve and the values they sacrifice.

The Presentation Engine should communicate those tensions clearly.

---

## Design Rationale

Most optimisation processes implicitly assume that the objective function captures everything that matters.

Real decisions rarely behave this way.

Important human values frequently remain unstated.

The Guardian exists to make those values explicit before optimisation proceeds.

---

## Alternatives Considered

### Embed values inside every component

Rejected.

Responsibility becomes duplicated.

Protected values become inconsistent.

---

### Ignore subjective values

Rejected.

Many important decisions are dominated by considerations that cannot be expressed numerically.

---

### Treat values as preferences

Rejected.

Preferences describe what someone wants.

Protected values describe what should not be lost without conscious acknowledgement.

These concepts are related but not equivalent.

---

## Consequences

The Guardian enables:

✓ explicit trade-offs

✓ conscious sacrifice

✓ preservation of important values

✓ richer human reasoning

✓ greater transparency

while preventing:

✗ accidental value loss

✗ hidden optimisation

✗ purely financial reasoning

✗ invisible personal costs

---

## Future Evolution

Future versions of the Guardian may support:

- value hierarchies
- conflicting value networks
- long-term value drift
- organisational values
- shared family values
- ethical frameworks

These extensions should improve value modelling while preserving the Guardian's central responsibility.

That responsibility remains unchanged.

> **Identify what must not be unintentionally sacrificed.**



# Chapter 10 – Pragmatist

## Key Question

> **What must be true before this decision can succeed?**

---

## Purpose

The Pragmatist is responsible for identifying the practical conditions that determine whether a decision is realistically achievable.

Many attractive decisions fail, not because they are undesirable, but because essential requirements have not been met.

The Pragmatist therefore focuses on feasibility rather than desirability.

It asks not whether a course of action should be chosen, but whether it could reasonably succeed.

---

## Responsibilities

The Pragmatist is responsible for:

- identifying practical requirements
- recognising missing prerequisites
- distinguishing assumptions from verified conditions
- exposing operational constraints
- identifying dependencies that determine success

The Pragmatist deliberately avoids making recommendations.

Its responsibility is to define the conditions under which success becomes possible.

---

## Inputs

The Pragmatist receives:

- the current Decision Landscape
- contextual information
- known commitments
- governing objectives

From these it derives the practical requirements necessary for execution.

---

## Outputs

The Pragmatist contributes structured semantic information describing:

- practical requirements
- dependencies
- feasibility constraints
- operational considerations

These become part of the Decision Model.

---

## Semantic Ownership

The Pragmatist owns semantic information relating to feasibility.

It determines what conditions must exist before meaningful action becomes possible.

Other components may identify new constraints.

Only the Pragmatist determines whether those constraints represent operational requirements.

---

## Requirements

A requirement is something that must be satisfied before a representative path can realistically succeed.

Examples include:

- sufficient funding
- regulatory approval
- appropriate skills
- available time
- physical capability
- seller verification
- warranty confirmation
- legal compliance

Requirements are descriptive.

They are not recommendations.

---

## Dependencies

Many requirements depend upon earlier conditions.

For example:

Funding

↓

Purchase

↓

Installation

↓

Use

The Pragmatist therefore recognises dependency chains without attempting to optimise them.

---

## Feasibility

Feasibility is binary in principle.

Either the necessary conditions exist, or they do not.

Probability belongs elsewhere.

Preference belongs elsewhere.

The Pragmatist simply establishes whether the foundations required for success are present.

---

## Design Principles

### Separate possibility from desirability

A desirable decision may be impossible.

An undesirable decision may be entirely feasible.

These questions should remain independent.

---

### Identify requirements explicitly

Hidden requirements frequently become the source of later failure.

The Pragmatist therefore exposes them before commitment occurs.

---

### Preserve neutrality

Requirements should be described without implying whether they are likely to be satisfied.

The component describes conditions.

It does not forecast outcomes.

---

### Practical truth over theoretical possibility

The Pragmatist is concerned with reality.

Not merely logical possibility.

If success depends upon conditions that are unlikely ever to exist, those conditions should remain explicit.

---

## Interaction with Other Components

The Pragmatist informs several later stages.

Auditor evaluates whether sufficient evidence exists to support identified requirements.

Clarifier may seek information that resolves feasibility.

Representative Paths depend upon feasibility constraints.

Event Horizon identifies the point at which practical commitments become irreversible.

---

## Design Rationale

Many reasoning systems assume that once an attractive option has been identified, execution naturally follows.

Experience suggests otherwise.

Practical failure is one of the most common reasons that apparently good decisions produce poor outcomes.

The Pragmatist therefore exists to expose execution requirements before commitment occurs.

---

## Alternatives Considered

### Merge with Guardian

Rejected.

Guardian protects values.

Pragmatist identifies operational requirements.

These are distinct responsibilities.

---

### Merge with Auditor

Rejected.

Auditor evaluates evidence.

Pragmatist identifies conditions.

Evidence and feasibility should remain independent.

---

### Treat feasibility as risk

Rejected.

Risk concerns uncertain outcomes.

Feasibility concerns preconditions.

The concepts are related but not equivalent.

---

## Consequences

The Pragmatist enables:

✓ explicit execution requirements

✓ clearer dependency chains

✓ improved feasibility analysis

✓ stronger representative paths

✓ better clarification questions

while preventing:

✗ unrealistic planning

✗ hidden prerequisites

✗ execution assumptions

✗ impractical recommendations

---

## Future Evolution

Future versions of the Pragmatist may support:

- dependency graphs
- resource modelling
- scheduling constraints
- probabilistic feasibility
- organisational capability analysis
- execution sequencing

These extensions should deepen practical reasoning while preserving the Pragmatist's central responsibility.

That responsibility remains unchanged.

> **Identify what must be true before success becomes possible.**



# Chapter 11 – Empathiser

## Key Question

> **How does this decision affect the people involved?**

---

## Purpose

The Empathiser is responsible for identifying the human consequences of a decision.

Every significant decision affects people.

Sometimes those people are obvious.

Sometimes they are not.

The Empathiser ensures that the reasoning process recognises the emotional, psychological and interpersonal dimensions of a decision alongside its practical and financial characteristics.

Human impact is therefore treated as a legitimate component of reasoning rather than as an afterthought.

---

## Responsibilities

The Empathiser is responsible for:

- identifying the people affected by a decision
- recognising emotional pressures
- exposing psychological influences
- identifying relationship impacts
- recognising competing human needs
- preserving human context throughout the reasoning process

The Empathiser does not determine whether those impacts justify a particular decision.

Its responsibility is to ensure they are visible.

---

## Inputs

The Empathiser receives:

- the current Decision Landscape
- user context
- governing objective
- known stakeholders

From these it derives the principal human dimensions of the decision.

---

## Outputs

The Empathiser contributes structured semantic information describing:

- stakeholders
- human factors
- emotional pressures
- interpersonal consequences
- psychological influences

These become part of the Decision Model.

---

## Semantic Ownership

The Empathiser owns semantic information relating to human experience.

Other components may reveal information that has human implications.

Only the Empathiser determines how those implications should be represented within the Decision Model.

---

## Stakeholders

Every decision affects one or more stakeholders.

Examples include:

- the decision maker
- family members
- colleagues
- customers
- employers
- business partners
- communities

The Empathiser identifies these stakeholders explicitly whenever they materially influence the decision.

---

## Human Factors

Human factors represent influences that cannot be understood purely through financial or logical analysis.

Examples include:

- fear of loss
- excitement
- scarcity pressure
- regret
- burnout
- motivation
- confidence
- identity
- trust

These factors are descriptive.

They are neither irrational nor secondary.

They are part of reality.

---

## Emotional Pressure

Many decisions occur under emotional pressure.

Examples include:

- urgency
- guilt
- fear of missing out
- loyalty
- frustration
- grief
- optimism

The Empathiser records these pressures without assuming they are either beneficial or harmful.

Their existence alone is valuable information.

---

## Human Consequences

Some decisions change relationships.

Others change wellbeing.

Others influence identity.

These consequences often remain invisible in traditional decision analysis despite being among the most important outcomes.

The Empathiser therefore treats human consequence as a first-class semantic concept.

---

## Design Principles

### Human experience is evidence

Feelings should not replace evidence.

Neither should they be ignored.

Human experience is itself evidence about the decision.

---

### Describe rather than judge

The Empathiser identifies emotional realities.

It does not determine whether they are justified.

---

### Preserve stakeholder diversity

Different people often experience the same decision differently.

The Empathiser preserves these differences rather than collapsing them into a single viewpoint.

---

### Avoid false objectivity

Many important human effects cannot be measured precisely.

The absence of numerical precision should not prevent them from being represented.

---

## Interaction with Other Components

The Empathiser complements several components.

Guardian may identify values that stakeholders wish to preserve.

Pragmatist may identify practical constraints affecting people.

Clarifier may reveal previously hidden human concerns.

Steelman should acknowledge both the benefits and costs experienced by different stakeholders.

The Presentation Engine should communicate these impacts faithfully.

---

## Design Rationale

Important decisions are rarely made within purely logical systems.

They occur within families, organisations and communities.

Ignoring human experience produces incomplete reasoning.

The Empathiser therefore exists to ensure that the Decision Model reflects the human reality of the decision rather than merely its technical characteristics.

---

## Alternatives Considered

### Ignore emotional factors

Rejected.

Human decisions cannot be understood fully without understanding the people making them.

---

### Merge with Guardian

Rejected.

Guardian protects values.

Empathiser represents human experience.

Although related, these responsibilities are distinct.

---

### Treat emotional factors as bias

Rejected.

Some emotional influences represent distortion.

Others represent legitimate human priorities.

The Empathiser records rather than judges.

---

## Consequences

The Empathiser enables:

✓ richer human reasoning

✓ explicit stakeholder awareness

✓ improved understanding of personal trade-offs

✓ more faithful representation of complex decisions

✓ greater transparency of emotional pressures

while preventing:

✗ purely mechanical decision analysis

✗ invisible stakeholder impacts

✗ hidden emotional pressures

✗ incomplete representations of real-world decisions

---

## Future Evolution

Future versions of the Empathiser may support:

- stakeholder mapping
- competing stakeholder priorities
- long-term wellbeing analysis
- organisational culture
- family systems
- behavioural science models

These extensions should improve the representation of human experience while preserving the Empathiser's central responsibility.

That responsibility remains unchanged.

> **Represent how the decision affects the people involved.**


# Chapter 12 – Auditor

## Key Question

> **How confident should we be in our current understanding?**

---

## Purpose

The Auditor is responsible for evaluating the quality and completeness of the reasoning process.

Unlike other reasoning components, the Auditor does not examine the decision itself.

Instead, it examines the understanding of the decision.

Its purpose is to determine whether the Decision Model is sufficiently complete and well-supported for meaningful reasoning to continue.

The Auditor therefore provides meta-reasoning.

It reasons about the reasoning.

---

## Responsibilities

The Auditor is responsible for:

- evaluating evidential quality
- identifying unsupported assumptions
- identifying missing information
- identifying unresolved blocking uncertainties
- evaluating internal consistency
- estimating reasoning readiness

The Auditor does not improve the reasoning.

It evaluates its current quality.

---

## Inputs

The Auditor receives:

- the current Decision Model
- outputs from all previous reasoning components
- known assumptions
- identified uncertainties

It evaluates the state of the reasoning rather than the original prompt.

---

## Outputs

The Auditor contributes structured semantic information describing:

- evidence strength
- assumptions
- missing information
- blocking uncertainties
- supported conclusions
- unsupported conclusions
- internal consistency
- readiness

These become part of the Decision Model.

---

## Semantic Ownership

The Auditor owns all semantic information relating to confidence.

No other component should determine:

- evidence quality
- reasoning readiness
- internal consistency

Those concepts belong exclusively to the Auditor.

---

## Evidence Strength

The Auditor evaluates the quality of evidence supporting the current understanding.

Evidence strength is independent of presentation.

It reflects the confidence that the current Decision Model deserves.

Evidence strength should never be increased merely because the resulting explanation appears persuasive.

---

## Assumptions

Every reasoning process contains assumptions.

Some are explicit.

Others are implicit.

The Auditor identifies assumptions so that users understand where conclusions depend upon information that has not been verified.

Assumptions are not considered defects.

Hidden assumptions are.

---

## Missing Information

The Auditor identifies information that would materially improve the quality of reasoning.

Missing information differs from curiosity.

Only information capable of changing the decision should be recorded.

This distinction prevents unnecessary investigation while ensuring that important gaps remain visible.

---

## Blocking Uncertainties

Some uncertainty merely reduces confidence.

Other uncertainty prevents meaningful progress.

The Auditor distinguishes between the two.

Blocking uncertainties become candidates for Clarification.

Non-blocking uncertainty remains visible without interrupting the reasoning process.

---

## Supported Conclusions

The Auditor records conclusions that are justified by the available evidence.

Support depends upon the current Decision Model rather than upon presentation.

A conclusion is supported because the evidence justifies it.

Not because it sounds convincing.

---

## Unsupported Conclusions

The Auditor also records conclusions that should **not** yet be drawn.

Examples include:

- recommendations
- safety claims
- predictions
- certainty beyond available evidence

Recording unsupported conclusions prevents later presentation from accidentally overstating the reasoning.

---

## Internal Consistency

The Auditor evaluates whether the Decision Model remains internally coherent.

For example:

- do Representative Paths align with the Landscape?
- do assumptions contradict evidence?
- have resolved uncertainties actually been resolved?
- do component outputs agree with one another?

Internal consistency concerns semantic integrity rather than factual correctness.

---

## Readiness

The Auditor estimates whether reasoning has progressed sufficiently for meaningful presentation.

Readiness does not measure correctness.

It measures completeness.

Low readiness suggests additional reasoning or clarification would materially improve the Decision Model.

High readiness suggests presentation may proceed.

---

## Design Principles

### Confidence belongs to evidence

Confidence should arise from evidence.

Never from fluent language.

---

### Evaluate rather than repair

The Auditor identifies weaknesses.

It does not correct them.

Repair belongs elsewhere.

---

### Explicit uncertainty is healthier than false certainty

The Auditor prefers an honest "unknown" to an unjustified conclusion.

---

### Meta-reasoning

The Auditor reasons about the reasoning process itself.

This distinguishes it from every other reasoning component.

---

## Interaction with Other Components

The Auditor evaluates outputs produced by every preceding component.

Its findings directly influence the Clarifier.

Blocking uncertainties identified by the Auditor become candidates for clarification.

Presentation Engines should faithfully communicate Auditor confidence without modification.

---

## Design Rationale

Without independent evaluation, reasoning systems naturally become overconfident.

The Auditor introduces deliberate scepticism.

Its purpose is not to challenge every conclusion.

Its purpose is to ensure that confidence remains proportional to evidence.

---

## Alternatives Considered

### Merge with Clarifier

Rejected.

Clarifier improves understanding.

Auditor evaluates understanding.

These are distinct responsibilities.

---

### Merge with Guardian

Rejected.

Guardian protects values.

Auditor evaluates evidence.

---

### Implicit confidence

Rejected.

Confidence should exist explicitly within the Decision Model.

Presentation should never infer confidence from wording.

---

## Consequences

The Auditor enables:

✓ explicit confidence

✓ measurable reasoning quality

✓ semantic validation

✓ targeted clarification

✓ evidence-aware presentation

while preventing:

✗ false certainty

✗ unsupported recommendations

✗ hidden assumptions

✗ presentation-driven confidence

---

## Future Evolution

Future versions of the Auditor may support:

- probabilistic confidence

- evidence provenance

- contradiction analysis

- confidence calibration

- source reliability

- automated semantic validation

These enhancements should deepen evaluation while preserving the Auditor's central responsibility.

That responsibility remains unchanged.

> **Evaluate the quality of the reasoning rather than the decision itself.**

The Auditor is the only component that reasons about the quality of the Decision Model itself rather than the decision being modelled.



Chapter 13 – Clarifier
Key Question

What single question would most improve our understanding of this decision?

Purpose

The Clarifier is responsible for reducing uncertainty by identifying the single question whose answer would produce the greatest improvement in the Decision Model.

Rather than attempting to gather all possible information, the Clarifier seeks the highest-value clarification.

This ensures that interaction with the user remains focused, efficient and purposeful.

The Clarifier therefore acts as the interface through which new information enters the reasoning process.

Responsibilities

The Clarifier is responsible for:

identifying blocking uncertainties
selecting the highest-value clarification
isolating the uncertainty to be resolved
constructing an appropriate question
explaining why that question matters

The Clarifier deliberately avoids collecting information that is merely interesting.

Its purpose is to improve understanding rather than accumulate information.

Inputs

The Clarifier receives:

the current Decision Model
Auditor findings
unresolved uncertainties
the current Decision Landscape

From these it determines where the greatest improvement in understanding can be achieved.

Outputs

The Clarifier contributes structured semantic information describing:

clarification target
clarification method
clarification question
rationale

These become part of the Decision Model.

Semantic Ownership

The Clarifier owns semantic information relating to clarification strategy.

It determines:

which uncertainty should be addressed
why that uncertainty matters
how clarification should be requested

The user's response belongs to the Clarifier Response component.

Clarification Target

Every clarification should have an explicit target.

Examples include:

purchase willingness
financial constraint
legal uncertainty
stakeholder preference
operational capability

The target represents the uncertainty being reduced rather than the wording of the question itself.

Clarification Method

Different uncertainties require different clarification strategies.

Examples include:

isolation
comparison
prioritisation
confirmation
decomposition

The method describes the reasoning strategy rather than the wording presented to the user.

Clarification Question

The question should remove as much uncertainty as possible while introducing as little additional complexity as possible.

Good clarification questions are:

specific
answerable
decision-relevant
neutral

Questions should not attempt to persuade the user.

Their purpose is to improve the Decision Model.

Rationale

Every clarification should explain why it was selected.

The rationale describes the expected improvement to the Decision Model if the uncertainty is resolved.

This allows both engineers and users to understand why a particular question was considered valuable.

Design Principles
Ask one important question

One excellent clarification is usually more valuable than many mediocre ones.

The Clarifier therefore optimises for information value rather than question count.

Clarification should be purposeful

Every question should have a clear semantic objective.

Questions without a measurable impact on the Decision Model should not be asked.

Prefer revealed preferences where appropriate

Where practical, clarification should seek to reveal the preferences that actually govern the decision rather than relying solely on stated preferences.

This is often achieved by presenting a constrained scenario in which unrelated uncertainties have been removed.

For example, rather than asking whether a user wishes to purchase an item, the Clarifier may first isolate concerns such as legitimacy, condition or warranty.

The resulting answer reveals the remaining uncertainty more directly than a broad question would.

Use isolation to remove confounding variables

Where multiple uncertainties exist simultaneously, the Clarifier should, where possible, isolate the uncertainty being investigated.

Removing unrelated concerns allows the resulting answer to be interpreted more reliably.

Isolation improves the semantic quality of the clarification without changing the underlying decision.

Preserve neutrality

Questions should avoid leading the user toward any particular conclusion.

The wording should minimise bias while maximising clarity.

Improve understanding

The objective is not to complete a questionnaire.

The objective is to improve the Decision Model.

Interaction with Other Components

The Clarifier is driven primarily by the Auditor.

Blocking uncertainties identified by the Auditor become candidates for clarification.

The user's response is incorporated into the Decision Model through the Clarifier Response component.

The updated Decision Model may then alter the Decision Landscape and subsequent reasoning.

Design Rationale

Human attention is limited.

Decision Workspace therefore seeks to maximise the value obtained from every interaction.

Selecting the highest-value clarification allows the engine to improve understanding without overwhelming the user.

Alternatives Considered
Ask every missing question

Rejected.

This produces questionnaires rather than focused reasoning.

Random clarification

Rejected.

Questions should be chosen because they materially improve the Decision Model.

User-selected clarification

Rejected.

Users cannot always know which unanswered question will most improve the current understanding.

The Reasoning Engine therefore selects the clarification target.

Consequences

The Clarifier enables:

✓ focused interaction

✓ efficient reasoning

✓ iterative refinement of the Decision Model

✓ revealed preferences where appropriate

✓ isolation of individual uncertainties

while preventing:

✗ unnecessary questioning

✗ information overload

✗ multiple unresolved uncertainties being tested simultaneously

✗ clarification without a semantic objective

Future Evolution

Future versions of the Clarifier may support:

adaptive clarification strategies
multiple clarification methods
clarification planning across several interactions

These enhancements should improve clarification while preserving the Clarifier's central responsibility.

That responsibility remains unchanged.

Identify the single question whose answer would most improve the Decision Model.


Chapter 14 – Clarifier Response
Key Question

What did we learn from the clarification?

Purpose

The Clarifier Response is responsible for recording the semantic effect of the user's answer.

Its purpose is not to preserve conversation.

Its purpose is to preserve meaning.

The Clarifier asked a question because resolving a particular uncertainty would improve the Decision Model.

The Clarifier Response records whether that improvement occurred.

Responsibilities

The Clarifier Response is responsible for:

recording the user's answer
identifying the semantic effect of that answer
updating the Decision Model
recording which uncertainty has been resolved
preserving any remaining uncertainty

The Clarifier Response does not reinterpret the answer.

It records its semantic consequence.

Inputs

The Clarifier Response receives:

the Clarifier
the user's answer
the current Decision Model
Outputs

The Clarifier Response contributes structured semantic information describing:

the answer
the semantic effect
the updated uncertainty state

These become part of the Decision Model.

Semantic Ownership

The Clarifier Response owns the semantic consequences of clarification.

The Clarifier owns the question.

The Clarifier Response owns the effect of the answer.

No other component should determine whether the clarification achieved its objective.

Answer

The user's answer should be preserved accurately.

The Decision Model should distinguish between:

the user's words

and

the semantic interpretation of those words.

This prevents presentation from becoming the canonical representation.

Effect

The principal output of the Clarifier Response is the semantic effect.

Examples include:

purchase willingness resolved
financial constraint confirmed
stakeholder preference clarified
operational dependency removed

The effect records what changed in the Decision Model.

It does not merely repeat the user's answer.

Updating the Decision Model

Clarification should modify only those semantic elements affected by the answer.

For example:

Decision Landscape V1

↓

Clarifier

↓

Clarifier Response

↓

Decision Landscape V2

Only the clarified uncertainty should change.

Other parts of the Decision Model should remain stable.

Remaining Uncertainty

Clarification does not necessarily eliminate uncertainty.

A response may:

resolve the uncertainty
reduce it
replace it with a different uncertainty
reveal a deeper uncertainty

The Clarifier Response should record the actual outcome rather than assuming successful resolution.

Design Principles
Preserve meaning

The important output is not the user's sentence.

It is the semantic consequence of that sentence.

Minimise interpretation

Interpretation should be limited to the uncertainty targeted by the Clarifier.

The component should avoid drawing additional conclusions from the response.

Local change

Clarification should produce the smallest necessary modification to the Decision Model.

Avoid unnecessary changes to unrelated semantic structures.

Explicit state transition

The Clarifier Response should make it possible to understand how the Decision Model changed because of the clarification.

Interaction with Other Components

The Clarifier Response follows the Clarifier.

Its output may update:

the Decision Landscape
unresolved uncertainties
Auditor readiness
Representative Paths

Subsequent reasoning proceeds using the updated Decision Model.

Design Rationale

Separating the question from the response creates a clearer reasoning architecture.

The Clarifier identifies what should be asked.

The Clarifier Response records what was learned.

This separation improves traceability and makes the evolution of the Decision Model explicit.

Alternatives Considered
Merge with Clarifier

Rejected.

Questions and answers represent different semantic concepts.

Keeping them separate makes the reasoning process easier to understand and validate.

Store conversation only

Rejected.

Conversation is presentation.

The Decision Model should preserve semantic change.

Re-run the entire Reasoning Engine

Rejected.

Only the affected semantic structures should change.

The remainder of the Decision Model should remain stable.

Consequences

The Clarifier Response enables:

✓ explicit semantic updates

✓ traceable reasoning

✓ incremental evolution of the Decision Model

✓ separation of questions from answers

while preventing:

✗ conversational history becoming semantic structure

✗ hidden changes to the Decision Model

✗ unnecessary re-analysis

✗ ambiguity regarding what clarification achieved

Future Evolution

Future versions of the Clarifier Response may support:

confidence associated with responses
partial clarification
contradictory responses
clarification history

These enhancements should improve traceability while preserving the component's central responsibility.

That responsibility remains unchanged.

Record what the clarification changed in the Decision Model.



# Chapter 15 – Representative Paths

## Key Question

> **What are the meaningful alternatives available to the decision maker?**

---

## Purpose

Representative Paths are responsible for identifying the principal alternatives available within the current Decision Landscape.

The objective is not to enumerate every possible action.

Instead, Representative Paths identify the distinct futures that materially differ from one another.

These paths provide the foundation upon which later reasoning is performed.

---

## Responsibilities

Representative Paths are responsible for:

- identifying the principal alternatives
- describing the commitments associated with each path
- recording the conditions required for each path
- recording the immediate consequence of choosing each path

Representative Paths do not evaluate alternatives.

They simply define them.

---

## Inputs

Representative Paths receive:

- the current Decision Landscape
- the governing objective
- clarified uncertainties
- practical constraints

The Landscape provides the context from which meaningful alternatives emerge.

---

## Outputs

Representative Paths contribute structured semantic information describing:

- path identifier
- path title
- required conditions
- commitments
- immediate outcome

These become part of the Decision Model.

---

## Semantic Ownership

Representative Paths own the semantic definition of the available alternatives.

Later components may analyse those paths.

They should not redefine them.

---

## Representative Rather Than Exhaustive

Representative Paths are not intended to describe every conceivable choice.

Many decisions contain hundreds of possible actions.

Only a small number represent genuinely different directions.

The purpose of Representative Paths is to capture those distinct directions while avoiding unnecessary duplication.

---

## Path Identity

Each path represents a coherent future.

A path should remain internally consistent.

Minor implementation differences should not create separate Representative Paths unless they materially alter the nature of the decision.

---

## Commitments

Every Representative Path carries commitments.

These commitments describe what becomes necessary if that path is chosen.

Examples include:

- financial commitments
- time commitments
- contractual commitments
- relationship commitments

Commitments describe what the path requires.

They do not judge whether those commitments are desirable.

---

## Required Conditions

Each path records the conditions that must be satisfied before it can realistically proceed.

These conditions often originate from the Pragmatist.

Representative Paths preserve those conditions without re-evaluating them.

---

## Immediate Outcome

Each path records its immediate consequence.

Examples include:

- ownership acquired
- capital retained
- employment accepted
- business created

The immediate outcome describes what changes when the path is entered.

Long-term consequences belong to later reasoning.

---

## Design Principles

### Represent distinct futures

Representative Paths should differ in meaningful ways.

Minor variations should not become separate paths.

---

### Preserve neutrality

Representative Paths define alternatives.

They do not recommend them.

---

### One path, one future

Each path should describe one internally consistent future.

Combining incompatible outcomes reduces clarity.

---

### Stable identity

Once created, a Representative Path should retain its identity throughout the remainder of the reasoning process.

Later components analyse the path rather than reconstruct it.

---

## Interaction with Other Components

Representative Paths emerge from the Decision Landscape.

They provide the foundation for:

- Event Horizon
- Establishing Shot
- Steelman

These later components reason about the paths rather than redefining them.

---

## Design Rationale

Meaningful comparison requires clearly defined alternatives.

Representative Paths provide a stable representation of those alternatives before deeper reasoning begins.

Separating path construction from path evaluation produces a cleaner architecture.

---

## Alternatives Considered

### Enumerate every possible option

Rejected.

Most decisions contain many variations that do not materially change the decision.

Representative reasoning benefits from clarity rather than completeness.

---

### Construct paths during Steelman

Rejected.

Steelman should analyse existing paths rather than defining them.

---

### Embed paths within the Decision Landscape

Rejected.

The Landscape represents the structure of the decision.

Representative Paths represent the principal alternatives within that structure.

These are related but distinct concepts.

---

## Consequences

Representative Paths enable:

✓ stable alternatives

✓ clearer comparison

✓ consistent downstream reasoning

✓ reusable path definitions

while preventing:

✗ duplicated alternatives

✗ changing path definitions

✗ evaluation occurring before alternatives exist

✗ unnecessary complexity

---

## Future Evolution

Future versions of Representative Paths may support:

- hierarchical paths

- conditional paths

- probabilistic paths

- branching paths

- merged paths

These enhancements should improve the representation of alternatives while preserving the component's central responsibility.

That responsibility remains unchanged.

> **Identify the meaningful alternatives available to the decision maker.**



# Chapter 16 – Event Horizon

## Key Question

> **At what point does this stop being a decision?**

---

## Purpose

The Event Horizon is responsible for identifying the point at which a representative path becomes materially irreversible.

Every decision contains a period during which alternatives remain available.

Eventually a commitment is made beyond which returning to the previous state becomes impossible or materially more costly.

The Event Horizon identifies that transition.

Its purpose is not to discourage commitment.

Its purpose is to make the moment of commitment explicit.

---

## Responsibilities

The Event Horizon is responsible for:

- identifying the commitment that changes the nature of the decision
- recording the conditions under which the commitment becomes irreversible
- distinguishing evaluation from execution
- identifying the transition between reversible and irreversible states

The Event Horizon does not determine whether commitment should occur.

It identifies where commitment occurs.

---

## Inputs

The Event Horizon receives:

- Representative Paths
- practical commitments
- known conditions
- current Decision Landscape

---

## Outputs

The Event Horizon contributes structured semantic information describing:

- triggering event
- irreversible conditions
- semantic transition

These become part of the Decision Model.

---

## Semantic Ownership

The Event Horizon owns the semantic definition of irreversibility.

Other components may identify commitments.

Only the Event Horizon determines when those commitments fundamentally change the nature of the decision.

---

## Trigger

Every Event Horizon begins with a triggering event.

Examples include:

- contract signed
- exchange of funds
- resignation submitted
- offer accepted
- product opened beyond return conditions

The trigger identifies the action that changes the decision from evaluation into commitment.

---

## Irreversible Conditions

Many decisions remain reversible for a period after the initial action.

The Event Horizon records the conditions under which meaningful reversal is no longer possible.

Examples include:

- return period expires
- cooling-off period ends
- contractual obligation begins
- financial commitment cannot be recovered

These conditions define the boundary beyond which the decision has fundamentally changed.

---

## Transition

The principal output of the Event Horizon is the semantic transition.

Examples include:

- evaluation → ownership
- consideration → employment
- planning → execution
- investment → committed capital

The transition records the change in the nature of the decision rather than the mechanics of the action.

---

## Design Principles

### Identify the boundary

The Event Horizon identifies the boundary between considering and committing.

It does not analyse what lies on either side.

---

### Preserve neutrality

The Event Horizon neither encourages nor discourages commitment.

It records where commitment occurs.

---

### Commitment is contextual

Different decisions become irreversible in different ways.

The Event Horizon should be derived from the decision itself rather than from predefined templates.

---

### Record semantic change

The important output is not the physical action.

It is the change in the state of the decision.

---

## Interaction with Other Components

The Event Horizon follows Representative Paths.

It provides context for:

- Establishing Shot
- Steelman
- Presentation Engines

Later reasoning should recognise when a representative path has crossed from evaluation into commitment.

---

## Design Rationale

Many poor decisions result not from commitment itself but from failing to recognise when commitment has already occurred.

Making the point of irreversibility explicit improves the user's understanding of the decision without altering the decision itself.

---

## Alternatives Considered

### Ignore irreversibility

Rejected.

The point of commitment is often one of the most significant features of a decision.

---

### Treat commitment as a practical requirement

Rejected.

Practical requirements describe feasibility.

The Event Horizon describes transition.

These are distinct concepts.

---

### Merge with Representative Paths

Rejected.

Representative Paths define alternatives.

The Event Horizon defines when those alternatives cease to remain alternatives.

---

## Consequences

The Event Horizon enables:

✓ explicit recognition of commitment

✓ clearer understanding of irreversible decisions

✓ improved transition between reasoning and execution

✓ richer presentation of decision flow

while preventing:

✗ hidden commitment

✗ ambiguity regarding reversibility

✗ confusion between consideration and execution

✗ loss of temporal structure

---

## Future Evolution

Future versions of the Event Horizon may support:

- multiple commitment stages

- reversible commitment windows

- partial commitment

- dependency between Event Horizons

These enhancements should improve modelling of commitment while preserving the component's central responsibility.

That responsibility remains unchanged.

> **Identify where evaluation ends and commitment begins.**



# Chapter 17 – Establishing Shot

## Key Question

> **From what viewpoint should each representative path be understood?**

---

## Purpose

The Establishing Shot is responsible for creating a consistent semantic viewpoint from which each Representative Path can be examined.

Before alternatives can be compared fairly, they must first be understood within their own context.

The Establishing Shot therefore defines the initial perspective for each path.

Its purpose is not to persuade.

Its purpose is to establish orientation.

---

## Responsibilities

The Establishing Shot is responsible for:

- establishing the initial viewpoint for each Representative Path
- providing sufficient context for later comparison
- ensuring each path begins from an equivalent semantic position
- preserving neutrality between alternatives

The Establishing Shot does not evaluate paths.

It prepares them for evaluation.

---

## Inputs

The Establishing Shot receives:

- Representative Paths
- the current Decision Landscape
- Event Horizon

---

## Outputs

The Establishing Shot contributes structured semantic information describing:

- the path being viewed
- the initial semantic perspective
- contextual orientation

These become part of the Decision Model.

---

## Semantic Ownership

The Establishing Shot owns the semantic viewpoint from which a Representative Path is first understood.

It does not own:

- the path itself
- the evaluation of the path
- the arguments supporting the path

Those belong to other components.

---

## Orientation

Every Representative Path should begin from a position of understanding.

The Establishing Shot provides enough context that the path can be examined without requiring the reader to reconstruct the decision from scratch.

It answers the implicit question:

> "Where are we now?"

before later reasoning asks:

> "Where could this lead?"

---

## Consistency

Each Representative Path should be introduced using an equivalent level of semantic detail.

Providing significantly more context for one path than another risks introducing unintended bias.

Consistency therefore improves fairness of comparison.

---

## Neutrality

The Establishing Shot should not imply that one Representative Path is preferable to another.

Its role is to orient.

Not to persuade.

---

## Design Principles

### Context before evaluation

Understanding should precede judgement.

Every Representative Path should first be understood before arguments are constructed.

---

### Equal treatment

Each Representative Path deserves an equivalent introduction.

Differences in later reasoning should arise from the paths themselves rather than unequal presentation.

---

### Semantic orientation

The Establishing Shot contributes meaning.

It is not a narrative introduction.

Presentation Engines remain free to communicate that meaning in many different ways.

---

### Preserve independence

The Establishing Shot should avoid anticipating conclusions that belong to Steelman or later presentation.

---

## Interaction with Other Components

The Establishing Shot follows Event Horizon.

It prepares Representative Paths for Steelman.

Presentation Engines may choose to render the Establishing Shot explicitly or incorporate it naturally into later narrative.

The semantic information, however, remains part of the Decision Model regardless of presentation style.

---

## Design Rationale

Comparisons are only meaningful when alternatives are understood from equivalent starting points.

The Establishing Shot provides this common orientation while remaining independent of later evaluation.

Separating orientation from argument produces a cleaner reasoning architecture.

---

## Alternatives Considered

### Begin directly with Steelman

Rejected.

Arguments are easier to understand when the path has first been established.

---

### Merge with Representative Paths

Rejected.

Representative Paths define alternatives.

The Establishing Shot defines the viewpoint from which those alternatives are initially understood.

---

### Treat orientation as presentation

Rejected.

Although the term originates from filmmaking, the semantic orientation belongs to reasoning.

Presentation determines how that orientation is expressed, not whether it exists.

---

## Consequences

The Establishing Shot enables:

✓ consistent comparison

✓ fair treatment of alternatives

✓ clearer downstream reasoning

✓ improved separation between orientation and evaluation

while preventing:

✗ unequal treatment of paths

✗ premature argument

✗ presentation bias entering the Reasoning Engine

✗ inconsistent semantic viewpoints

---

## Future Evolution

Future versions of the Establishing Shot may support:

- multiple semantic viewpoints

- stakeholder-specific orientation

- temporal viewpoints

- alternative framing strategies

These enhancements should improve orientation while preserving the Establishing Shot's central responsibility.

That responsibility remains unchanged.

> **Provide a consistent semantic viewpoint from which each Representative Path can be understood.**



# Chapter 18 – Steelman

## Key Question

> **What is the strongest legitimate case for this Representative Path?**

---

## Purpose

The Steelman is responsible for constructing the strongest legitimate argument for each Representative Path.

Every Representative Path should be understood under its best reasonable interpretation.

Weak arguments should not be compared with strong ones.

Instead, each path should be represented as fairly and accurately as possible before comparison takes place.

The Steelman therefore seeks understanding rather than persuasion.

---

## Responsibilities

The Steelman is responsible for:

- constructing the strongest legitimate case for each Representative Path
- identifying the objective pursued by the path
- identifying the conditions under which the path succeeds
- ensuring every path receives equivalent intellectual treatment

The Steelman does not recommend a path.

It strengthens understanding of each path independently.

---

## Inputs

The Steelman receives:

- Representative Paths
- Decision Landscape
- Guardian outputs
- Pragmatist outputs
- Empathiser outputs
- Auditor outputs

These provide the semantic material from which the strongest legitimate case can be constructed.

---

## Outputs

The Steelman contributes structured semantic information describing:

- path identifier
- objective
- supporting conditions

These become part of the Decision Model.

---

## Semantic Ownership

The Steelman owns the strongest legitimate interpretation of each Representative Path.

It does not own:

- the path itself
- recommendations
- rankings
- final decisions

Those belong elsewhere.

---

## Objective

Every Representative Path exists because it attempts to achieve something.

The Steelman identifies that objective explicitly.

Examples include:

- preserve financial flexibility
- capture exceptional value
- reduce uncertainty
- maximise long-term growth
- minimise operational complexity

The objective explains why a rational person might choose the path.

---

## Supporting Conditions

Every argument depends upon conditions.

The Steelman identifies the conditions under which the Representative Path becomes compelling.

Examples include:

- assumptions hold
- practical requirements are satisfied
- protected values remain acceptable
- identified risks remain within tolerance

The supporting conditions explain when the argument is strongest.

---

## Fair Representation

Every Representative Path should receive equivalent intellectual effort.

The purpose is not to prove that every path is equally attractive.

The purpose is to ensure that each path is understood under its strongest legitimate interpretation.

---

## Design Principles

### Strengthen before comparing

Alternatives should first be understood at their strongest.

Comparison comes afterwards.

---

### Preserve legitimacy

Arguments should remain consistent with the Decision Model.

The Steelman must not invent supporting evidence or ignore recognised constraints.

---

### Equal treatment

Every Representative Path deserves equivalent analytical effort.

No path should receive preferential treatment.

---

### Separate argument from recommendation

Constructing the strongest case for a path does not imply endorsement.

The Steelman exists to improve understanding rather than influence choice.

---

## Interaction with Other Components

The Steelman depends upon the semantic information produced by previous reasoning components.

It does not modify those components.

Instead, it organises them into the strongest coherent case for each Representative Path.

Presentation Engines may later communicate these arguments in different styles while preserving their semantic content.

---

## Design Rationale

Meaningful comparison requires each alternative to be represented fairly.

Without Steelman reasoning, weak arguments may be rejected simply because they have been expressed poorly.

The Steelman reduces this source of bias by ensuring that every Representative Path is considered under its strongest legitimate interpretation.

---

## Alternatives Considered

### Compare raw Representative Paths

Rejected.

Raw paths identify alternatives.

They do not explain why someone might reasonably choose them.

---

### Construct arguments during presentation

Rejected.

The strength of an argument is semantic information.

Presentation should communicate the argument rather than invent it.

---

### Produce recommendations instead

Rejected.

Recommendation belongs outside the Steelman.

The component exists to improve understanding rather than determine outcomes.

---

## Consequences

The Steelman enables:

✓ fair comparison

✓ stronger reasoning

✓ balanced analysis

✓ explicit objectives

✓ transparent supporting conditions

while preventing:

✗ strawman arguments

✗ uneven analytical effort

✗ premature recommendations

✗ presentation-driven persuasion

---

## Future Evolution

Future versions of the Steelman may support:

- multiple supporting arguments

- competing interpretations

- probabilistic conditions

- dependency between arguments

These enhancements should improve representation while preserving the Steelman's central responsibility.

That responsibility remains unchanged.

> **Construct the strongest legitimate case for every Representative Path.**



# Chapter 19 – Presentation Engine

## Key Question

> **How should the Decision Model be communicated without changing its meaning?**

---

## Purpose

The Presentation Engine is responsible for transforming the Decision Model into forms that improve human understanding.

Unlike the Reasoning Engine, the Presentation Engine performs no reasoning.

Its responsibility is communication.

It receives a completed Decision Model and renders it for a particular audience, medium or purpose while preserving the semantic meaning established by the Reasoning Engine.

---

## Responsibilities

The Presentation Engine is responsible for:

- rendering the Decision Model
- selecting an appropriate presentation style
- organising semantic information into coherent narratives
- improving readability
- adapting communication to different audiences

The Presentation Engine must not:

- introduce new reasoning
- alter semantic meaning
- strengthen conclusions
- weaken uncertainty
- invent evidence
- change recommendations

Its responsibility is expression, not interpretation.

---

## Inputs

The Presentation Engine receives:

- a completed Decision Model
- presentation configuration
- optional audience preferences

It does not receive the internal workings of the Reasoning Engine.

The Decision Model forms the complete contract between the two systems.

---

## Outputs

The Presentation Engine produces one or more rendered representations of the same Decision Model.

Examples include:

- executive summary
- engineering report
- documentary narrative
- investigative report
- educational explanation
- interactive interface
- future presentation formats

Each output communicates the same semantics using a different style.

---

## Semantic Ownership

The Presentation Engine owns no semantic information.

It owns only presentation.

Meaning remains entirely within the Decision Model.

If two renderers communicate different meanings from the same Decision Model, at least one renderer is incorrect.

---

## Rendering

Rendering is the process of transforming semantic structures into human-readable communication.

Different renderers may:

- reorder information
- change sentence structure
- alter pacing
- use analogy
- use metaphor
- adjust vocabulary
- change narrative style

They may not change meaning.

---

## Component Rendering

Presentation occurs at the level of individual Decision Model components.

Each component is rendered according to its communicative purpose.

For example:

- Guardian may naturally render as a caution.
- Pragmatist may naturally render as practical requirements.
- Auditor may naturally render as evidence and confidence.
- Steelman may naturally render as the strongest case for a Representative Path.

These are rendering decisions rather than reasoning decisions.

---

## Presentation Styles

Presentation style is independent of semantic content.

The same Decision Model may legitimately be rendered as:

- an executive briefing
- a documentary
- an educational explanation
- an investigative narrative
- a concise technical report

Style changes communication.

It does not change understanding.

---

## Voice

Different presentation styles possess different voices.

Examples include:

- concise
- explanatory
- investigative
- reflective
- instructional

Voice influences how semantic information is experienced.

It must never alter what that information means.

---

## Consistency

A Presentation Engine should maintain a consistent voice throughout a rendered document.

Different Decision Model components may naturally communicate differently.

However, the overall presentation should remain coherent.

Consistency improves readability without affecting semantic fidelity.

---

## Design Principles

### Meaning is fixed

The Presentation Engine should regard the Decision Model as immutable.

Only language may change.

---

### Communication serves understanding

Presentation should improve comprehension.

It should not persuade.

---

### Style is independent

Presentation style should be replaceable without requiring changes to the Decision Model.

---

### Preserve uncertainty

Where the Decision Model expresses uncertainty, the Presentation Engine should communicate that uncertainty faithfully.

Presentation should never imply greater confidence than exists within the Decision Model.

---

## Interaction with Other Components

The Presentation Engine consumes the completed Decision Model.

It does not interact directly with reasoning components.

Future Presentation Engines should therefore remain compatible provided they consume the same Decision Model contract.

---

## Design Rationale

Separating presentation from reasoning allows both systems to evolve independently.

Reasoning may become more sophisticated.

Presentation may become more expressive.

Neither should require changes to the other.

This separation also enables multiple Presentation Engines to communicate identical semantics in dramatically different ways.

---

## Alternatives Considered

### Generate reports directly from reasoning

Rejected.

Reasoning and presentation become inseparable.

Semantic validation becomes impossible.

---

### Embed presentation within reasoning components

Rejected.

Reasoning components should contribute meaning rather than prose.

---

### One presentation style only

Rejected.

Different users benefit from different methods of communication.

The architecture therefore supports multiple renderers consuming the same Decision Model.

---

## Consequences

The Presentation Engine enables:

✓ multiple renderers

✓ independent evolution of communication

✓ audience-specific presentation

✓ richer narrative styles

✓ future visual interfaces

while preventing:

✗ presentation-driven reasoning

✗ semantic drift

✗ duplicated reasoning

✗ renderer-specific Decision Models

---

## Future Evolution

Future Presentation Engines may include:

- documentary renderer
- educational renderer
- executive renderer
- investigative renderer
- visual renderer
- conversational renderer

All future renderers should preserve the same semantic meaning while communicating it in forms appropriate to their intended audience.

The central responsibility of the Presentation Engine remains unchanged.

> **Communicate the Decision Model without changing its meaning.**



# Chapter 20 – Presentation Architecture

## Key Question

> **How can multiple Presentation Engines communicate the same Decision Model without changing its meaning?**

---

## Purpose

The Presentation Architecture defines the boundary between reasoning and communication.

Its purpose is to ensure that every Presentation Engine consumes the same Decision Model and produces outputs that remain semantically faithful regardless of presentation style.

The Presentation Architecture therefore separates what the system knows from how it communicates that knowledge.

---

## Responsibilities

The Presentation Architecture is responsible for defining:

- the contract between the Decision Model and Presentation Engines
- semantic immutability during rendering
- component rendering responsibilities
- renderer independence
- composition of rendered components

It is not responsible for:

- reasoning
- modifying the Decision Model
- introducing new conclusions
- altering confidence

---

## The Rendering Contract

Presentation Engines consume a completed Decision Model.

They do not consume:

- prompts
- intermediate reasoning
- language generated during reasoning

The Decision Model is the sole source of semantic truth.

---

## Semantic Fidelity

Every Presentation Engine should communicate exactly the same semantic information.

Presentation Engines may differ in:

- wording
- ordering
- pacing
- vocabulary
- narrative style
- visual layout

They must not differ in:

- conclusions
- assumptions
- uncertainty
- commitments
- evidence
- semantic meaning

---

## Renderer Independence

Presentation Engines should be interchangeable.

Replacing one renderer with another should not require changes to:

- the Reasoning Engine
- the Decision Model
- reasoning components

Presentation therefore evolves independently from reasoning.

---

## Component Rendering

Presentation occurs by rendering Decision Model components.

Each component contributes semantic information.

Presentation Engines determine how that information should be communicated.

The semantic ownership established by the Reasoning Engine remains unchanged.

---

## Composition

Individual rendered components are composed into a coherent presentation.

Composition determines:

- ordering
- transitions
- document structure
- narrative flow

Composition must not alter the meaning contributed by individual components.

---

## Multiple Outputs

The same Decision Model may legitimately produce:

- reports
- conversations
- presentations
- user interfaces
- visualisations

These outputs differ only in presentation.

They represent the same underlying reasoning.

---

## Design Principles

### Reasoning is complete before presentation begins

Presentation should never continue the reasoning process.

Reasoning ends with the completed Decision Model.

---

### The Decision Model is immutable

Presentation Engines should treat the Decision Model as read-only.

Meaning is fixed.

Language is flexible.

---

### Semantic ownership is preserved

Presentation Engines should respect the ownership established by the Reasoning Engine.

Presentation communicates semantic structures.

It does not redefine them.

---

### Presentation exists to improve understanding

Presentation should improve comprehension.

It should not change conclusions.

---

## Interaction with Other Components

The Presentation Architecture receives a completed Decision Model.

It supplies one or more Presentation Engines.

Those Presentation Engines render outputs suitable for different audiences while preserving identical semantic meaning.

---

## Design Rationale

Separating reasoning from presentation allows both systems to evolve independently.

New Presentation Engines can be introduced without modifying the Reasoning Engine.

Likewise, improvements to reasoning automatically benefit every Presentation Engine.

This separation is one of the central architectural principles of Decision Workspace.

---

## Alternatives Considered

### Couple presentation directly to reasoning

Rejected.

Reasoning and communication become inseparable.

Semantic validation becomes difficult.

---

### Allow renderers to reinterpret the Decision Model

Rejected.

Presentation should communicate reasoning rather than replace it.

---

### Maintain separate Decision Models for different outputs

Rejected.

A single semantic model should support every form of presentation.

---

## Consequences

The Presentation Architecture enables:

✓ independent renderer development

✓ multiple presentation styles

✓ semantic consistency

✓ renderer interchangeability

✓ future visual interfaces

while preventing:

✗ presentation-specific reasoning

✗ semantic drift

✗ duplicated reasoning logic

✗ inconsistent outputs

---

## Future Evolution

Future versions of the Presentation Architecture may support:

- visual renderers
- interactive renderers
- conversational renderers
- accessibility-specific renderers
- domain-specific renderers

These additions should expand communication while preserving the central architectural principle.

That principle remains unchanged.

> **Presentation communicates the Decision Model. It does not change it.**



# Chapter 21 – Rendering Pipeline

## Key Question

> **How does a Presentation Engine transform a Decision Model into a finished presentation?**

---

## Purpose

The Rendering Pipeline describes the sequence by which a completed Decision Model is transformed into a presentation suitable for human consumption.

Unlike the Reasoning Engine, the Rendering Pipeline performs no semantic reasoning.

Its responsibility is to communicate the completed Decision Model faithfully.

---

## Overview

Every Presentation Engine follows the same high-level process.

```
Completed Decision Model
          │
          ▼
 Component Selection
          │
          ▼
 Component Rendering
          │
          ▼
 Component Composition
          │
          ▼
 Final Presentation
```

The implementation may vary.

The sequence should not.

---

## Stage 1 — Component Selection

The renderer identifies which Decision Model components will be presented.

Not every presentation requires every component.

For example:

- an executive briefing may omit detailed Auditor information
- an engineering report may include every component
- a conversational renderer may reveal components progressively

Selection affects visibility.

It must not alter the underlying Decision Model.

---

## Stage 2 — Component Rendering

Each selected component is rendered independently.

The renderer converts semantic structures into human-readable communication.

Examples include:

Guardian

↓

Protected values become cautions.

---

Pragmatist

↓

Requirements become practical checkpoints.

---

Auditor

↓

Evidence becomes confidence statements.

---

Steelman

↓

Supporting conditions become coherent arguments.

The renderer communicates semantic meaning.

It does not modify it.

---

## Stage 3 — Composition

Rendered components are assembled into a coherent presentation.

Composition determines:

- ordering
- transitions
- pacing
- document structure

Composition should improve readability while preserving semantic fidelity.

---

## Stage 4 — Final Presentation

The completed presentation is delivered to the user.

Examples include:

- report
- conversation
- web interface
- document
- future presentation formats

Regardless of format, the underlying Decision Model remains unchanged.

---

## Component Independence

Each component should be capable of being rendered independently.

Presentation Engines should avoid unnecessary dependencies between rendered components.

This improves flexibility and enables new presentation formats without modifying the Decision Model.

---

## Ordering

Presentation order is determined by communication needs rather than reasoning order.

Different renderers may legitimately present the same semantic components in different sequences provided that meaning is preserved.

---

## Progressive Disclosure

Presentation Engines may reveal information progressively.

For example:

- summary first
- supporting reasoning afterwards
- detailed evidence on request

Progressive disclosure changes the user's experience.

It does not change the Decision Model.

---

## Design Principles

### Render semantics

Presentation should render semantic structures rather than reconstruct them.

---

### Preserve independence

Each rendered component should communicate the semantics owned by that component.

---

### Composition serves understanding

Composition exists to improve readability.

It should never alter meaning.

---

### The Decision Model remains authoritative

The rendered presentation is not the canonical representation.

The Decision Model is.

---

## Design Rationale

Separating rendering into independent stages allows Presentation Engines to evolve without affecting reasoning.

Different renderers may adopt different communication strategies while remaining semantically equivalent.

This architecture also supports future renderers that may not produce prose at all.

---

## Alternatives Considered

### Render the entire Decision Model in one pass

Rejected.

Component rendering provides greater flexibility and clearer separation of responsibilities.

---

### Couple rendering order to reasoning order

Rejected.

The order in which reasoning occurs is not necessarily the order that best communicates the result.

---

### Allow rendering to modify semantics

Rejected.

Semantic modification belongs exclusively to the Reasoning Engine.

---

## Consequences

The Rendering Pipeline enables:

✓ modular presentation

✓ renderer flexibility

✓ independent component rendering

✓ future presentation formats

✓ semantic consistency

while preventing:

✗ duplicated reasoning

✗ presentation-specific semantics

✗ tightly coupled renderers

✗ communication altering meaning

---

## Future Evolution

Future Presentation Engines may introduce additional rendering stages provided that the separation between reasoning and presentation is preserved.

The fundamental rendering pipeline remains unchanged.

> **Select. Render. Compose. Present.**


