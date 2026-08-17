/**
 * Waiting Item Detail View & Completed Item Certificate View
 */

import { BusinessCalendar } from '../engines/businessCalendar.js';

export class WaitingDetailView {
  static render(item) {
    if (!item) {
      return `
        <div class="view-animate text-center py-16">
          <p class="text-slate-400">Item not found or was deleted.</p>
          <button class="btn-secondary mt-4" onclick="window.app.navigate('waiting-list')">Back to List</button>
        </div>
      `;
    }

    const isResolved = item.status === 'RESOLVED';
    const isEscalated = item.status === 'ESCALATED';

    const timelineEvents = item.timeline || [];
    const dependencies = item.dependencies || [];
    const scoreDetails = item.scoreDetails || { score: item.blockingScore || 0, topFactors: [], band: 'Watch' };

    return `
      <div class="view-animate space-y-6 max-w-6xl mx-auto">
        <!-- Back Navigation & Top Actions -->
        <div class="flex items-center justify-between">
          <button class="btn-ghost text-xs gap-1.5" onclick="window.app.navigate('waiting-list')">
            <span class="material-symbols-outlined text-sm">arrow_back</span>
            <span>Back to Waiting Items</span>
          </button>

          <div class="flex items-center gap-2">
            ${!isResolved ? `
              <button class="btn-secondary text-xs" onclick="window.app.openComposerForItem('${item.id}')">
                <span class="material-symbols-outlined text-xs">outgoing_mail</span>
                <span>Draft Follow-up</span>
              </button>
              <button class="btn-secondary text-xs text-purple-400 hover:text-purple-300" onclick="window.app.promptEscalate('${item.id}')">
                <span class="material-symbols-outlined text-xs">upgrade</span>
                <span>Escalate</span>
              </button>
              <button class="btn-primary text-xs bg-emerald-600 hover:bg-emerald-500" onclick="window.app.promptResolve('${item.id}')">
                <span class="material-symbols-outlined text-xs">check_circle</span>
                <span>Mark Resolved</span>
              </button>
            ` : `
              <button class="btn-secondary text-xs text-amber-400" onclick="window.app.promptReopen('${item.id}')">
                <span class="material-symbols-outlined text-xs">replay</span>
                <span>Reopen Item</span>
              </button>
            `}
            <button class="btn-ghost text-xs text-red-400 hover:text-red-300 p-2" onclick="window.app.promptDelete('${item.id}')" title="Delete">
              <span class="material-symbols-outlined text-sm">delete</span>
            </button>
          </div>
        </div>

        <!-- Header Card -->
        <div class="wr-card bg-slate-900 border border-slate-800 p-6 space-y-4">
          <div class="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <!-- Left info -->
            <div class="space-y-2 max-w-3xl">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="status-pill status-${item.status.toLowerCase()}">${item.status}</span>
                <span class="px-2 py-0.5 text-xs bg-slate-800 text-slate-300 rounded font-medium">${item.category}</span>
                ${isResolved ? `
                  <span class="px-2 py-0.5 text-xs bg-emerald-950 text-emerald-300 border border-emerald-800/40 rounded font-semibold flex items-center gap-1">
                    <span class="material-symbols-outlined text-xs">verified</span>
                    Resolution Verified
                  </span>
                ` : ''}
              </div>

              <h2 class="text-xl font-bold text-slate-100">${item.title}</h2>
              <p class="text-xs text-slate-300 leading-relaxed">${item.description || 'No description provided.'}</p>
            </div>

            <!-- Right: Score Gauge -->
            <div class="flex md:flex-col items-center md:items-end justify-between md:justify-center p-3 bg-slate-950/80 border border-slate-800 rounded-xl min-w-[160px]">
              <div class="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Blocking Score</div>
              <div class="text-3xl font-black font-mono mt-1 ${item.blockingScore >= 70 ? 'text-red-400' : 'text-indigo-300'}">
                ${item.blockingScore}<span class="text-xs text-slate-500 font-normal">/100</span>
              </div>
              <div class="text-[11px] font-semibold text-slate-400 mt-0.5">${scoreDetails.band} Priority Band</div>
            </div>
          </div>

          <!-- Metadata Ribbon -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800/80 text-xs">
            <div>
              <div class="text-slate-500 font-medium">Counterparty</div>
              <div class="text-slate-200 font-semibold mt-0.5">${item.counterpartyName}</div>
              <div class="text-slate-400 text-[11px]">${item.counterpartyOrg || ''}</div>
            </div>

            <div>
              <div class="text-slate-500 font-medium">Expected Response (SLA)</div>
              <div class="text-slate-200 font-mono mt-0.5">${item.expectedResponseAt ? new Date(item.expectedResponseAt).toLocaleDateString() : 'None'}</div>
              <div class="text-slate-400 text-[11px]">${BusinessCalendar.formatRelative(item.expectedResponseAt)}</div>
            </div>

            <div>
              <div class="text-slate-500 font-medium">Hard Deadline</div>
              <div class="text-slate-200 font-mono mt-0.5 ${item.hardDeadlineAt ? 'text-amber-400 font-semibold' : ''}">${item.hardDeadlineAt ? new Date(item.hardDeadlineAt).toLocaleDateString() : 'None'}</div>
              <div class="text-slate-400 text-[11px]">${item.hardDeadlineAt ? BusinessCalendar.formatRelative(item.hardDeadlineAt) : 'No hard deadline'}</div>
            </div>

            <div>
              <div class="text-slate-500 font-medium">Follow-ups / Escalations</div>
              <div class="text-slate-200 font-semibold mt-0.5">${item.followUpCount || 0} follow-ups &bull; ${item.escalationCount || 0} escalations</div>
              <div class="text-slate-400 text-[11px]">Requested ${new Date(item.requestSentAt || item.createdAt).toLocaleDateString()}</div>
            </div>
          </div>
        </div>

        <!-- Resolution Summary Banner if Resolved -->
        ${isResolved ? `
          <div class="p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-xl space-y-2">
            <div class="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <span class="material-symbols-outlined text-base">task_alt</span>
              <span>Outcome & Resolution Summary</span>
            </div>
            <p class="text-xs text-emerald-200/90 leading-relaxed font-mono">
              ${item.resolutionSummary || 'Completed without formal resolution note.'}
            </p>
          </div>
        ` : ''}

        <!-- Middle 2-Column: Score Explanation & Escalation Ladder -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Left: Downstream Dependencies & Score Factors (2 cols) -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Downstream Dependencies Card -->
            <div class="wr-card bg-slate-900 border border-slate-800 p-5 space-y-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-indigo-400 text-lg">account_tree</span>
                  <h3 class="text-sm font-bold text-slate-100">Blocked Downstream Deliverables</h3>
                </div>
                <button class="btn-secondary text-xs py-1 px-2" onclick="window.app.promptAddDependency('${item.id}')">
                  <span class="material-symbols-outlined text-xs">add</span>
                  <span>Add Dependency</span>
                </button>
              </div>

              <div class="space-y-2">
                ${dependencies.length === 0 ? `
                  <p class="text-xs text-slate-500 py-3 text-center">No explicit downstream dependencies mapped to this waiting item.</p>
                ` : dependencies.map(dep => `
                  <div class="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg text-xs">
                    <div class="space-y-0.5">
                      <div class="font-semibold text-slate-200">${dep.label}</div>
                      <div class="text-[11px] text-slate-400 font-mono">Target: [${dep.targetType}] ${dep.targetRef || ''} &bull; Criticality: ${dep.criticality}/5</div>
                    </div>
                    <button class="text-slate-500 hover:text-red-400 material-symbols-outlined text-base" onclick="window.app.removeDependency('${dep.id}', '${item.id}')" title="Remove">delete</button>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Timeline Stream -->
            <div class="wr-card bg-slate-900 border border-slate-800 p-5 space-y-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-indigo-400 text-lg">history</span>
                  <h3 class="text-sm font-bold text-slate-100">Audit Trail & Communication Timeline</h3>
                </div>
                <button class="btn-secondary text-xs py-1 px-2.5" onclick="window.app.promptAddNote('${item.id}')">
                  <span class="material-symbols-outlined text-xs">edit_note</span>
                  <span>Add Timeline Note</span>
                </button>
              </div>

              <!-- Events stream -->
              <div class="space-y-3 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                ${timelineEvents.map(evt => `
                  <div class="flex items-start gap-3 pl-1 relative">
                    <div class="w-6 h-6 rounded-full bg-slate-900 border border-indigo-500/40 flex items-center justify-center text-indigo-400 flex-shrink-0 z-10">
                      <span class="material-symbols-outlined text-xs">schedule</span>
                    </div>
                    <div class="flex-1 p-3 bg-slate-950/70 border border-slate-800/80 rounded-lg text-xs space-y-1">
                      <div class="flex items-center justify-between">
                        <span class="font-semibold text-slate-200">${evt.title}</span>
                        <span class="text-[10px] font-mono text-slate-500">${new Date(evt.createdAt).toLocaleString()}</span>
                      </div>
                      ${evt.note ? `<p class="text-slate-400 text-[11px] leading-relaxed">${evt.note}</p>` : ''}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Right Sidebar: Escalation Ladder & Engine Factors (1 col) -->
          <div class="space-y-6">
            <!-- Escalation Ladder Widget -->
            <div class="wr-card bg-slate-900 border border-slate-800 p-5 space-y-4">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-purple-400 text-lg">stairs</span>
                <h3 class="text-sm font-bold text-slate-100">Escalation Ladder</h3>
              </div>

              <div class="space-y-2 text-xs">
                <div class="p-2.5 rounded-lg border ${item.escalationCount >= 0 ? 'bg-slate-800/60 border-indigo-500/40' : 'bg-slate-950 border-slate-800 opacity-60'}">
                  <div class="font-semibold text-slate-200 flex items-center justify-between">
                    <span>Level 1: Gentle Reminder</span>
                    ${item.followUpCount > 0 ? '<span class="text-emerald-400 text-[10px]">✓ Executed</span>' : ''}
                  </div>
                  <div class="text-[11px] text-slate-400 mt-0.5">Direct channel ping / email nudge</div>
                </div>

                <div class="p-2.5 rounded-lg border ${item.followUpCount >= 2 ? 'bg-slate-800/60 border-indigo-500/40' : 'bg-slate-950 border-slate-800 opacity-60'}">
                  <div class="font-semibold text-slate-200 flex items-center justify-between">
                    <span>Level 2: Formal Follow-up</span>
                    ${item.followUpCount >= 2 ? '<span class="text-emerald-400 text-[10px]">✓ Executed</span>' : ''}
                  </div>
                  <div class="text-[11px] text-slate-400 mt-0.5">Structured deadline statement & impact</div>
                </div>

                <div class="p-2.5 rounded-lg border ${item.escalationCount >= 1 ? 'bg-purple-950/40 border-purple-500/50 text-purple-200' : 'bg-slate-950 border-slate-800 opacity-60'}">
                  <div class="font-semibold flex items-center justify-between">
                    <span>Level 3: Supervisor / Lead</span>
                    ${item.escalationCount >= 1 ? '<span class="text-purple-300 text-[10px]">⚡ Active</span>' : ''}
                  </div>
                  <div class="text-[11px] text-slate-400 mt-0.5">CC Department Head / Hiring Manager</div>
                </div>

                <div class="p-2.5 rounded-lg border bg-slate-950 border-slate-800 opacity-60">
                  <div class="font-semibold text-slate-200">Level 4: Urgent In-Person / Phone</div>
                  <div class="text-[11px] text-slate-400 mt-0.5">Direct phone call or office visit</div>
                </div>
              </div>
            </div>

            <!-- Score Factors Breakdown -->
            <div class="wr-card bg-slate-900 border border-slate-800 p-5 space-y-4">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-indigo-400 text-lg">tune</span>
                <h3 class="text-sm font-bold text-slate-100">Score Factor Analysis</h3>
              </div>

              <div class="space-y-3 text-xs">
                ${(scoreDetails.topFactors || []).map(f => `
                  <div>
                    <div class="flex items-center justify-between text-[11px] mb-1">
                      <span class="capitalize text-slate-300 font-medium">${f.factor}</span>
                      <span class="font-mono text-indigo-300 font-bold">+${f.contribution} pts</span>
                    </div>
                    <div class="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                      <div class="h-full bg-indigo-500 rounded-full" style="width: ${Math.min(100, f.contribution * 3.5)}%"></div>
                    </div>
                  </div>
                `).join('')}
              </div>

              <p class="text-[11px] text-slate-400 leading-relaxed pt-2 border-t border-slate-800">
                ${scoreDetails.summary || 'Calculated based on standard blocking weights.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
