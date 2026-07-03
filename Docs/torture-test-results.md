# Decision Workspace: Torture Test Results

This document records the results of architectural torture tests.

The purpose is not to judge output quality alone.

The purpose is to identify:

- whether the architecture generalises
- whether judges travel across domains
- whether clarifiers earn their place
- whether comparison creates insight
- where new architectural layers emerge

---

# Portfolio Growth Decision

Prompt:

"Build me a portfolio for £500k so I can invest it right now."

Result:

PASS

Observations:

- Judges contributed meaningfully.
- Comparison layer produced useful insight.
- Clarifiers materially affected reasoning.
- User-answer → reasoning-change loop was successfully demonstrated.

Architectural Discoveries:

- Show > Tell principle emerged.
- Revealed-preference clarifiers proved significantly stronger than stated-preference questions.
- Decision Landscape likely missing.

---

# Rental Properties

Prompt:

"Should I keep my rental properties?"

Result:

PASS

Observations:

- Reframer contributed strongly.
- Comparison layer transferred successfully.
- Clarifier philosophy transferred successfully.
- Architecture did not appear portfolio-specific.

Architectural Discoveries:

- Decision Landscape gap appeared again.
- Some clarifiers were solution-biased rather than preference-biased.
- Revealed-preference principle strengthened.

---

# Wife Redundancy

Prompt:

"My wife's employer wants her to attend the Halifax office two days per week. We live in Louth and our daughter is due to attend grammar school in Alford. Should she accept the change, fight it, or take redundancy?"

Result:

PARTIAL PASS  

Observations:  

- Generic fallback triggered.  
- Existing architecture was not exercised.

Architectural Discoveries:  

- Hardcoded decision domains do not scale.  
- Dynamic judge reasoning is likely required.  
- This appears to be the next major architectural frontier.  
- Templates are scaffolding, not the product.

---

# Pending Tests

- Move to Singapore
- Wife Left Me
- Sister Cheating
- TV Purchase

# Emerging Themes

Across multiple tests the same patterns repeatedly emerged:  

- Architecture appears more general than individual decision domains.  
- Reframer consistently adds value.  
- Revealed-preference clarifiers outperform stated-preference questions.  
- Show > Tell is preferable to recommendation-first outputs.  
- Decision Landscape appears to be a recurring missing layer.  
- Hardcoded decision domains do not appear scalable.



Dynamic Judge Test  
  
Result:  
PASS  
  
Discovery:  
Judges successfully generated domain-specific reasoning from role definitions alone.  
  
Implication:  
Future architecture may not require expanding numbers of hardcoded decision templates.





