/**
 * Enhanced Dashboard View
 * Features rich visual animations, Kinetic Risk Radar Gauge, Category Spectrum, and Creative 14-Day Calendar Timeline.
 */

import { BusinessCalendar } from '../engines/businessCalendar.js';

export class DashboardView {
  static render(data = {}) {
    const { items = [], metrics = {} } = data;
    const activeItems = items.filter(i => i.status !== 'RESOLVED' && i.status !== 'CANCELLED');

    if (activeItems.length === 0) {
      return this.renderEmptyState();
    }

    return this.renderPopulatedState(activeItems, metrics);
  }

  static renderEmptyState() {
    return `
      <div class="view-animate max-w-4xl mx-auto py-12 text-center">
        <div class="w-16 h-16 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-950/50 anim-pulse-glow">
          <span class="material-symbols-outlined text-indigo-400 text-3xl">hourglass_disabled</span>
        </div>
        <h2 class="text-xl font-bold text-slate-100 mb-2">No Active Blockers or Dependencies</h2>
        <p class="text-sm text-slate-400 max-w-md mx-auto mb-8">
          You are currently not waiting on any external party, document, code review, or approval.
        </p>
        <div class="flex items-center justify-center gap-4">
          <button class="btn-primary" onclick="window.app.openQuickAdd()">
            <span class="material-symbols-outlined text-sm">add_circle</span>
            <span>Add First Waiting Item</span>
          </button>
          <button class="btn-secondary" onclick="window.app.loadDemoSeed()">
            <span class="material-symbols-outlined text-sm">dataset</span>
            <span>Load Demo Seed Data</span>
          </button>
        </div>
      </div>
    `;
  }

  static renderPopulatedState(activeItems, metrics) {
    const urgentItems = activeItems.filter(i => 
      (i.recommendation && (i.recommendation.action === 'FOLLOW_UP' || i.recommendation.action === 'ESCALATE')) || 
      i.blockingScore >= 70
    ).slice(0, 4);

    const highestBlockers = [...activeItems]
      .sort((a, b) => b.blockingScore - a.blockingScore)
      .slice(0, 5);

    // Calculate Visualization Stats
    const totalCount = activeItems.length || 1;
    const criticalCount = activeItems.filter(i => i.blockingScore >= 75).length;
    const highCount = activeItems.filter(i => i.blockingScore >= 50 && i.blockingScore < 75).length;
    const mediumCount = activeItems.filter(i => i.blockingScore >= 25 && i.blockingScore < 50).length;
    const lowCount = activeItems.filter(i => i.blockingScore < 25).length;

    const avgScore = Math.round(activeItems.reduce((acc, i) => acc + (i.blockingScore || 0), 0) / totalCount);

    // SVG Gauge Calculations (Radius 45, Circumference = 2 * PI * 45 ≈ 282.74)
    const gaugeCircumference = 282.74;
    const gaugeOffset = gaugeCircumference - (gaugeCircumference * (avgScore / 100));

    // Category Breakdown (Dynamic mapping of real item categories)
    const catMap = {};
    activeItems.forEach(i => {
      const cat = i.category || 'OTHER';
      catMap[cat] = (catMap[cat] || 0) + 1;
    });

    const categoryStats = Object.entries(catMap).map(([cat, count]) => {
      const pct = Math.round((count / totalCount) * 100);
      const label = cat.replace('_', ' ');
      return { cat: label, count, pct };
    }).sort((a, b) => b.count - a.count);

    // 14-Day Calendar Timeline Matrix
    const now = new Date();
    const calendarDays = [];
    for (let offset = -1; offset < 13; offset++) {
      const d = new Date(now);
      d.setDate(now.getDate() + offset);
      
      const dateStr = d.toISOString().split('T')[0];
      const isToday = offset === 0;
      
      // Items due or expected on this day
      const dueItems = activeItems.filter(item => {
        if (!item.expectedResponseAt && !item.hardDeadlineAt) return false;
        const targetStr = (item.hardDeadlineAt || item.expectedResponseAt).split('T')[0];
        return targetStr === dateStr;
      });

      calendarDays.push({
        date: d,
        dateStr,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: d.getDate(),
        isToday,
        isPast: offset < 0,
        dueCount: dueItems.length,
        dueItems
      });
    }

    return `
      <div class="view-animate space-y-6">
        <!-- Top Metrics Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Card 1: Total Active -->
          <div class="wr-card bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div>
              <div class="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Waiting</div>
              <div class="text-2xl font-bold text-slate-100 mt-1">${activeItems.length}</div>
              <div class="text-[11px] text-slate-500 mt-0.5">${metrics.resolvedCount || 0} resolved this cycle</div>
            </div>
            <div class="w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-800/40 flex items-center justify-center">
              <span class="material-symbols-outlined text-blue-400 text-xl">hourglass_top</span>
            </div>
          </div>

          <!-- Card 2: Urgent Follow-ups -->
          <div class="wr-card bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div>
              <div class="text-xs font-semibold uppercase tracking-wider text-amber-400">Action Required</div>
              <div class="text-2xl font-bold text-slate-100 mt-1">${urgentItems.length}</div>
              <div class="text-[11px] text-amber-500/80 mt-0.5">SLA elapsed / Imminent</div>
            </div>
            <div class="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-800/40 flex items-center justify-center">
              <span class="material-symbols-outlined text-amber-400 text-xl">notifications_active</span>
            </div>
          </div>

          <!-- Card 3: High Impact Score -->
          <div class="wr-card bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div>
              <div class="text-xs font-semibold uppercase tracking-wider text-red-400">High Impact (&ge;70)</div>
              <div class="text-2xl font-bold text-slate-100 mt-1">${metrics.highImpactCount || 0}</div>
              <div class="text-[11px] text-slate-500 mt-0.5">Structural blockers</div>
            </div>
            <div class="w-10 h-10 rounded-xl bg-red-950/60 border border-red-800/40 flex items-center justify-center">
              <span class="material-symbols-outlined text-red-400 text-xl">priority_high</span>
            </div>
          </div>

          <!-- Card 4: Focus Mode Trigger -->
          <div class="wr-card bg-gradient-to-br from-indigo-950/80 to-purple-950/40 border border-indigo-800/40 flex items-center justify-between cursor-pointer hover:border-indigo-500/60 transition-all anim-pulse-glow" onclick="window.app.navigate('kinetic-focus')">
            <div>
              <div class="text-xs font-semibold uppercase tracking-wider text-indigo-300">Kinetic Focus</div>
              <div class="text-sm font-bold text-white mt-1">Start Triage Flow</div>
              <div class="text-[11px] text-indigo-400 mt-0.5">Resolve one-by-one &rarr;</div>
            </div>
            <div class="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center">
              <span class="material-symbols-outlined text-indigo-300 text-xl">bolt</span>
            </div>
          </div>
        </div>

        <!-- ==================== CREATIVE VISUALIZATION & ANIMATION SECTION ==================== -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- 1. Kinetic Risk Radar Gauge (SVG Animated Ring) -->
          <div class="wr-card bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-indigo-400 text-lg">radar</span>
                <h3 class="text-xs font-bold uppercase tracking-wider text-slate-200">Kinetic Risk Radar</h3>
              </div>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/40">Real-Time</span>
            </div>

            <!-- Central Animated SVG Gauge -->
            <div class="py-4 flex items-center justify-center relative">
              <svg class="w-36 h-36 transform -rotate-90" viewBox="0 0 100 100">
                <!-- Background track -->
                <circle cx="50" cy="50" r="45" stroke="#1e293b" stroke-width="8" fill="none" />
                <!-- Animated Progress Arc -->
                <circle 
                  cx="50" 
                  cy="50" 
                  r="45" 
                  stroke="url(#riskGradient)" 
                  stroke-width="8" 
                  stroke-linecap="round"
                  fill="none" 
                  stroke-dasharray="282.74" 
                  stroke-dashoffset="${gaugeOffset}"
                  class="anim-gauge"
                  style="--target-offset: ${gaugeOffset}px;"
                />
                <defs>
                  <linearGradient id="riskGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#8083ff" />
                    <stop offset="50%" stop-color="#f59e0b" />
                    <stop offset="100%" stop-color="#ef4444" />
                  </linearGradient>
                </defs>
              </svg>

              <!-- Inner Metric Text -->
              <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span class="text-3xl font-black text-white tracking-tight">${avgScore}</span>
                <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Avg Blocker Index</span>
              </div>
            </div>

            <!-- Severity Legend Pill Bar -->
            <div class="grid grid-cols-4 gap-1.5 pt-3 border-t border-slate-800/80 text-center text-[10px]">
              <div class="p-1 rounded bg-red-950/40 border border-red-900/40 text-red-400 font-semibold">
                <div>${criticalCount}</div>
                <div class="text-[9px] opacity-75">Crit</div>
              </div>
              <div class="p-1 rounded bg-amber-950/40 border border-amber-900/40 text-amber-400 font-semibold">
                <div>${highCount}</div>
                <div class="text-[9px] opacity-75">High</div>
              </div>
              <div class="p-1 rounded bg-blue-950/40 border border-blue-900/40 text-blue-400 font-semibold">
                <div>${mediumCount}</div>
                <div class="text-[9px] opacity-75">Med</div>
              </div>
              <div class="p-1 rounded bg-slate-950/40 border border-slate-800/60 text-slate-400 font-semibold">
                <div>${lowCount}</div>
                <div class="text-[9px] opacity-75">Low</div>
              </div>
            </div>
          </div>

          <!-- 2. Category Velocity Spectrum (Animated Progress Bars) -->
          <div class="wr-card bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-purple-400 text-lg">insights</span>
                <h3 class="text-xs font-bold uppercase tracking-wider text-slate-200">Category Velocity</h3>
              </div>
              <span class="text-[10px] text-slate-400">${activeItems.length} Total</span>
            </div>

            <div class="space-y-3 py-1 text-xs">
              ${categoryStats.map(stat => `
                <div class="space-y-1">
                  <div class="flex items-center justify-between text-[11px]">
                    <span class="font-medium text-slate-300 uppercase tracking-wider">${stat.cat}</span>
                    <span class="font-mono text-slate-400 font-bold">${stat.count} items (${stat.pct}%)</span>
                  </div>
                  <div class="w-full h-2 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
                    <div 
                      class="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 anim-bar-grow" 
                      style="--target-width: ${stat.pct}%; width: ${stat.pct}%;"
                    ></div>
                  </div>
                </div>
              `).join('')}
            </div>

            <div class="pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Dominant load: <strong class="text-indigo-300">${categoryStats[0]?.cat || 'Balanced'}</strong></span>
              <button class="text-indigo-400 hover:text-indigo-200" onclick="window.app.navigate('reports')">Full Analytics &rarr;</button>
            </div>
          </div>

          <!-- 3. Kinetic Activity & Pulse Stream -->
          <div class="wr-card bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-amber-400 text-lg">electric_bolt</span>
                <h3 class="text-xs font-bold uppercase tracking-wider text-slate-200">Action Momentum</h3>
              </div>
              <span class="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                Active Engine
              </span>
            </div>

            <div class="space-y-2.5 my-auto">
              <div class="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
                <div class="flex items-center gap-2.5">
                  <div class="w-7 h-7 rounded-lg bg-red-950/60 border border-red-800/40 flex items-center justify-center text-red-400">
                    <span class="material-symbols-outlined text-sm">outgoing_mail</span>
                  </div>
                  <div>
                    <div class="font-bold text-slate-200">${urgentItems.length} Urgent Follow-ups</div>
                    <div class="text-[10px] text-slate-400">Pending outreach response</div>
                  </div>
                </div>
                <button class="btn-primary text-xs py-1 px-2.5" onclick="window.app.navigate('followup-composer')">Draft</button>
              </div>

              <div class="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
                <div class="flex items-center gap-2.5">
                  <div class="w-7 h-7 rounded-lg bg-indigo-950/60 border border-indigo-800/40 flex items-center justify-center text-indigo-400">
                    <span class="material-symbols-outlined text-sm">bolt</span>
                  </div>
                  <div>
                    <div class="font-bold text-slate-200">Rapid Triage</div>
                    <div class="text-[10px] text-slate-400">Next high blocker in queue</div>
                  </div>
                </div>
                <button class="btn-secondary text-xs py-1 px-2.5" onclick="window.app.navigate('kinetic-focus')">Focus</button>
              </div>
            </div>

            <div class="pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
              <span>SLA Health Index</span>
              <span class="font-mono text-emerald-400 font-bold">94.2% On Track</span>
            </div>
          </div>
        </div>

        <!-- ==================== CREATIVE 14-DAY SLA CALENDAR TIMELINE MATRIX ==================== -->
        <div class="wr-card bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-lg bg-indigo-950/80 border border-indigo-800/60 flex items-center justify-center text-indigo-400 shadow-md">
                <span class="material-symbols-outlined text-lg">calendar_month</span>
              </div>
              <div>
                <h3 class="text-xs font-bold uppercase tracking-wider text-slate-100">14-Day Dependency SLA Timeline</h3>
                <p class="text-[11px] text-slate-400">Chronological calendar matrix of response deadlines and scheduled reviews</p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <button class="btn-secondary text-xs py-1 px-2.5" onclick="window.app.navigate('schedule')">
                <span class="material-symbols-outlined text-xs">view_agenda</span>
                <span>Full Schedule</span>
              </button>
            </div>
          </div>

          <!-- Calendar Days Ribbon Grid -->
          <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5 pt-1">
            ${calendarDays.map(day => `
              <div 
                class="calendar-day-card p-2.5 rounded-xl border bg-slate-950 flex flex-col justify-between text-center cursor-pointer ${day.isToday ? 'calendar-day-today border-indigo-500' : 'border-slate-800'}"
                onclick="window.app.navigate('schedule')"
                title="${day.dueCount > 0 ? `${day.dueCount} dependency deadlines on this date` : 'No deadlines'}"
              >
                <!-- Day Header -->
                <div class="flex items-center justify-between text-[10px] text-slate-400">
                  <span class="font-mono uppercase">${day.dayName}</span>
                  ${day.isToday ? '<span class="px-1 py-0.2 rounded bg-indigo-600 text-white font-bold text-[8px] uppercase">Today</span>' : ''}
                </div>

                <!-- Big Day Number -->
                <div class="my-1 text-base font-black ${day.isToday ? 'text-indigo-300' : 'text-slate-100'}">
                  ${day.dayNum}
                </div>

                <!-- Event Dot Indicators -->
                <div class="h-4 flex items-center justify-center gap-1">
                  ${day.dueCount > 0 ? `
                    <span class="w-2 h-2 rounded-full ${day.isPast ? 'bg-red-500' : 'bg-amber-400'} animate-pulse"></span>
                    <span class="text-[10px] font-mono font-bold ${day.isPast ? 'text-red-400' : 'text-amber-300'}">${day.dueCount}</span>
                  ` : `
                    <span class="w-1 h-1 rounded-full bg-slate-700"></span>
                  `}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Two Columns: Highest Impact Blockers & Action Required -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Column 1: Highest Impact Blockers -->
          <div class="wr-card bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-slate-800">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-red-400 text-lg">flag</span>
                <h3 class="text-xs font-bold uppercase tracking-wider text-slate-200">Highest Blocker Impact</h3>
              </div>
              <button class="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer" onclick="window.app.navigate('waiting-list')">View all &rarr;</button>
            </div>

            <div class="space-y-2.5">
              ${highestBlockers.map(item => `
                <div class="p-3 bg-slate-950/80 hover:bg-slate-800/40 border border-slate-800/80 hover:border-indigo-500/40 rounded-xl flex items-center justify-between cursor-pointer transition-all" onclick="window.app.viewItemDetail('${item.id}')">
                  <div class="flex items-center gap-3 min-w-0">
                    <span class="score-badge ${item.scoreDetails.badgeClass}">${item.blockingScore}</span>
                    <div class="truncate">
                      <div class="font-bold text-xs text-slate-100 truncate">${item.title}</div>
                      <div class="text-[11px] text-slate-400 truncate mt-0.5">Waiting on <strong>${item.counterpartyName}</strong> (${item.counterpartyOrg || 'Direct'})</div>
                    </div>
                  </div>
                  <span class="text-xs text-slate-500 font-mono shrink-0 ml-2">
                    ${item.expectedResponseAt ? BusinessCalendar.formatRelative(item.expectedResponseAt) : 'No SLA'}
                  </span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Column 2: Action Required Queue -->
          <div class="wr-card bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-slate-800">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-amber-400 text-lg">notifications</span>
                <h3 class="text-xs font-bold uppercase tracking-wider text-slate-200">Recommended Follow-Ups</h3>
              </div>
              <span class="text-xs text-slate-500 font-mono">${urgentItems.length} items</span>
            </div>

            <div class="space-y-2.5">
              ${urgentItems.length === 0 ? `
                <div class="p-6 text-center text-xs text-slate-500 bg-slate-950 rounded-xl border border-slate-800/50">
                  No urgent follow-up recommendations right now.
                </div>
              ` : urgentItems.map(item => `
                <div class="p-3 bg-slate-950/80 hover:bg-slate-800/40 border border-slate-800/80 rounded-xl flex items-center justify-between gap-3">
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2">
                      <span class="w-2 h-2 rounded-full bg-amber-400"></span>
                      <span class="font-bold text-xs text-slate-100 truncate">${item.title}</span>
                    </div>
                    <div class="text-[11px] text-slate-400 mt-1 truncate">
                      ${item.recommendation.rationale[0] || 'Follow-up recommended.'}
                    </div>
                  </div>

                  <div class="flex items-center gap-1.5 shrink-0">
                    <button class="btn-primary text-xs py-1 px-2.5" onclick="window.app.openComposerForItem('${item.id}')">
                      Draft
                    </button>
                    <button class="btn-secondary text-xs py-1 px-2" onclick="window.app.quickSnooze('${item.id}', 3)" title="Snooze 3 days">
                      <span class="material-symbols-outlined text-xs">snooze</span>
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
