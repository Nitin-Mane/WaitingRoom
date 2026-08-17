# Follow-Up Recommendation Engine Specification

## 1. Recommendation Philosophy

WaitingRoom uses a **deterministic, rule-based recommendation policy** to eliminate decision fatigue. Recommendations output an actionable state accompanied by an explainability rationale and a confidence tier.

---

## 2. Action Types & Evaluation Rules

| Action | Condition | Suggested Tone |
| :--- | :--- | :--- |
| **`WAIT`** | Item is within expected response window and elapsed business days $< \text{category baseline}$. | Passive observation |
| **`FOLLOW_UP`** | `expectedResponseAt` is in the past, or no response received after expected cadence days. | Polite / Friendly nudge |
| **`ESCALATE`** | Follow-up count $\ge \text{maxFollowUps}$ ($2$), or hard deadline is within $48$ hours. | Firm / Executive escalation |
| **`REVIEW`** | Response received (`RESPONDED`), but deliverable requires user validation or unblocking downstream tasks. | Internal review |
| **`SNOOZE`** | Active waiting period is intentionally deferred to a known future milestone date. | Deferral |
| **`CLOSE`** | Item deliverable verified, signed, or superseded. | Complete |

---

## 3. Category SLA Cadence Matrix

Defaults configured in [`src/core/types.js`](file:///d:/antigrativity_workspace/WaitingRoom/WaitingRoom/src/core/types.js):

- **Recruiter / Career:** 4 business days
- **Academic / Registrar:** 7 business days
- **Government / Legal:** 14 business days
- **Code Review / Technical:** 2 business days
- **Expense Reimbursement:** 5 business days
- **Hardware Delivery:** 3 business days
