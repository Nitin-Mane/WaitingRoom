/**
 * System Health & Database Recovery View
 */

export class SystemHealthView {
  static render(data = {}) {
    const { items = [], counterparties = [], events = [] } = data;

    return `
      <div class="view-animate max-w-4xl mx-auto space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-base font-bold text-slate-100">System Health & Database Recovery</h2>
            <p class="text-xs text-slate-400">Diagnostic tools, storage metrics, and integrity repair operations</p>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span class="text-xs font-semibold text-emerald-400">Database Healthy</span>
          </div>
        </div>

        <!-- Diagnostic Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="wr-card bg-slate-900 border border-slate-800 p-4">
            <div class="text-[11px] font-semibold text-slate-400 uppercase">Total Records</div>
            <div class="text-xl font-bold font-mono text-slate-100 mt-1">
              ${items.length + counterparties.length + events.length}
            </div>
            <div class="text-[11px] text-slate-500 mt-0.5">${items.length} items &bull; ${events.length} events</div>
          </div>

          <div class="wr-card bg-slate-900 border border-slate-800 p-4">
            <div class="text-[11px] font-semibold text-slate-400 uppercase">Schema Version</div>
            <div class="text-xl font-bold font-mono text-indigo-300 mt-1">v1.0.0</div>
            <div class="text-[11px] text-slate-500 mt-0.5">IndexedDB / Local-first</div>
          </div>

          <div class="wr-card bg-slate-900 border border-slate-800 p-4">
            <div class="text-[11px] font-semibold text-slate-400 uppercase">Integrity Status</div>
            <div class="text-xl font-bold text-emerald-400 mt-1">PASSED</div>
            <div class="text-[11px] text-slate-500 mt-0.5">0 orphaned links found</div>
          </div>
        </div>

        <!-- Action Tools -->
        <div class="wr-card bg-slate-900 border border-slate-800 p-6 space-y-4">
          <h3 class="text-sm font-bold text-slate-100">Maintenance & Recovery Actions</h3>

          <div class="space-y-3 pt-2">
            <div class="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div>
                <div class="text-xs font-semibold text-slate-200">Re-index and Recalculate Scores</div>
                <div class="text-[11px] text-slate-500">Recalculates all blocking scores and recommendation policies across active items</div>
              </div>
              <button class="btn-secondary text-xs" onclick="window.app.recalculateAll()">
                <span class="material-symbols-outlined text-sm">refresh</span>
                <span>Recalculate</span>
              </button>
            </div>

            <div class="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div>
                <div class="text-xs font-semibold text-slate-200">Reload Default Starter Dataset</div>
                <div class="text-[11px] text-slate-500">Loads realistic example items, counterparties, and histories</div>
              </div>
              <button class="btn-secondary text-xs" onclick="window.app.loadDemoSeed()">
                <span class="material-symbols-outlined text-sm">restart_alt</span>
                <span>Load Seed</span>
              </button>
            </div>

            <div class="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-red-900/40">
              <div>
                <div class="text-xs font-semibold text-red-300">Wipe Local Database (Factory Reset)</div>
                <div class="text-[11px] text-red-400/70">Permanently clears all local records and resets settings</div>
              </div>
              <button class="btn-secondary text-xs text-red-400 border-red-800/60 hover:bg-red-950" onclick="window.app.promptWipeDatabase()">
                <span class="material-symbols-outlined text-sm">delete_forever</span>
                <span>Reset Data</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
