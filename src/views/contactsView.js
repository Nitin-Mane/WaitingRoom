/**
 * Contacts & Organizations Directory and Contact Profile View
 */

export class ContactsView {
  static render(data = {}) {
    const { counterparties = [], selectedContactId = null, items = [] } = data;

    if (selectedContactId) {
      const contact = counterparties.find(c => c.id === selectedContactId);
      if (contact) return this.renderContactDetail(contact, items);
    }

    return this.renderDirectory(counterparties);
  }

  static renderDirectory(counterparties = []) {
    return `
      <div class="view-animate space-y-4">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-base font-bold text-slate-100">Contacts & External Organizations</h2>
            <p class="text-xs text-slate-400">People and entities you frequently wait on</p>
          </div>
          <button class="btn-primary text-xs" onclick="window.app.promptAddContact()">
            <span class="material-symbols-outlined text-sm">person_add</span>
            <span>Add Contact</span>
          </button>
        </div>

        <!-- Directory Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${counterparties.map(cp => `
            <div class="wr-card bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 space-y-3 cursor-pointer transition-all" onclick="window.app.viewContactDetail('${cp.id}')">
              <div class="flex items-start justify-between">
                <div class="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sm text-indigo-300">
                  ${(cp.name || 'C').substring(0, 2).toUpperCase()}
                </div>
                <span class="px-2 py-0.5 text-[10px] font-mono rounded bg-slate-800 text-slate-400 font-semibold">
                  ${cp.activeCount || 0} active
                </span>
              </div>

              <div>
                <h3 class="text-sm font-bold text-slate-100">${cp.name}</h3>
                <div class="text-xs text-slate-400 font-medium">${cp.title || cp.organization || 'External Contact'}</div>
                <div class="text-[11px] text-slate-500 mt-0.5">${cp.email || 'No email saved'}</div>
              </div>

              <div class="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>Avg SLA: <strong>${cp.averageResponseDays || 3.0}d</strong></span>
                <span>${cp.totalInteractions || 0} interactions</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  static renderContactDetail(contact, allItems) {
    const contactItems = allItems.filter(i => i.counterpartyId === contact.id || i.counterpartyName === contact.name);

    return `
      <div class="view-animate max-w-5xl mx-auto space-y-6">
        <!-- Back Navigation -->
        <button class="btn-ghost text-xs gap-1.5" onclick="window.app.navigate('contacts')">
          <span class="material-symbols-outlined text-sm">arrow_back</span>
          <span>Back to Contacts</span>
        </button>

        <!-- Profile Card -->
        <div class="wr-card bg-slate-900 border border-slate-800 p-6 space-y-4">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 rounded-2xl bg-indigo-950 border border-indigo-500/40 flex items-center justify-center font-black text-xl text-indigo-300 shadow-xl">
                ${(contact.name || 'C').substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h1 class="text-xl font-bold text-slate-100">${contact.name}</h1>
                <div class="text-xs text-slate-300">${contact.title} &bull; <strong class="text-slate-100">${contact.organization}</strong></div>
                <div class="text-xs text-slate-400 font-mono mt-1">${contact.email || ''} ${contact.phone ? `&bull; ${contact.phone}` : ''}</div>
              </div>
            </div>

            <div class="p-3 bg-slate-950 border border-slate-800 rounded-xl text-right">
              <div class="text-[10px] uppercase font-bold text-slate-500">Historical SLA</div>
              <div class="text-xl font-bold font-mono text-indigo-300 mt-0.5">${contact.averageResponseDays || 3.0} days</div>
              <div class="text-[10px] text-slate-500">Median response time</div>
            </div>
          </div>

          ${contact.notes ? `
            <div class="p-3 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-300">
              <span class="text-slate-500 font-semibold mr-1">Notes:</span> ${contact.notes}
            </div>
          ` : ''}
        </div>

        <!-- Associated Waiting Items -->
        <div class="space-y-3">
          <h3 class="text-sm font-bold text-slate-100">Associated Dependencies (${contactItems.length})</h3>

          <div class="wr-card bg-slate-900 border border-slate-800 p-0 overflow-hidden">
            <table class="wr-table">
              <thead>
                <tr>
                  <th>Score</th>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Expected SLA</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${contactItems.length === 0 ? `
                  <tr><td colspan="5" class="py-8 text-center text-slate-500 text-xs">No dependencies associated with this contact yet.</td></tr>
                ` : contactItems.map(item => `
                  <tr class="table-row" onclick="window.app.viewItemDetail('${item.id}')">
                    <td><span class="score-badge ${item.scoreDetails ? item.scoreDetails.badgeClass : ''}">${item.blockingScore || 0}</span></td>
                    <td class="font-semibold text-slate-100">${item.title}</td>
                    <td><span class="status-pill status-${item.status.toLowerCase()}">${item.status}</span></td>
                    <td class="text-xs text-slate-400 font-mono">${item.expectedResponseAt ? new Date(item.expectedResponseAt).toLocaleDateString() : '—'}</td>
                    <td>
                      <button class="btn-ghost text-xs text-indigo-400" onclick="event.stopPropagation(); window.app.viewItemDetail('${item.id}')">
                        Inspect &rarr;
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }
}
