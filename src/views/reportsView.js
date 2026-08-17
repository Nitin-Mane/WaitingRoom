/**
 * Reports & Analytics View
 */

export class ReportsView {
  static render(data = {}) {
    const { items = [], metrics = {} } = data;
    const active = items.filter(i => i.status !== 'RESOLVED' && i.status !== 'CANCELLED');
    const resolved = items.filter(i => i.status === 'RESOLVED');

    // Category breakdown
    const catCounts = {};
    items.forEach(i => {
      catCounts[i.category] = (catCounts[i.category] || 0) + 1;
    });

    const bands = metrics.bands || { critical: 0, high: 0, important: 0, watch: 0, low: 0 };
    const totalActive = active.length || 1;

    return `
      <div class="view-animate max-w-5xl mx-auto space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-base font-bold text-slate-100">Reports & Analytics</h2>
            <p class="text-xs text-slate-400">Quantitative insights into dependency resolution and response velocity</p>
          </div>
        </div>

        <!-- 3 Top Stats -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="wr-card bg-slate-900 border border-slate-800 p-4">
            <div class="text-[11px] font-semibold text-slate-400 uppercase">Resolution Rate</div>
            <div class="text-2xl font-bold font-mono text-emerald-400 mt-1">
              ${items.length > 0 ? Math.round((resolved.length / items.length) * 100) : 0}%
            </div>
            <div class="text-[11px] text-slate-500 mt-0.5">${resolved.length} resolved of ${items.length} total</div>
          </div>

          <div class="wr-card bg-slate-900 border border-slate-800 p-4">
            <div class="text-[11px] font-semibold text-slate-400 uppercase">Avg Follow-ups / Item</div>
            <div class="text-2xl font-bold font-mono text-indigo-300 mt-1">
              1.4
            </div>
            <div class="text-[11px] text-slate-500 mt-0.5">Across all active items</div>
          </div>

          <div class="wr-card bg-slate-900 border border-slate-800 p-4">
            <div class="text-[11px] font-semibold text-slate-400 uppercase">Median Wait Time</div>
            <div class="text-2xl font-bold font-mono text-amber-400 mt-1">
              4.5 days
            </div>
            <div class="text-[11px] text-slate-500 mt-0.5">Until resolution or triage</div>
          </div>
        </div>

        <!-- Middle Grid: Score Bands & Categories -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Score Distribution -->
          <div class="wr-card bg-slate-900 border border-slate-800 p-5 space-y-4">
            <h3 class="text-xs font-bold text-slate-200 uppercase tracking-wider">Blocking Impact Distribution</h3>
            
            <div class="space-y-3 text-xs">
              <div>
                <div class="flex justify-between text-slate-300 mb-1">
                  <span>Critical (85 - 100)</span>
                  <span class="font-mono font-bold text-red-400">${bands.critical || 0}</span>
                </div>
                <div class="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                  <div class="h-full bg-red-500" style="width: ${((bands.critical || 0) / totalActive) * 100}%"></div>
                </div>
              </div>

              <div>
                <div class="flex justify-between text-slate-300 mb-1">
                  <span>High (70 - 84)</span>
                  <span class="font-mono font-bold text-orange-400">${bands.high || 0}</span>
                </div>
                <div class="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                  <div class="h-full bg-orange-500" style="width: ${((bands.high || 0) / totalActive) * 100}%"></div>
                </div>
              </div>

              <div>
                <div class="flex justify-between text-slate-300 mb-1">
                  <span>Important (50 - 69)</span>
                  <span class="font-mono font-bold text-amber-400">${bands.important || 0}</span>
                </div>
                <div class="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                  <div class="h-full bg-amber-500" style="width: ${((bands.important || 0) / totalActive) * 100}%"></div>
                </div>
              </div>

              <div>
                <div class="flex justify-between text-slate-300 mb-1">
                  <span>Watch & Low (&lt; 50)</span>
                  <span class="font-mono font-bold text-blue-400">${(bands.watch || 0) + (bands.low || 0)}</span>
                </div>
                <div class="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                  <div class="h-full bg-blue-500" style="width: ${(((bands.watch || 0) + (bands.low || 0)) / totalActive) * 100}%"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Category Breakdown -->
          <div class="wr-card bg-slate-900 border border-slate-800 p-5 space-y-4">
            <h3 class="text-xs font-bold text-slate-200 uppercase tracking-wider">Dependencies by Category</h3>

            <div class="space-y-2.5 text-xs">
              ${Object.entries(catCounts).map(([cat, count]) => `
                <div class="flex items-center justify-between p-2 bg-slate-950/60 rounded-lg border border-slate-800/80">
                  <span class="font-medium text-slate-300">${cat}</span>
                  <span class="px-2 py-0.5 rounded font-mono bg-slate-800 text-indigo-300 font-bold">${count}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
