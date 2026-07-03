# Dynamic Judge Test  
  
## Purpose  
  
Test whether Decision Workspace reasoning can be generated dynamically from judge definitions and process rules, without a hardcoded domain template.  
  
## Decision Prompt  
  
My wife's employer wants her to attend the Halifax office two days per week. We live in Louth and our daughter is due to attend grammar school in Alford. Should she accept the change, fight it, or take redundancy?  
  
## Judge Definitions  
  
Guardian:  
Identify what valuable thing could be harmed if this decision goes wrong.  
  
Pragmatist:  
Identify the practical realities that determine whether this decision succeeds.  
  
Auditor:  
Identify the highest-value unknowns, not every possible missing detail.  
  
Reframer:  
Check whether the user is asking the real decision or only the surface version of it.  
  
Empathiser:  
Identify who is affected emotionally, relationally or personally, and whether those impacts should change the decision.  
  
## Process Rules  
  
- Provide a useful first-pass summary.  
- Do not hide behind information gathering.  
- Ask 0-3 clarifiers only.  
- Clarifiers must be unknown, answerable by the user, and capable of materially changing the recommendation.  
- Prefer revealed-preference clarifiers over stated-preference questions.  
- Generate judge outputs from the decision itself.  
- Synthesise judge outputs into agreement, tension and uncertainty.  
- Do not use a redundancy-specific template.  
  
## Output Structure  
  
Summary  
  
Decision Clarifiers  
  
Judge Comparison:  
- Areas of Agreement  
- Areas of Tension  
- Highest Uncertainty  
  
Analysis:  
- Guardian  
- Pragmatist  
- Auditor  
- Reframer  
- Empathiser or Silent