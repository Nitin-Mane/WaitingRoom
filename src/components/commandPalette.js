/**
 * Command Palette Component (Ctrl+K / Cmd+K)
 */

export class CommandPalette {
  constructor(app) {
    this.app = app;
    this.isOpen = false;
  }

  getCommands() {
    return [
      { id: 'new_item', title: 'Create New Waiting Item', category: 'Actions', icon: 'add_circle', action: () => this.app.openQuickAdd() },
      { id: 'focus_mode', title: 'Launch Kinetic Focus Mode', category: 'Actions', icon: 'bolt', action: () => this.app.navigate('kinetic-focus') },
      { id: 'composer', title: 'Open Follow-Up Composer', category: 'Actions', icon: 'outgoing_mail', action: () => this.app.navigate('followup-composer') },
      { id: 'export_json', title: 'Export Full Database (JSON)', category: 'Data', icon: 'download', action: () => this.app.triggerQuickExport('json') },
      { id: 'export_md', title: 'Export Markdown Audit Report', category: 'Data', icon: 'description', action: () => this.app.triggerQuickExport('md') },
      { id: 'goto_dashboard', title: 'Go to Overview Dashboard', category: 'Navigation', icon: 'dashboard', action: () => this.app.navigate('dashboard') },
      { id: 'goto_list', title: 'Go to Waiting Items List', category: 'Navigation', icon: 'hourglass_top', action: () => this.app.navigate('waiting-list') },
      { id: 'goto_contacts', title: 'Go to Contacts & Organizations', category: 'Navigation', icon: 'contacts', action: () => this.app.navigate('contacts') },
      { id: 'goto_schedule', title: 'Go to Deadlines & SLA Agenda', category: 'Navigation', icon: 'calendar_month', action: () => this.app.navigate('schedule') },
      { id: 'goto_reports', title: 'Go to Analytics & Reports', category: 'Navigation', icon: 'insights', action: () => this.app.navigate('reports') },
      { id: 'goto_audit', title: 'Go to Activity & Audit Log', category: 'Navigation', icon: 'history', action: () => this.app.navigate('audit-log') },
      { id: 'goto_health', title: 'Go to System Health & Recovery', category: 'Navigation', icon: 'health_and_safety', action: () => this.app.navigate('system-health') },
      { id: 'goto_settings', title: 'Go to Settings', category: 'Navigation', icon: 'settings', action: () => this.app.navigate('settings') },
      { id: 'shortcuts', title: 'View Keyboard Shortcuts', category: 'Help', icon: 'keyboard', action: () => this.app.openShortcuts() }
    ];
  }

  renderModal() {
    return `
      <div id="command-palette-modal" class="modal-overlay" onclick="if(event.target === this) window.app.closeCommandPalette()">
        <div class="modal-dialog max-w-xl bg-slate-900 border border-slate-700/80 p-0 overflow-hidden shadow-2xl">
          <!-- Search Input -->
          <div class="p-4 border-b border-slate-800 flex items-center gap-3">
            <span class="material-symbols-outlined text-slate-400 text-xl">search</span>
            <input 
              id="cmd-input" 
              type="text" 
              placeholder="Type a command, search items, or jump to view..." 
              class="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm focus:outline-none"
              oninput="window.app.filterCommandPalette(this.value)"
              onkeydown="if(event.key === 'Escape') window.app.closeCommandPalette()"
            />
            <kbd class="px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-400 rounded border border-slate-700">ESC</kbd>
          </div>

          <!-- Command List -->
          <div id="cmd-list" class="max-h-80 overflow-y-auto p-2 space-y-1">
            ${this.renderCommandList(this.getCommands())}
          </div>

          <!-- Footer Hints -->
          <div class="px-4 py-2 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <span>Navigation: <kbd class="px-1 bg-slate-800 rounded text-slate-400">↑</kbd> <kbd class="px-1 bg-slate-800 rounded text-slate-400">↓</kbd></span>
            <span>Execute: <kbd class="px-1 bg-slate-800 rounded text-slate-400">Enter</kbd></span>
            <span>Close: <kbd class="px-1 bg-slate-800 rounded text-slate-400">Esc</kbd></span>
          </div>
        </div>
      </div>
    `;
  }

  renderCommandList(commands) {
    if (commands.length === 0) {
      return `
        <div class="p-6 text-center text-slate-500 text-xs">
          No matching commands or waiting items found.
        </div>
      `;
    }

    return commands.map((cmd, idx) => `
      <div 
        class="cmd-item flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-indigo-950/60 hover:text-indigo-200 cursor-pointer transition-colors ${idx === 0 ? 'bg-slate-800/80 text-white' : ''}" 
        onclick="window.app.executeCommand('${cmd.id}')"
      >
        <span class="material-symbols-outlined text-slate-400 text-base">${cmd.icon}</span>
        <span class="font-medium flex-1">${cmd.title}</span>
        <span class="text-[10px] font-mono text-slate-500 px-1.5 py-0.5 rounded bg-slate-800/60">${cmd.category}</span>
      </div>
    `).join('');
  }
}
