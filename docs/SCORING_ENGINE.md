# Blocking Impact Score Engine Specification

## 1. Score Normalization & Formula

The **Blocking Impact Score** is a normalized integer metric ($0 \le S \le 100$) representing the structural severity, urgency, and downstream disruption of an unresolved dependency.

The score is calculated via the weighted multi-factor formula:

$$S = 0.28 \cdot C + 0.22 \cdot D + 0.18 \cdot B + 0.14 \cdot A + 0.08 \cdot F + 0.10 \cdot P$$

Where:
- **$C$ = Consequence / Severity of Blocking** (0 to 100): Direct impact if the item is never resolved.
- **$D$ = Due Date & Delay Urgency** (0 to 100): Calculated from elapsed SLA and business days remaining until hard deadline.
- **$B$ = Blocked Downstream Dependencies** (0 to 100): Count and cumulative weight of items gated by this dependency ($B = \min(100, 25 \cdot N)$).
- **$A$ = Age & Inaction Latency** (0 to 100): Normalized waiting duration relative to category baseline.
- **$F$ = Follow-up Exhaustion Penalty** (0 to 100): Scaled with unanswered check-ins.
- **$P$ = Counterparty Reliability / Historical Delay** (0 to 100): Weighted delay frequency of the counterparty.

---

## 2. Score Bands & Tiers

| Score Range | Severity Band | Visual Badge Style | Operational Meaning | Recommended SLA |
| :--- | :--- | :--- | :--- | :--- |
| **$75 - 100$** | **CRITICAL** | Red (`#ef4444`) | Imminent blocker; halts critical path work | $< 24$ hours |
| **$50 - 74$** | **HIGH** | Amber (`#f59e0b`) | Major dependency; overdue follow-up | $1 - 2$ business days |
| **$25 - 49$** | **MEDIUM** | Blue (`#3b82f6`) | Active waiting item within SLA tolerance | $3 - 5$ business days |
| **$0 - 24$** | **LOW** | Slate (`#64748b`) | Low-stakes or long-lead deliverable | Routine weekly triage |

---

## 3. Explainable Factor Breakdown

Every calculated score outputs an audit trail containing:
1. `rawScore`: Unrounded floating point score.
2. `score`: Integer clamped between 0 and 100.
3. `band`: Severity enum (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`).
4. `factors`: Dictionary of normalized component inputs ($C, D, B, A, F, P$).
5. `explanation`: Human-readable summary sentence for display in detail drawers and kinetic focus flows.
