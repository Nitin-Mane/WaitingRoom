/**
 * Waiting Items Directory & List View
 */

import { BusinessCalendar } from '../engines/businessCalendar.js';
import { ItemCategory, CategoryLabels } from '../core/types.js';

export class WaitingListView {
  static render(data = {}) {
    const { items = [], currentFilter = 'ALL', currentCategory = 'ALL', currentSort = 'SCORE_DESC', searchQuery = '' } = data;

    // Filter items
    let filtered = items.filter(item => {
      // Status Filter
      if (currentFilter === 'WAITING' && item.status !== 'WAITING') return false;
      if (currentFilter === 'ESCALATED' && item.status !== 'ESCALATED') return false;
      if (currentFilter === 'SNOOZED' && item.status !== 'SNOOZED') return false;
      if (currentFilter === 'RESOLVED' && item.status !== 'RESOLVED') return false;
      if (currentFilter === 'ACTION_REQUIRED') {
        const isUrgent = item.recommendation && (item.recommendation.action === 'FOLLOW_UP' || item.recommendation.action === 'ESCALATE');
        if (!isUrgent || item.status === 'RESOLVED') return false;
      }

      // Category Filter
      if (currentCategory !== 'ALL' && item.category !== currentCategory) return false;

      // Text Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = (item.title || '').toLowerCase().includes(q);
        const matchesCp = (item.counterpartyName || '').toLowerCase().includes(q);
        const matchesOrg = (item.counterpartyOrg || '').toLowerCase().includes(q);
        const matchesTag = Array.isArray(item.tags) && item.tags.some(t => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesCp && !matchesOrg && !matchesTag) return false;
      }

      return true;
    });

    // Sort items
    filtered.sort((a, b) => {
      if (currentSort === 'SCORE_DESC') return (b.blockingScore || 0) - (a.blockingScore || 0);
      if (currentSort === 'DEADLINE_ASC') {
        const dA = a.hardDeadlineAt ? new Date(a.hardDeadlineAt).getTime() : 9999999999999;
        const dB = b.hardDeadlineAt ? new Date(b.hardDeadlineAt).getTime() : 9999999999999;
        return dA - dB;
      }
      if (currentSort === 'AGE_DESC') {
        const tA = new Date(a.requestSentAt || a.createdAt).getTime();
        const tB = new Date(b.requestSentAt || b.createdAt).getTime();
        return tA - tB;
      }
      return 0;
    });

    return `
      <div class="view-animate space-y-4">
        <!-- Controls Bar -->
        <div class="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
          <!-- Left: Filter Pills -->
          <div class="flex items-center gap-1.5 flex-wrap">
            <button class="px-3 py-1 text-xs rounded-lg font-medium transition-colors ${currentFilter === 'ALL' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}" onclick="window.app.setListFilter('ALL')">
              All (${items.length})
            </button>
            <button class="px-3 py-1 text-xs rounded-lg font-medium transition-colors ${currentFilter === 'ACTION_REQUIRED' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-amber-300 hover:bg-slate-700'}" onclick="window.app.setListFilter('ACTION_REQUIRED')">
              ⚡ Action Due
            </button>
            <button class="px-3 py-1 text-xs rounded-lg font-medium transition-colors ${currentFilter === 'WAITING' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}" onclick="window.app.setListFilter('WAITING')">
              Waiting
            </button>
            <button class="px-3 py-1 text-xs rounded-lg font-medium transition-colors ${currentFilter === 'ESCALATED' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-purple-300 hover:bg-slate-700'}" onclick="window.app.setListFilter('ESCALATED')">
              Escalated
            </button>
            <button class="px-3 py-1 text-xs rounded-lg font-medium transition-colors ${currentFilter === 'RESOLVED' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}" onclick="window.app.setListFilter('RESOLVED')">
              Resolved
            </button>
          </div>

          <!-- Right: Search & Category Filter -->
          <div class="flex items-center gap-2 flex-wrap">
            <!-- Category dropdown -->
            <select class="px-2.5 py-1 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-300 focus:outline-none" onchange="window.app.setListCategory(this.value)">
              <option value="ALL">All Categories</option>
              ${Object.entries(CategoryLabels).map(([k, v]) => `
                <option value="${k}" ${currentCategory === k ? 'selected' : ''}>${v}</option>
              `).join('')}
            </select>

            <!-- Sort dropdown -->
            <select class="px-2.5 py-1 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-300 focus:outline-none" onchange="window.app.setListSort(this.value)">
              <option value="SCORE_DESC" ${currentSort === 'SCORE_DESC' ? 'selected' : ''}>Highest Score</option>
              <option value="DEADLINE_ASC" ${currentSort === 'DEADLINE_ASC' ? 'selected' : ''}>Closest Deadline</option>
              <option value="AGE_DESC" ${currentSort === 'AGE_DESC' ? 'selected' : ''}>Longest Waiting</option>
            </select>

            <!-- Search input -->
            <div class="relative">
              <input 
                type="text" 
                placeholder="Search items or tags..." 
                value="${searchQuery}"
                class="pl-8 pr-3 py-1 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                oninput="window.app.setListSearch(this.value)"
              />
              <span class="material-symbols-outlined text-slate-500 text-sm absolute left-2 top-1.5">search</span>
            </div>
          </div>
        </div>

        <!-- Data Table -->
        <div class="wr-card bg-slate-900 border border-slate-800 p-0 overflow-hidden shadow-xl">
          <table class="wr-table">
            <thead>
              <tr>
                <th style="width: 70px;">Score</th>
                <th>Item & Deliverable</th>
                <th>Counterparty</th>
                <th>Status</th>
                <th>Expected SLA</th>
                <th>Deadline</th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.length === 0 ? `
                <tr>
                  <td colspan="7" class="py-12 text-center text-slate-500 text-xs">
                    No items match the selected filter criteria.
                  </td>
                </tr>
              ` : filtered.map(item => `
                <tr class="table-row" onclick="window.app.viewItemDetail('${item.id}')">
                  <td>
                    <span class="score-badge ${item.scoreDetails.badgeClass}">${item.blockingScore}</span>
                  </td>
                  <td>
                    <div class="font-semibold text-slate-100 flex items-center gap-1.5">
                      <span>${item.title}</span>
                      ${item.dependencies && item.dependencies.length > 0 ? `
                        <span class="text-[10px] font-mono px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded" title="${item.dependencies.length} downstream blockers">
                          ${item.dependencies.length} deps
                        </span>
                      ` : ''}
                    </div>
                    <div class="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                      <span>${item.category}</span>
                      ${item.tags && item.tags.length > 0 ? `
                        <span>&bull;</span>
                        <span class="text-indigo-400">${item.tags.map(t => `#${t}`).join(' ')}</span>
                      ` : ''}
                    </div>
                  </td>
                  <td>
                    <div class="text-slate-200 font-medium">${item.counterpartyName}</div>
                    <div class="text-[11px] text-slate-500">${item.counterpartyOrg || ''}</div>
                  </td>
                  <td>
                    <span class="status-pill status-${item.status.toLowerCase()}">${item.status}</span>
                  </td>
                  <td class="text-xs text-slate-400 font-mono">
                    ${item.expectedResponseAt ? BusinessCalendar.formatRelative(item.expectedResponseAt) : '—'}
                  </td>
                  <td class="text-xs font-mono ${item.hardDeadlineAt ? 'text-amber-400 font-medium' : 'text-slate-500'}">
                    ${item.hardDeadlineAt ? BusinessCalendar.formatRelative(item.hardDeadlineAt) : 'None'}
                  </td>
                  <td style="text-align: right;" onclick="event.stopPropagation()">
                    <div class="inline-flex items-center gap-1">
                      ${item.status !== 'RESOLVED' ? `
                        <button class="btn-primary text-[11px] py-1 px-2" onclick="window.app.openComposerForItem('${item.id}')" title="Follow Up">
                          <span class="material-symbols-outlined text-xs">outgoing_mail</span>
                          <span>Follow up</span>
                        </button>
                      ` : `
                        <span class="text-xs text-emerald-400 font-semibold px-2">Completed</span>
                      `}
                      <button class="btn-secondary text-[11px] py-1 px-2" onclick="window.app.viewItemDetail('${item.id}')" title="View details">
                        <span class="material-symbols-outlined text-xs">visibility</span>
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Table Summary Bar -->
        <div class="flex items-center justify-between text-xs text-slate-500 px-2">
          <span>Showing ${filtered.length} of ${items.length} items</span>
          <span>Sorted by ${currentSort === 'SCORE_DESC' ? 'Blocking Score' : currentSort}</span>
        </div>
      </div>
    `;
  }
}
