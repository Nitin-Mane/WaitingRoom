/**
 * Notification Center View
 * Provides grouped notification feeds: Action Required, Updates, Upcoming, and System notices.
 */

import { BusinessCalendar } from '../engines/businessCalendar.js';

export class NotificationCenterView {
  static render(data = {}) {
    const { notifications = [], items = [] } = data;
    const activeItems = items.filter(i => i.status !== 'RESOLVED' && i.status !== 'CANCELLED');

    // 1. Action Required notifications (Overdue or Urgent Follow-ups)
    const actionRequired = activeItems.filter(i => 
      (i.recommendation && (i.recommendation.action === 'FOLLOW_UP' || i.recommendation.action === 'ESCALATE')) || 
      i.blockingScore >= 75
    );

    // 2. Recent Updates (Completed or Responded items)
    const recentUpdates = items.filter(i => i.status === 'RESOLVED' || i.status === 'RESPONDED').slice(0, 4);

    // 3. Upcoming (SLA approaching in next 3 days)
    const now = new Date();
    const upcoming = activeItems.filter(i => {
      if (!i.expectedResponseAt && !i.hardDeadlineAt) return false;
      const target = new Date(i.hardDeadlineAt || i.expectedResponseAt);
      const diffDays = (target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays >= 0 && diffDays <= 4;
    });

    return `
      <div class="view-animate max-w-4xl mx-auto space-y-6">
        <!-- Header & Top Actions -->
        <div class="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h1 class="text-xl font-bold text-slate-100 flex items-center gap-2.5">
              <span class="material-symbols-outlined text-indigo-400 text-2xl">notifications_active</span>
              <span>Notification Center</span>
            </h1>
            <p class="text-xs text-slate-400 mt-0.5">Real-time alerts, follow-up reminders, and dependency status updates</p>
          </div>

          <div class="flex items-center gap-2">
            <button class="btn-secondary text-xs py-1.5" onclick="window.app.markAllNotificationsRead()">
              <span class="material-symbols-outlined text-sm">done_all</span>
              <span>Mark all read</span>
            </button>
            <button class="btn-ghost text-xs py-1.5 text-slate-400 hover:text-slate-200" onclick="window.app.clearAllNotifications()">
              <span class="material-symbols-outlined text-sm">clear_all</span>
              <span>Clear feed</span>
            </button>
          </div>
        </div>

        <!-- Section 1: Action Required (Urgent) -->
        <section class="space-y-3">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
            <h2 class="text-xs font-bold uppercase tracking-wider text-red-400">Action Required (${actionRequired.length})</h2>
            <div class="h-px bg-slate-800 flex-1 ml-2"></div>
          </div>

          <div class="space-y-2.5">
            ${actionRequired.length === 0 ? `
              <div class="p-4 bg-slate-900/60 border border-slate-800 rounded-xl text-center text-xs text-slate-500">
                No urgent blockers requiring immediate intervention.
              </div>
            ` : actionRequired.map(item => `
              <div class="wr-card bg-slate-900 border-l-4 border-l-red-500 border-slate-800 p-4 hover:border-slate-700 transition-all flex items-start justify-between gap-4">
                <div class="flex items-start gap-3">
                  <div class="w-9 h-9 rounded-full bg-red-950/80 border border-red-800/60 flex items-center justify-center text-red-400 shrink-0 mt-0.5">
                    <span class="material-symbols-outlined text-lg">error</span>
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="score-badge ${item.scoreDetails.badgeClass}">${item.blockingScore}</span>
                      <h3 class="font-bold text-xs text-slate-100 hover:text-indigo-300 cursor-pointer" onclick="window.app.viewItemDetail('${item.id}')">${item.title}</h3>
                    </div>
                    <p class="text-xs text-slate-400 mt-1 leading-relaxed">
                      ${item.recommendation.rationale[0] || 'Response SLA elapsed. Follow-up recommended.'}
                    </p>
                    <div class="text-[11px] text-slate-500 font-mono mt-1.5 flex items-center gap-2">
                      <span>Waiting on <strong>${item.counterpartyName}</strong></span>
                      <span>&bull;</span>
                      <span class="text-red-400">${item.hardDeadlineAt ? `Deadline: ${BusinessCalendar.formatRelative(item.hardDeadlineAt)}` : 'SLA Overdue'}</span>
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-2 shrink-0">
                  <button class="btn-primary text-xs py-1.5 px-3" onclick="window.app.openComposerForItem('${item.id}')">
                    <span class="material-symbols-outlined text-xs">outgoing_mail</span>
                    <span>Follow up</span>
                  </button>
                  <button class="btn-secondary text-xs py-1.5 px-2" onclick="window.app.quickSnooze('${item.id}', 3)" title="Snooze 3 days">
                    <span class="material-symbols-outlined text-xs">snooze</span>
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </section>

        <!-- Section 2: Updates & Resolutions -->
        <section class="space-y-3">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <h2 class="text-xs font-bold uppercase tracking-wider text-emerald-400">Updates & Resolutions (${recentUpdates.length})</h2>
            <div class="h-px bg-slate-800 flex-1 ml-2"></div>
          </div>

          <div class="space-y-2.5">
            ${recentUpdates.length === 0 ? `
              <div class="p-4 bg-slate-900/60 border border-slate-800 rounded-xl text-center text-xs text-slate-500">
                No recent resolutions recorded in this session.
              </div>
            ` : recentUpdates.map(item => `
              <div class="wr-card bg-slate-900 border border-slate-800 p-4 flex items-start justify-between gap-4">
                <div class="flex items-start gap-3">
                  <div class="w-9 h-9 rounded-full bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                    <span class="material-symbols-outlined text-lg">check_circle</span>
                  </div>
                  <div>
                    <h3 class="font-bold text-xs text-slate-100 hover:text-indigo-300 cursor-pointer" onclick="window.app.viewItemDetail('${item.id}')">${item.title}</h3>
                    <p class="text-xs text-emerald-300/80 mt-0.5">
                      ${item.resolutionSummary || 'Status marked as Completed and downstream work unblocked.'}
                    </p>
                    <div class="text-[11px] text-slate-500 font-mono mt-1">
                      Completed ${item.resolvedAt ? new Date(item.resolvedAt).toLocaleDateString() : 'Recently'} &bull; ${item.counterpartyName}
                    </div>
                  </div>
                </div>

                <button class="btn-ghost text-xs py-1 px-2.5 text-indigo-400" onclick="window.app.viewItemDetail('${item.id}')">
                  <span>View &rarr;</span>
                </button>
              </div>
            `).join('')}
          </div>
        </section>

        <!-- Section 3: Upcoming Deadlines & Review Windows -->
        <section class="space-y-3">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <h2 class="text-xs font-bold uppercase tracking-wider text-blue-400">Upcoming Windows (${upcoming.length})</h2>
            <div class="h-px bg-slate-800 flex-1 ml-2"></div>
          </div>

          <div class="space-y-2.5">
            ${upcoming.length === 0 ? `
              <div class="p-4 bg-slate-900/60 border border-slate-800 rounded-xl text-center text-xs text-slate-500">
                No immediate deadlines in the next 3 days.
              </div>
            ` : upcoming.map(item => `
              <div class="wr-card bg-slate-900 border border-slate-800 p-4 flex items-start justify-between gap-4">
                <div class="flex items-start gap-3">
                  <div class="w-9 h-9 rounded-full bg-blue-950/80 border border-blue-800/60 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                    <span class="material-symbols-outlined text-lg">event</span>
                  </div>
                  <div>
                    <h3 class="font-bold text-xs text-slate-100 hover:text-indigo-300 cursor-pointer" onclick="window.app.viewItemDetail('${item.id}')">${item.title}</h3>
                    <div class="text-xs text-slate-400 mt-0.5 font-mono">
                      Expected response: <strong>${BusinessCalendar.formatRelative(item.expectedResponseAt || item.hardDeadlineAt)}</strong>
                    </div>
                    <div class="text-[11px] text-slate-500 font-mono mt-1">
                      Waiting on ${item.counterpartyName} (${item.counterpartyOrg || 'Direct'})
                    </div>
                  </div>
                </div>

                <button class="btn-secondary text-xs py-1 px-2.5" onclick="window.app.viewItemDetail('${item.id}')">
                  <span>Inspect</span>
                </button>
              </div>
            `).join('')}
          </div>
        </section>

        <!-- Section 4: Local System Health Notifications -->
        <section class="space-y-3">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
            <h2 class="text-xs font-bold uppercase tracking-wider text-slate-400">System & Database Status</h2>
            <div class="h-px bg-slate-800 flex-1 ml-2"></div>
          </div>

          <div class="p-4 bg-slate-900/70 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
            <div class="flex items-center gap-3">
              <span class="material-symbols-outlined text-slate-400 text-xl">shield</span>
              <div>
                <div class="font-bold text-slate-200">Local-First Sandbox Active</div>
                <div class="text-slate-500 text-[11px]">All dependencies and audit events stored in IndexedDB on your local device.</div>
              </div>
            </div>
            <button class="btn-secondary text-xs py-1" onclick="window.app.navigate('system-health')">
              Health Diagnostics
            </button>
          </div>
        </section>
      </div>
    `;
  }
}
