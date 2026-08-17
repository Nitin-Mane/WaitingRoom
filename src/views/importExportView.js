/**
 * Import and Export Wizard View
 */

export class ImportExportView {
  static render() {
    return `
      <div class="view-animate max-w-4xl mx-auto space-y-6">
        <!-- Header -->
        <div>
          <h2 class="text-base font-bold text-slate-100">Data Import & Export Wizard</h2>
          <p class="text-xs text-slate-400">Export your local database or import records with complete schema validation</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- 1. Export Wizard Card -->
          <div class="wr-card bg-slate-900 border border-slate-800 p-6 space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                <span class="material-symbols-outlined text-xl">download</span>
              </div>
              <div>
                <h3 class="text-sm font-bold text-slate-100">Export Local Data</h3>
                <p class="text-xs text-slate-400">Download your data in standard formats</p>
              </div>
            </div>

            <div class="space-y-3 pt-2">
              <button class="w-full btn-secondary justify-between text-xs py-2.5" onclick="window.app.triggerQuickExport('json')">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-base text-indigo-400">data_object</span>
                  <span>Full Database Snapshot (.JSON)</span>
                </div>
                <span class="text-[10px] font-mono text-slate-500">Full Fidelity</span>
              </button>

              <button class="w-full btn-secondary justify-between text-xs py-2.5" onclick="window.app.triggerQuickExport('csv')">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-base text-emerald-400">table_chart</span>
                  <span>Tabular Spreadsheet (.CSV)</span>
                </div>
                <span class="text-[10px] font-mono text-slate-500">Excel / Sheets</span>
              </button>

              <button class="w-full btn-secondary justify-between text-xs py-2.5" onclick="window.app.triggerQuickExport('md')">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-base text-amber-400">description</span>
                  <span>Audit Summary Report (.MD)</span>
                </div>
                <span class="text-[10px] font-mono text-slate-500">Markdown</span>
              </button>
            </div>
          </div>

          <!-- 2. Import Wizard Card -->
          <div class="wr-card bg-slate-900 border border-slate-800 p-6 space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-purple-950 border border-purple-500/40 flex items-center justify-center text-purple-400">
                <span class="material-symbols-outlined text-xl">upload</span>
              </div>
              <div>
                <h3 class="text-sm font-bold text-slate-100">Import / Restore Data</h3>
                <p class="text-xs text-slate-400">Restore a backup or ingest CSV items</p>
              </div>
            </div>

            <div class="space-y-3 pt-2">
              <input type="file" id="import-file-input" accept=".json,.csv" class="hidden" onchange="window.app.handleFileImport(event)" />
              
              <div 
                class="border-2 border-dashed border-slate-700 hover:border-indigo-500/60 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-950/40"
                onclick="document.getElementById('import-file-input').click()"
              >
                <span class="material-symbols-outlined text-3xl text-slate-500 mb-1">cloud_upload</span>
                <div class="text-xs font-semibold text-slate-200">Click to upload JSON or CSV file</div>
                <div class="text-[10px] text-slate-500 mt-1">Automatic schema validation before commit</div>
              </div>

              <div id="import-preview-area" class="hidden text-xs p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2"></div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
