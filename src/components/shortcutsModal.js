/**
 * Keyboard Shortcuts Reference Modal
 */

export class ShortcutsModal {
  static render() {
    const shortcuts = [
      { key: 'N', desc: 'Create New Waiting Item' },
      { key: 'Ctrl + K / ⌘ + K', desc: 'Open Command Palette' },
      { key: '?', desc: 'Show Keyboard Shortcuts' },
      { key: 'Esc', desc: 'Close any active modal or overlay' },
      { key: '1 - 6', desc: 'Quick jump between main views' },
      { key: 'F', desc: 'Enter Kinetic Focus Mode' },
      { key: 'Space', desc: 'Step to next item in Focus Mode' }
    ];

    return `
      <div id="shortcuts-modal" class="modal-overlay" onclick="if(event.target === this) window.app.closeShortcuts()">
        <div class="modal-dialog max-w-lg bg-slate-900 border border-slate-700 p-6">
          <div class="flex items-center justify-between pb-4 border-b border-slate-800">
            <div class="flex items-center gap-2.5">
              <span class="material-symbols-outlined text-indigo-400 text-2xl">keyboard</span>
              <div>
                <h2 class="text-base font-bold text-slate-100">Keyboard Shortcuts</h2>
                <p class="text-xs text-slate-400">Navigate WaitingRoom at maximum efficiency</p>
              </div>
            </div>
            <button class="text-slate-400 hover:text-slate-200 material-symbols-outlined text-lg" onclick="window.app.closeShortcuts()">close</button>
          </div>

          <div class="py-4 space-y-2.5 text-xs">
            ${shortcuts.map(s => `
              <div class="flex items-center justify-between py-1.5 px-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                <span class="text-slate-300 font-medium">${s.desc}</span>
                <kbd class="px-2 py-1 font-mono text-[11px] bg-slate-800 text-indigo-300 rounded border border-slate-700 shadow-sm">${s.key}</kbd>
              </div>
            `).join('')}
          </div>

          <div class="pt-3 border-t border-slate-800 text-right">
            <button class="btn-secondary text-xs" onclick="window.app.closeShortcuts()">Got it</button>
          </div>
        </div>
      </div>
    `;
  }
}
