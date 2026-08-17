/**
 * Help Center & Methodology Documentation View
 */

export class HelpDocumentationView {
  static render() {
    return `
      <div class="view-animate max-w-4xl mx-auto space-y-6">
        <!-- Header -->
        <div>
          <h2 class="text-base font-bold text-slate-100">WaitingRoom Methodology & User Guide</h2>
          <p class="text-xs text-slate-400">Core principles of external dependency tracking and follow-up management</p>
        </div>

        <div class="space-y-4 text-xs leading-relaxed">
          <!-- Concept 1 -->
          <div class="wr-card bg-slate-900 border border-slate-800 p-5 space-y-2">
            <h3 class="text-sm font-bold text-indigo-300 flex items-center gap-2">
              <span class="material-symbols-outlined text-base">psychology</span>
              1. What is an External Dependency?
            </h3>
            <p class="text-slate-300">
              Unlike a standard to-do list where tasks are directly actionable by you, an <strong>External Dependency</strong> represents a deliverable where forward progress is blocked until another person, department, process, or system acts.
            </p>
          </div>

          <!-- Concept 2 -->
          <div class="wr-card bg-slate-900 border border-slate-800 p-5 space-y-2">
            <h3 class="text-sm font-bold text-amber-300 flex items-center gap-2">
              <span class="material-symbols-outlined text-base">tune</span>
              2. How the 0–100 Blocking Score Works
            </h3>
            <p class="text-slate-300">
              WaitingRoom continuously computes a normalized score using 6 key factors:
            </p>
            <ul class="list-disc list-inside space-y-1 text-slate-400 pl-2">
              <li><strong>Criticality (28%):</strong> How essential this deliverable is to your core goals.</li>
              <li><strong>Deadline Pressure (22%):</strong> Escalates exponentially as the target cutoff approaches.</li>
              <li><strong>Downstream Breadth (18%):</strong> Number of tasks, projects, or milestones held up.</li>
              <li><strong>Waiting Staleness (14%):</strong> Ratio of elapsed days vs expected response SLA.</li>
              <li><strong>User Priority (10%):</strong> Explicit priority override set by you.</li>
              <li><strong>Financial Exposure (8%):</strong> Budget or financial liability tied to the blocker.</li>
            </ul>
          </div>

          <!-- Concept 3 -->
          <div class="wr-card bg-slate-900 border border-slate-800 p-5 space-y-2">
            <h3 class="text-sm font-bold text-purple-300 flex items-center gap-2">
              <span class="material-symbols-outlined text-base">stairs</span>
              3. The 4-Level Escalation Ladder
            </h3>
            <p class="text-slate-300">
              Follow-ups are structured to maintain positive relationships while ensuring deadlines aren't missed:
            </p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-[11px]">
              <div class="p-2.5 bg-slate-950 rounded border border-slate-800">
                <strong class="text-slate-200">Level 1 — Gentle Nudge:</strong> Friendly check-in on the original channel.
              </div>
              <div class="p-2.5 bg-slate-950 rounded border border-slate-800">
                <strong class="text-slate-200">Level 2 — Formal Follow-up:</strong> Explicit deadline & impact notice.
              </div>
              <div class="p-2.5 bg-slate-950 rounded border border-slate-800">
                <strong class="text-slate-200">Level 3 — Supervisor CC:</strong> Involving leadership or hiring manager.
              </div>
              <div class="p-2.5 bg-slate-950 rounded border border-slate-800">
                <strong class="text-slate-200">Level 4 — Direct Call / In-Person:</strong> High-stakes direct resolution.
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
