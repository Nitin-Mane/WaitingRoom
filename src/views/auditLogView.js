/**
 * Global Activity & Immutable Audit Trail View
 */

export class AuditLogView {
  static render(data = {}) {
    const { events = [] } = data;

    return `
      <div class="view-animate max-w-5xl mx-auto space-y-4">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-base font-bold text-slate-100">Global Activity & Audit Trail</h2>
            <p class="text-xs text-slate-400">Immutable chronological record of all state transitions, follow-ups, and notes</p>
          </div>
          <span class="text-xs text-slate-400 font-mono">${events.length} total recorded events</span>
        </div>

        <!-- Event List -->
        <div class="wr-card bg-slate-900 border border-slate-800 p-0 overflow-hidden shadow-xl">
          <table class="wr-table">
            <thead>
              <tr>
                <th style="width: 140px;">Timestamp</th>
                <th style="width: 140px;">Event Type</th>
                <th>Summary & Detail</th>
                <th style="width: 100px;">Actor</th>
              </tr>
            </thead>
            <tbody>
              ${events.length === 0 ? `
                <tr><td colspan="4" class="py-12 text-center text-slate-500 text-xs">No audit events recorded yet.</td></tr>
              ` : events.map(evt => `
                <tr class="table-row">
                  <td class="text-xs font-mono text-slate-400">
                    ${new Date(evt.createdAt).toLocaleString()}
                  </td>
                  <td>
                    <span class="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-slate-800 text-indigo-300 border border-indigo-900/40">
                      ${evt.type}
                    </span>
                  </td>
                  <td>
                    <div class="font-semibold text-slate-200">${evt.title}</div>
                    ${evt.note ? `<div class="text-[11px] text-slate-400 mt-0.5">${evt.note}</div>` : ''}
                  </td>
                  <td class="text-xs font-medium text-slate-400">
                    ${evt.actor || 'User'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }
}
