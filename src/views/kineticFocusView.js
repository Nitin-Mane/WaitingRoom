/**
 * Kinetic Focus View
 * Distraction-free triage flow for rapid blocker resolution and follow-up logging.
 */

import { BusinessCalendar } from '../engines/businessCalendar.js';

export class KineticFocusView {
  static render(data = {}) {
    const { items = [], currentIndex = 0 } = data;
    const activeItems = items.filter(i => i.status !== 'RESOLVED' && i.status !== 'CANCELLED');

    if (activeItems.length === 0) {
      return `
        <div class="view-animate max-w-2xl mx-auto text-center py-20">
          <div class="w-16 h-16 rounded-full bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center mx-auto mb-4 text-emerald-400">
            <span class="material-symbols-outlined text-3xl">task_alt</span>
          </div>
          <h2 class="text-xl font-bold text-slate-100">All Caught Up!</h2>
          <p class="text-xs text-slate-400 mt-2">There are no pending blockers requiring your attention.</p>
          <button class="btn-primary mt-6 text-xs" onclick="window.app.navigate('dashboard')">Back to Dashboard</button>
        </div>
      `;
    }

    const safeIndex = Math.min(currentIndex, activeItems.length - 1);
    const item = activeItems[safeIndex];

    return `
      <div class="view-animate max-w-4xl mx-auto space-y-6">
        <!-- Top Flow Header -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-amber-950/60 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <span class="material-symbols-outlined text-lg">bolt</span>
            </div>
            <div>
              <h2 class="text-base font-bold text-slate-100">Kinetic Focus Flow</h2>
              <p class="text-xs text-slate-400">Triage blockers one-by-one with rapid actions</p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <span class="text-xs font-mono text-slate-400 font-semibold">
              Item ${safeIndex + 1} of ${activeItems.length}
            </span>
            <button class="btn-ghost text-xs" onclick="window.app.navigate('dashboard')">Exit Focus</button>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
          <div class="h-full bg-indigo-500 transition-all duration-300" style="width: ${((safeIndex + 1) / activeItems.length) * 100}%"></div>
        </div>

        <!-- Main Focus Card -->
        <div class="wr-card bg-slate-900 border-2 border-indigo-500/40 p-8 space-y-6 shadow-2xl relative overflow-hidden">
          <!-- Ambient glowing orb -->
          <div class="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none"></div>

          <!-- Top Status and Score -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="status-pill status-${item.status.toLowerCase()}">${item.status}</span>
              <span class="px-2.5 py-0.5 text-xs bg-slate-800 text-slate-300 rounded font-medium">${item.category}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs text-slate-400 font-semibold uppercase">Impact</span>
              <span class="score-badge ${item.scoreDetails.badgeClass} text-sm px-2.5 py-1">${item.blockingScore}/100</span>
            </div>
          </div>

          <!-- Title & Context -->
          <div class="space-y-2">
            <h1 class="text-2xl font-bold text-slate-100 tracking-tight">${item.title}</h1>
            <p class="text-sm text-slate-300 leading-relaxed">${item.description || 'No description provided.'}</p>
          </div>

          <!-- Counterparty & SLAs Info Box -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-950/80 border border-slate-800 rounded-xl text-xs">
            <div>
              <div class="text-slate-500 font-semibold">Waiting On</div>
              <div class="text-slate-200 font-bold text-sm mt-0.5">${item.counterpartyName}</div>
              <div class="text-slate-400 text-[11px]">${item.counterpartyOrg || ''}</div>
            </div>

            <div>
              <div class="text-slate-500 font-semibold">Expected Response</div>
              <div class="text-slate-200 font-mono mt-0.5 font-bold">${item.expectedResponseAt ? new Date(item.expectedResponseAt).toLocaleDateString() : 'None'}</div>
              <div class="text-slate-400 text-[11px]">${BusinessCalendar.formatRelative(item.expectedResponseAt)}</div>
            </div>

            <div>
              <div class="text-slate-500 font-semibold">Recommended Action</div>
              <div class="text-amber-400 font-bold mt-0.5">${item.recommendation.action}</div>
              <div class="text-slate-400 text-[11px] truncate">${item.recommendation.rationale[0] || ''}</div>
            </div>
          </div>

          <!-- Rapid Action Buttons Grid -->
          <div class="pt-4 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button class="btn-primary justify-center py-3 text-xs" onclick="window.app.openComposerForItem('${item.id}')">
              <span class="material-symbols-outlined text-sm">outgoing_mail</span>
              <span>Draft Follow-up</span>
            </button>

            <button class="btn-secondary justify-center py-3 text-xs" onclick="window.app.quickSnooze('${item.id}', 3)">
              <span class="material-symbols-outlined text-sm">snooze</span>
              <span>Snooze (3 Days)</span>
            </button>

            <button class="btn-secondary justify-center py-3 text-xs text-purple-400" onclick="window.app.promptEscalate('${item.id}')">
              <span class="material-symbols-outlined text-sm">upgrade</span>
              <span>Escalate</span>
            </button>

            <button class="btn-secondary justify-center py-3 text-xs text-emerald-400" onclick="window.app.promptResolve('${item.id}')">
              <span class="material-symbols-outlined text-sm">check_circle</span>
              <span>Mark Resolved</span>
            </button>
          </div>
        </div>

        <!-- Navigation Step Buttons -->
        <div class="flex items-center justify-between text-xs text-slate-500">
          <button class="btn-ghost" ${safeIndex === 0 ? 'disabled' : ''} onclick="window.app.navigateFocus(${safeIndex - 1})">
            &larr; Previous Item
          </button>
          <div class="flex items-center gap-2">
            <span>Press <kbd class="px-1.5 py-0.5 font-mono bg-slate-800 text-slate-300 rounded border border-slate-700">Space</kbd> or</span>
            <button class="btn-secondary text-xs" onclick="window.app.navigateFocus(${safeIndex + 1})">
              Next Item &rarr;
            </button>
          </div>
        </div>
      </div>
    `;
  }
}
