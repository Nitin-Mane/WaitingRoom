/**
 * Schedule & Deadlines Agenda View
 */

import { BusinessCalendar } from '../engines/businessCalendar.js';

export class ScheduleView {
  static render(data = {}) {
    const { items = [] } = data;
    const activeItems = items.filter(i => i.status !== 'RESOLVED' && i.status !== 'CANCELLED');
    const now = new Date();

    // Grouping
    const overdue = [];
    const thisWeek = [];
    const upcoming = [];
    const noDeadline = [];

    activeItems.forEach(item => {
      const dateStr = item.hardDeadlineAt || item.expectedResponseAt;
      if (!dateStr) {
        noDeadline.push(item);
        return;
      }

      const d = new Date(dateStr);
      const diffDays = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

      if (diffDays < 0) overdue.push(item);
      else if (diffDays <= 7) thisWeek.push(item);
      else upcoming.push(item);
    });

    return `
      <div class="view-animate max-w-5xl mx-auto space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-base font-bold text-slate-100">Schedule & Deadlines Agenda</h2>
            <p class="text-xs text-slate-400">Chronological review of response SLAs and hard cutoff deadlines</p>
          </div>
        </div>

        <!-- 1. Overdue Section -->
        ${overdue.length > 0 ? `
          <div class="space-y-3">
            <div class="flex items-center gap-2 text-red-400 font-bold text-xs">
              <span class="material-symbols-outlined text-base">error</span>
              <span>Overdue SLAs & Deadlines (${overdue.length})</span>
            </div>

            <div class="space-y-2">
              ${overdue.map(item => this.renderScheduleRow(item, 'border-red-900/60 bg-red-950/20')).join('')}
            </div>
          </div>
        ` : ''}

        <!-- 2. This Week Section -->
        <div class="space-y-3">
          <div class="flex items-center gap-2 text-amber-400 font-bold text-xs">
            <span class="material-symbols-outlined text-base">calendar_today</span>
            <span>Due This Week (${thisWeek.length})</span>
          </div>

          <div class="space-y-2">
            ${thisWeek.length === 0 ? `
              <div class="p-4 text-center text-slate-500 text-xs bg-slate-900/40 rounded-lg border border-slate-800">No items due this week.</div>
            ` : thisWeek.map(item => this.renderScheduleRow(item, 'border-amber-900/40 bg-slate-900')).join('')}
          </div>
        </div>

        <!-- 3. Upcoming Section -->
        <div class="space-y-3">
          <div class="flex items-center gap-2 text-indigo-400 font-bold text-xs">
            <span class="material-symbols-outlined text-base">event_upcoming</span>
            <span>Upcoming / Later (${upcoming.length})</span>
          </div>

          <div class="space-y-2">
            ${upcoming.length === 0 ? `
              <div class="p-4 text-center text-slate-500 text-xs bg-slate-900/40 rounded-lg border border-slate-800">No distant deadline items.</div>
            ` : upcoming.map(item => this.renderScheduleRow(item, 'border-slate-800 bg-slate-900')).join('')}
          </div>
        </div>
      </div>
    `;
  }

  static renderScheduleRow(item, styleClasses) {
    const targetDate = item.hardDeadlineAt || item.expectedResponseAt;
    const isHard = !!item.hardDeadlineAt;

    return `
      <div class="wr-card ${styleClasses} p-4 flex items-center justify-between gap-4 cursor-pointer hover:border-indigo-500/50 transition-all" onclick="window.app.viewItemDetail('${item.id}')">
        <div class="flex items-center gap-3">
          <span class="score-badge ${item.scoreDetails ? item.scoreDetails.badgeClass : ''}">${item.blockingScore || 0}</span>
          <div>
            <div class="font-bold text-xs text-slate-100">${item.title}</div>
            <div class="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
              <span>Waiting on <strong>${item.counterpartyName}</strong></span>
              <span>&bull;</span>
              <span class="${isHard ? 'text-amber-400 font-semibold' : 'text-slate-400'}">${isHard ? 'Hard Deadline' : 'Response SLA'}</span>
            </div>
          </div>
        </div>

        <div class="text-right flex-shrink-0 font-mono text-xs">
          <div class="font-bold text-slate-200">${targetDate ? new Date(targetDate).toLocaleDateString() : '—'}</div>
          <div class="text-[10px] text-slate-400">${BusinessCalendar.formatRelative(targetDate)}</div>
        </div>
      </div>
    `;
  }
}
