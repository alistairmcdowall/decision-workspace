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

### **Architectural Discovery: Decision Landscape Versioning**

Decision Landscapes should be versioned rather than replaced.

The initial landscape represents the system's first-pass understanding of the decision. Clarifier responses should remodel the landscape, not overwrite it.

The user should be able to see:

- the original landscape
- the remodelled landscape
- what changed
- why it changed

This provides a visible representation of the interaction loop:

**User Answer → Reasoning Changes → Landscape Changes**

rather than simply presenting a different recommendation.

---

### **Architectural Discovery: Implicit User Model**

Decision Workspace should build an internal user model from the initial prompt, clarifier responses and, in future, voice interaction.

The user model is **not** user-facing.

Its purpose is to generate more relevant Decision Landscapes by inferring likely objectives, constraints, values and concerns from the user's behaviour and communication.

The system should infer privately, reflect gently, and avoid presenting conclusions about the user's personality or motivations.

Voice interaction may substantially enrich this internal model through analysis of emphasis, hesitation, confidence and other paralinguistic cues.

---

### **Architectural Discovery: Event Horizons**

Decision Landscapes are composed of representative stories that evolve through a sequence of landscapes separated by **Event Horizons**.

An Event Horizon is **not** simply a point in time.

It is a point after which the previous decision landscape can no longer be recovered because the state of the world has materially changed.

Examples include:

- an employer rejecting remote working
- a market crash
- a truth being revealed
- a contract being signed
- a relationship ending

Event Horizons may result from the user's decisions or from external events beyond their control.

Each story therefore becomes a sequence of evolving landscapes rather than a static prediction.

This reframes Decision Landscapes as representations of **trajectories through changing states of the world**, rather than lists of options or fixed future outcomes.

# Decision Workspace – Current Architecture (Working Draft)

## Core Principle

Decision Workspace is not primarily a recommendation engine.

It is a system for constructing, refining and testing a Decision Landscape until a recommendation naturally emerges from the interaction between the decision and the decision-maker.

The user remains the final decision-maker throughout.

---

# Processing Pipeline

```
Prompt
    ↓
Decision Understanding
    ↓
Decision Landscape v1
    ↓
Judge Interpretation (Pass 1)
    ↓
Clarifiers
    ↓
Decision-State
    ↓
Judge Interpretation (Pass 2)
    ↓
Decision Landscape v2
    ↓
Inhabitable Futures
    ↓
User Response
    ↓
Landscape Collapse
    ↓
Recommendation
    ↓
Decision
    ↓
Navigator

```

---

# 1. Decision Understanding

Purpose:

Construct an initial understanding of the decision from the prompt alone.

Produces:

- Summary
- Explicit objectives
- Implicit objectives
- Constraints
- Initial timeframe(s)
- Initial assumptions

No attempt is made to personalise the decision at this stage.

---

# 2. Decision Landscape v1

Landscape v1 represents the decision itself.

It consists of a small number of representative paths (typically three).

Example:

- Path A
- Path B
- Path C

These are intentionally generic.

They describe the structure of the decision, not the person making it.

---

# 3. Judge Interpretation (Pass 1)

The judges interpret Landscape v1.

Guardian

- What valuable thing could be harmed?

Pragmatist

- What practical realities matter?

Auditor

- What uncertainty matters most?

Reframer

- Is this the real decision?

Empathiser

- Who experiences these futures?

The judges interpret.

They do not recommend.

---

# 4. Clarifiers

Maximum:  
0–3

Purpose:

Reveal the user's weighting of the decision.

Clarifiers should:

- expose fears
- expose trade-offs
- expose revealed preferences
- identify intolerable outcomes

Clarifiers should not become questionnaires.

They exist only to produce meaningful decision-state change.

---

# 5. Decision-State

Internal only.

Never exposed directly to the user.

Represents:

The user-in-this-decision.

Not:

The user's personality.

Example:

- high family priority
- moderate financial uncertainty tolerance
- low regret tolerance for "staying too long"

This state exists only for the current decision.

---

# 6. Judge Interpretation (Pass 2)

The judges now interpret:

Decision

- 

Decision-State

rather than the decision alone.

Their role becomes:

"What does this decision look like for this user?"

rather than

"What does this decision look like?"

---

# 7. Decision Landscape v2

Landscape v2 is the personalised landscape.

It contains the same representative paths as Landscape v1.

However, they have been:

- reweighted
- reinterpreted
- rewritten

to reflect the revealed decision-state.

Landscape v2 represents the interaction between:

Decision

and

Decision-State.

---

# 8. Inhabitable Futures

Each representative path becomes a brief future the user can mentally inhabit.

Purpose:

Allow the user to experience what life might feel like after that path has become the new normal.

Each future should:

- describe the representative state
- avoid persuasion
- avoid recommendation
- conclude with the natural question that emerges from living there

The purpose is not storytelling.

The purpose is recognition.

---

# 9. User Response

The user reacts to each future.

Example reactions:

- I could live with this.
- This doesn't feel right.
- This worries me.
- This feels closest.
- I'm still unsure.

These responses provide a richer signal than direct questioning.

---

# 10. Landscape Collapse

The user's responses reduce the viable decision space.

Possible outcomes:

- one path clearly aligns
- two paths remain viable
- no path fits
- further exploration required

Importantly:

The recommendation is not imposed.

It emerges from the interaction between:

Landscape

- 

Decision-State

- 

User Response.

---

# 11. Recommendation

The recommendation reflects the pattern observed throughout the process.

Preferred style:

"Your responses consistently align with Path B."

rather than

"We recommend Path B."

The recommendation should feel earned.

---

# 12. Decision

The user makes the decision.

Decision Workspace informs.

The user decides.

---

# 13. Navigator

Once a decision has been made, the system transitions from exploration into execution.

Navigator provides:

- implementation plan
- sequencing
- risk management
- monitoring
- follow-up

Navigator is intentionally separate from the decision process.

---

# Current Architectural Hypothesis

Decision Workspace is composed of three distinct stages.

Stage 1 — Understand the Decision

Prompt

↓

Landscape v1

Stage 2 — Understand the Decision-Maker

Clarifiers

↓

Decision-State

↓

Landscape v2

Stage 3 — Test Fit

Inhabitable Futures

↓

User Response

↓

Landscape Collapse

↓

Recommendation

The recommendation is therefore not calculated directly.

It emerges naturally once the user's responses have reduced the viable decision space.

This remains the current working architecture and should be treated as a hypothesis requiring further testing.

# Decision Workspace – Recent Architectural Principles

1. **An Event Horizon is a state transition, not a point in time.**
  An Event Horizon occurs when a decision or external event irreversibly changes the decision landscape. After crossing an Event Horizon, reasoning must continue from the new state; the previous state cannot simply be restored.
2. **Event Horizons belong to the actor, not the decision.**
  The important question is not "when was the decision made?" but "when has the actor entered a fundamentally different state?"
3. **Landscape V1 is representative, not personalised.**
  Its purpose is to identify the major representative paths available before enough is known about the user.
4. **Clarifiers exist to reveal the user, not gather facts.**
  Clarifiers should uncover revealed preferences rather than stated preferences. Where possible they should ask which undesirable future the user most wishes to avoid.
5. **Landscape V2 is a personalised interpretation of the representative paths.**
  The paths themselves may remain unchanged, but their meaning changes according to the user's revealed preferences.
6. **The Decision-State is an internal model only.**
  It exists to explain how the user's revealed preferences transform Landscape V1 into Landscape V2. It should not normally be exposed to the user.
7. **The judges belong to the reasoning layer, not the presentation layer.**
  Individual judges should perform independent reasoning internally. Their conclusions are synthesised into a single visible Decision Assessment rather than being presented separately.
8. **The user remains the final evaluator throughout the process.**
  Decision Workspace structures the decision and presents representative futures. It never makes the decision on the user's behalf.
9. **Inhabitable Futures are generated from Landscape V2, not Landscape V1.**
  They should represent personalised futures that reflect the user's revealed preferences, not generic outcomes.
10. **An Inhabitable Future is a single representative state, not a story.**
  It should present one representative moment from a possible future rather than describing how that future unfolded.
11. **The app is the camera.**
  Decision Workspace does not narrate, persuade or evaluate. It positions the user inside a representative future and allows them to observe it.
12. **The future provides evidence, not advice.**
  The future should never evaluate itself or tell the user how they should feel. It simply presents evidence about what life is like on that path.
13. **The present self is always the evaluator.**
  The user standing in the present evaluates each representative future. The future itself never recommends, persuades or judges.
14. **Show. Don't explain.**
  Inhabitable Futures should describe the resulting state rather than interpreting its meaning. Recognition should come from the user, not from the narration.
15. **Anchor the user, then leave the decision behind.**
  Begin by placing the user naturally inside the representative environment created by the decision. Once anchored, the decision itself should largely disappear and the resulting state should become the focus.
16. **The decision should appear only once.**
  Mention the decision only as much as is necessary to establish the environment. Avoid repeatedly referring back to it.
17. **Preserve the essence, not the detail.**
  An Inhabitable Future should communicate the defining characteristic of a path through observation rather than explanation.
18. **Optionality is represented through the landscape, not the bank balance.**
  Money should only be mentioned insofar as it communicates which future possibilities remain open or have been closed by the decision.
19. **A recommendation emerges from recognition, not calculation.**
  The preferred path emerges from the user's responses to representative futures rather than from an explicit optimisation algorithm.
20. **The core Decision Workspace flow is:**
  Prompt  
  → Summary  
  → Landscape V1  
  → Decision Assessment  
  → Clarifiers  
  → Decision-State (internal)  
  → Landscape V2  
  → Inhabitable Futures  
  → User Recognition  
  → Recommendation  
  → Navigator

  21. Representative paths must be genuine post-decision states.

A representative path must describe a stable state that the decision-maker can realistically arrive at through their decision. Negotiation strategies, intermediate steps, or outcomes primarily dependent on another actor should not normally be represented as separate paths.

Then a second, shorter rule:

22. Generate the smallest representative set.

Generate only as many representative paths as are needed to faithfully represent the decision landscape. This will typically be two or three. Do not invent additional paths simply to satisfy a fixed structure.

Representative futures should share a common narrative structure. Branches should vary the state of the world, not the storytelling.


An establishing shot is always anchored in the representative present of the chosen future, not the user's current present.

The establishing shot occurs at the point in the representative future where the defining characteristic of that path is most clearly visible.

The representative present should be selected, not assumed. Choose the point in the future where the defining characteristic of the path is most clearly observable, then freeze time.

I actually think this is a better generation question:

What becomes different about living on this path?

rather than:

What is different about the path itself?

Updates 28th June 2026:
=========================
LANDSCAPE ARCHITECTURE
=========================

1. Landscape V1 is generated directly from the user's prompt.

2. Landscape V1 is intentionally imperfect. Its purpose is to expose uncertainty, not eliminate it.

3. Clarifiers exist to reveal preference, not collect facts.

4. Wherever possible, clarifiers should reveal preference through avoidance ("I'd rather avoid...") rather than aspiration ("I'd like...").

5. Clarifier answers create a transition in user state. They form the Event Horizon between Landscape V1 and Landscape V2.

6. Landscape V2 is the first stable representation of the user's decision landscape and is generated using the prompt plus clarified preferences.

7. Judge reasoning informs Landscape V2 but should be synthesised into a single reasoning section rather than exposing individual judge personalities.

8. Representative paths are generated from Landscape V2.

9. Representative paths must be genuine post-decision states.

10. Negotiation strategies, intermediate actions or outcomes primarily controlled by another actor should not normally become representative paths.

11. Generate the smallest representative set of paths required to faithfully represent the landscape.

12. Normally this will be two or three representative paths.

13. Do not invent additional paths simply to satisfy symmetry.

14. Representative paths should not strictly dominate one another. Every path should preserve something valuable while sacrificing something else.


=========================
EVENT HORIZONS
=========================

15. An Event Horizon is a transition that moves a person into a new decision state from which reasoning cannot simply continue as though nothing happened.

16. The defining property of an Event Horizon is state transition, not irreversibility.

17. After crossing an Event Horizon, the previous landscape no longer represents the user's current decision state.


=========================
ESTABLISHING SHOTS
=========================

18. Every representative path should be experienced through an Establishing Shot.

19. The purpose of an Establishing Shot is not to explain the path. Its purpose is to let the user briefly inhabit what it is like to live on that path.

20. Success is measured by recognition, not agreement.

21. An Establishing Shot should be anchored in the representative present of the chosen future, not the user's current present.

22. The representative present should be selected, not assumed. Choose the point in the future where the defining characteristic of the path is most clearly observable.

23. The representative present should represent the earliest stable state created by the decision where possible.

24. Begin by anchoring the user in a specific place and moment.

25. Prefer ordinary moments over dramatic moments.

26. Ask: "What becomes different about living on this path?" rather than "What is different about the path?"

27. Identify the defining characteristic of living on that path.

28. Find the smallest observable evidence that communicates that defining characteristic.

29. Prefer representative evidence over explanation.

30. Representative evidence may be an object, routine, relationship, habit, document, environment or trace of a past event.

31. The shot should describe the present state, not narrate the journey that created it.

32. Current facts are allowed. Historical narration is not.

33. Freeze the scene. Time does not pass during the Establishing Shot.

34. Prefer showing over telling.

35. If the defining characteristic is primarily internal and cannot be communicated faithfully through observable evidence alone, use the minimum telling necessary.

36. Stop as soon as recognition has been achieved.

37. An Establishing Shot is successful when the user can truthfully say:
    "I know what it would be like to live there."

38. The ultimate success criterion is not:
    "That makes sense."

39. The ultimate success criterion is:
    "That's me."

28th June
# Decision Workspace – Architecture Amendments (28 June)

## Judge Panel

### Guardian (Core)

**Purpose:** Protect what matters.

**Remit**

* Irreversible downside
* Catastrophic failure
* Safety
* Resilience
* Trust
* Fragility
* Protection of long-term interests

---

### Pragmatist (Core)

**Purpose:** Evaluate practical reality.

**Remit**

* Feasibility
* Operational reality
* Practical trade-offs
* Real-world constraints
* Implementation implications

---

### Auditor (Core)

**Purpose:** Test the quality of the reasoning.

**Remit**

* Assumptions
* Missing evidence
* Recommendation stability
* Logical consistency
* Whether additional clarification is genuinely required

---

### Reframer (Core)

**Purpose:** Reveal the true structure of the decision.

**Remit**

* Identify the real decision beneath the stated question.
* Challenge framing where appropriate.
* Reveal hidden structure.
* Detect when the user's stated decision variable may actually be a proposed solution rather than the underlying objective.

The Reframer has two legitimate output modes.

#### 1. Interpretive Reframe

Provides additional understanding of the existing decision.

Example:

> This is not simply a relocation decision. It is also a decision about identity, family and the kind of life you want to build.

Characteristics:

* Does not change the user's prompt.
* Does not alter the decision variable.
* Does not create a new Landscape.
* Exists to deepen understanding.

---

#### 2. Structural Reframe

Suggests an alternative framing of the decision.

Example:

Original prompt:

> Should I buy the Sony Bravia 9 for £3500?

Suggested prompt:

> I have £3500 to spend on a television. What is the best way to spend it?

The user may choose:

* Continue with original prompt
* Restart with suggested prompt

If the user selects the suggested prompt:

* The entire architecture restarts.
* The Reframer is disabled for that run.
* Recursive reframing is therefore impossible.

The Reframer should only generate a Structural Reframe when there is a genuine alternative decision variable.

---

### Empathiser (Core – Conditional Silence)

**Purpose:** Represent human consequences.

**Remit**

* Relationships
* Emotional impact
* Stakeholder consequences
* Human cost

The Empathiser is always present but may legitimately remain silent if no material human considerations exist.

---

### Steelman (Core)

**Purpose:** Present the strongest possible case for every representative path.

The Steelman does not create disagreement.

Instead, it strengthens each representative future before comparison so that every path receives its fairest possible hearing.

---

## Post-Decision Specialist

### Navigator

Navigator is not part of the decision panel.

Navigator is invoked only after a preferred representative path has emerged.

**Purpose**
Convert a chosen representative future into an executable plan.

Outputs include:

* sequencing
* transition planning
* implementation
* contingency planning
* risk reduction
* next actions

Navigator improves execution rather than decision formation.

---

# Current Judge Status

| Judge        | Status                            |
| ------------ | --------------------------------- |
| Guardian     | Core                              |
| Pragmatist   | Core                              |
| Auditor      | Core                              |
| Reframer     | Core                              |
| Empathiser   | Core (conditional silence)        |
| Steelman     | Core                              |
| Navigator    | Post-decision specialist          |
| Contrarian   | Removed                           |
| Long-Termist | Removed                           |
| Humanist     | Merged into Empathiser            |
| Strategist   | Reserved for future consideration |

---

# Landscape Architecture

## Representative Paths

Representative Paths describe stable futures.

They are **not**:

* tactics
* implementation strategies
* negotiation approaches
* information gathering
* temporary compromises
* delays

Those belong to Navigator.

---

## Number of Representative Paths

The architecture does **not** attempt to force three representative futures.

Two representative paths are perfectly valid.

Three representative paths should only be produced when the underlying decision variable genuinely admits three stable destinations.

Examples:

### Two representative paths

* Move to Japan / Stay
* Tell friend / Keep secret
* Accept redundancy / Remain

### Three representative paths

* Growth / Balanced / Safety
* Push / Support / Stand back
* Sell / Partial exit / Keep

---

## Decision Variable

The user's prompt defines the decision variable.

Landscape generation must never silently broaden or narrow that variable.

Example:

Valid:

> Should I spend my £3500 TV budget?

Possible representative paths:

* Premium television
* Mid-range television
* Do not purchase

Invalid:

> Should I buy the Sony Bravia 9?

↓

Representative paths become:

* Buy Sony
* Do not buy Sony

A cheaper television belongs to a different decision variable.

---

## Candidate Solution vs Objective

The Reframer should distinguish between:

### Candidate Solution

Example:

Sony Bravia 9

This may legitimately indicate a broader underlying objective.

---

### Objective

Examples:

* Move to Japan
* Become a doctor
* Get a dog

These are intrinsic objectives.

The Reframer should not broaden these into:

* Move somewhere else
* Work in healthcare
* Own a pet

Doing so changes the user's decision rather than improving it.

---

# Establishing Shots

The Establishing Shot places the user inside the representative future.

It does not:

* summarise the future
* explain the future
* justify the future
* begin immediately after the decision

Instead it answers:

> What eventually became normal?

---

## Representative Evidence

The Establishing Shot should communicate the future through representative evidence.

Prefer:

> Your daughter walks a few steps ahead chatting comfortably with a school friend.

Rather than:

> Your daughter settled well.

---

## Show if you can. Tell if you must.

Showing remains preferable.

However, where representative evidence alone cannot communicate the intended future, concise exposition is acceptable.

---

## Temporal Framing

The Establishing Shot should exist entirely inside the representative future.

Avoid running time through the scene.

Instead of:

> Three years later...

Place the user directly into the settled world that resulted from that representative path.

---

# Working Rule – Reframer Restart

If a Structural Reframe is generated:

1. The user may continue with the original prompt.

2. The user may restart with the suggested prompt.

Restarting:

* begins a completely new architecture run
* disables the Reframer for that run
* prevents recursive reframing

This rule remains provisional until testing demonstrates a better approach.

Yes, and it's actually a very sensible idea.

If you request your ChatGPT data export, the conversations include metadata. While I don't want to overstate the exact format (it can change), exports generally contain enough temporal information to reconstruct the order of messages and conversations. At a minimum you'll usually have conversation structure and timestamps or timestamp-like metadata for messages.

So a rule like:

Later decisions supersede earlier ones unless explicitly marked as historical.

is perfectly reasonable.

In fact, I'd probably make it slightly more sophisticated:

If two architectural rules conflict:

1. Prefer the most recent explicit decision.
2. If no conflict exists, retain both.
3. If the newer discussion merely explores an idea without reaching a conclusion, keep the earlier rule.
4. If the newer discussion explicitly overturns an earlier decision, archive the older rule but do not delete it.

That last point is important.

For example, today we didn't just invent a new TV rule.

We effectively archived the old one:

TV naturally has three representative paths

↓

TV is a two-path Landscape decision with a potential Structural Reframe.

Keeping that history is valuable because it tells you why the rule changed.

Actually, I had another thought.

What you're slowly creating isn't really a chat history anymore.

It's beginning to resemble a version-controlled design history.

If I were building this for the long term, I'd almost separate it into three artefacts:

Research Log (chronological, messy, every discussion)
Architecture Specification (only current truth)
Decision Register (every architectural decision with timestamp and rationale)

For example:

ADR-014
Date: 2026-06-28

Decision:
Representative paths must not broaden the user's decision variable.

Reason:
The TV example demonstrated that adding a cheaper television answered a different question.

Supersedes:
ADR-009

Software architects call these Architecture Decision Records (ADRs), and they're incredibly useful because they answer the question:

"Why on earth did we decide to do it this way?"

I actually think Decision Workspace is getting to the size where something like that would pay dividends. Not yet—you've still got plenty of exploration to do—but once the architecture starts settling, an ADR-style log would make it much easier to see what changed and why, rather than having to reconstruct it from hundreds of pages of conversation.

Status: Working architecture. Behaviour considered stable pending implementation.
# Decision Workspace — Architecture Draft – Reframer v0.1 (Validated)

## Purpose

The Reframer is the first reasoning component in Decision Workspace.

Its job is to stress-test the user’s prompt before Landscape generation begins.

It does not answer the user’s question.
It does not generate paths.
It does not judge feasibility, morality, evidence or desirability.

Its purpose is to ensure that the rest of the system analyses the correct decision.

---

## Core Mission

> Stress-test the user’s prompt until Landscape can safely analyse a single, well-defined decision variable.

The Reframer should be internally adversarial and externally minimal.

Internally, it attempts to break the prompt.

Externally, it should interrupt the user only when doing so materially improves the analysis.

---

## Primary Principle

> Preserve the user’s original intent with the minimum necessary intervention.

The Reframer should not make the system feel difficult, pedantic or lawyerly.

It should only intervene when the prompt would otherwise cause the system to analyse the wrong problem, split the wrong thing, or route the request to the wrong component.

---

## Output States

The Reframer returns exactly one of four states:

1. `PASS`
2. `CLARIFY`
3. `SUGGEST_REFRAME`
4. `ROUTE_TO_NAVIGATOR`

---

## 1. PASS

Use `PASS` when the prompt contains a single sufficiently clear governing decision variable.

The prompt may contain:

* background context
* emotion
* constraints
* multiple facts
* consequences
* stakeholder concerns
* examples
* quoted messages
* detailed narrative

These should remain context unless they introduce a separate decision variable.

### PASS means

Landscape should analyse the original prompt.

### Example

User prompt:

> My wife has been offered a job in Singapore. It would double her salary, but we would need to relocate and our daughter would leave her school. Should we do it?

Reframer result:

```ts
{
  type: "PASS",
  decisionVariable: "Should our family relocate to Singapore for this job opportunity?"
}
```

---

## 2. CLARIFY

Use `CLARIFY` when the prompt has more than one legitimate interpretation and those interpretations would produce materially different Landscapes.

The Reframer must not guess which interpretation is intended.

It should present the smallest useful set of discrete alternatives.

### CLARIFY means

The user must choose before Landscape begins.

### Example

User prompt:

> Should I tell my brother whether to marry his girlfriend?

Possible interpretations:

1. Should I express an opinion at all?
2. Should I recommend that he marry her?
3. Should I recommend that he not marry her?

Reframer result:

```ts
{
  type: "CLARIFY",
  question: "Which decision do you want to analyse?",
  options: [
    "Should I express an opinion about my brother's relationship?",
    "Should I recommend that my brother marry his girlfriend?",
    "Should I recommend that my brother not marry his girlfriend?"
  ]
}
```

---

## 3. SUGGEST_REFRAME

Use `SUGGEST_REFRAME` when the original prompt is valid and analysable, but appears to be framed around a candidate solution rather than the user’s underlying objective.

The Reframer must preserve the original prompt.

It may offer one alternative prompt, but it must never replace the original automatically.

If the user accepts the suggested prompt, the system restarts with the Reframer disabled for that run.

This prevents recursive reframing.

### SUGGEST_REFRAME means

The user may either:

* continue with the original prompt, or
* restart with the suggested prompt.

### Example

User prompt:

> Should I buy the Sony Bravia 9 for £3,500?

Reframer result:

```ts
{
  type: "SUGGEST_REFRAME",
  originalPrompt: "Should I buy the Sony Bravia 9 for £3,500?",
  suggestedPrompt: "How should I spend my £3,500 television budget?",
  reason: "The original question is valid, but the underlying objective may be getting the best television experience for the budget rather than deciding on this exact model."
}
```

---

## 4. ROUTE_TO_NAVIGATOR

Use `ROUTE_TO_NAVIGATOR` when the user has already made the decision and is asking how to execute it.

This bypasses Landscape.

### ROUTE_TO_NAVIGATOR means

The prompt is not asking which representative future to choose.

It is asking how to implement an already chosen direction.

### Example

User prompt:

> I have decided to become a commercial airline pilot. What are the exact steps to get my licence?

Reframer result:

```ts
{
  type: "ROUTE_TO_NAVIGATOR",
  executionGoal: "Become a commercial airline pilot and obtain the required licence."
}
```

---

## Non-Responsibilities

The Reframer must not:

* generate representative paths
* recommend an option
* evaluate feasibility
* judge morality
* audit evidence
* produce an execution plan
* rank choices
* create artificial alternatives
* split context into unnecessary sub-prompts
* silently broaden the user’s question
* silently narrow the user’s question

---

## Internal Rules

### Rule 1 — One governing decision variable

The Reframer should identify the single main decision the user is asking about.

If one clear decision exists, pass it.

If several plausible decisions exist and they would produce different Landscapes, clarify.

---

### Rule 2 — Context is not a decision

Treat every sentence as context until it proves it is a separate decision.

Quoted messages, emotional reactions, background events and constraints should usually remain evidence for the main decision.

---

### Rule 3 — Split only when necessary

Do not decompose complex prompts merely because they contain multiple facts.

Only split when different interpretations would materially alter the Landscape.

---

### Rule 4 — Reframe only when useful

Do not offer a reframe just because another question could be asked.

Offer a reframe only when the prompt appears anchored to a candidate solution rather than the user’s likely underlying objective.

---

### Rule 5 — Never silently alter the prompt

The Reframer may pass, clarify, suggest or route.

It may never secretly rewrite the user’s decision.

---

### Rule 6 — Execution belongs to Navigator

If the prompt asks how to carry out a decision already made, route to Navigator.

Do not force execution prompts through Landscape.

---

### Rule 7 — Safety is outside the Reframer

The Reframer does not decide whether a prompt is allowed.

Safety and policy checks are handled by the underlying model/platform layer.

---

## UX Principles

The Reframer should feel helpful, not obstructive.

It should be:

* brief
* calm
* low-friction
* non-judgemental
* precise
* invisible when possible

The user should not feel cross-examined.

The Reframer should only interrupt when the system would otherwise analyse the wrong decision.

---

## Preferred User-Facing Labels

For `CLARIFY`:

> Before we continue, which of these did you mean?

For `SUGGEST_REFRAME`:

> I can analyse your original question, but there may be another useful way to frame it.

Buttons:

* Continue with original prompt
* Restart with suggested prompt

For `ROUTE_TO_NAVIGATOR`:

> This looks like an execution question rather than a decision question, so I’ll route it to planning.

---

## Minimal Type Definition

```ts
type ReframerResult =
  | {
      type: "PASS";
      decisionVariable: string;
    }
  | {
      type: "CLARIFY";
      question: string;
      options: string[];
    }
  | {
      type: "SUGGEST_REFRAME";
      originalPrompt: string;
      suggestedPrompt: string;
      reason: string;
    }
  | {
      type: "ROUTE_TO_NAVIGATOR";
      executionGoal: string;
    };
```

---

## Working Summary

The Reframer is not a judge.

It is a pre-analysis parser.

It prepares the decision for Landscape by ensuring that the system is solving one clear problem, preserving the user’s intent, and routing execution-only prompts away from Landscape.

Its guiding rule is:

> Be ruthless internally. Be almost invisible externally.

The Reasoning Engine identifies what must be communicated. The Presentation Engine decides how it should be communicated.
