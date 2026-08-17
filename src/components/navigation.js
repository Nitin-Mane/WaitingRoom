/**
 * Navigation Component (Sidebar and Topbar)
 */

export class Navigation {
  constructor(app) {
    this.app = app;
  }

  renderSidebar(activeRoute = 'dashboard', metrics = {}, settings = {}) {
    const urgentBadge = metrics.urgentCount > 0 
      ? `<span class="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-red-950 text-red-400 border border-red-800/50">${metrics.urgentCount}</span>` 
      : '';
    const activeBadge = metrics.totalActive > 0 
      ? `<span class="px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-slate-800 text-slate-400">${metrics.totalActive}</span>` 
      : '';
    const notifCount = this.app.notifications ? this.app.notifications.notifications.length : 0;

    return `
      <!-- Brand Header -->
      <div class="p-4 border-b border-slate-800 flex items-center justify-between">
        <div class="flex items-center gap-3 cursor-pointer" onclick="window.app.navigate('dashboard')">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#494bd6] to-[#c0c1ff] flex items-center justify-center shadow-lg shadow-indigo-950">
            <span class="material-symbols-outlined text-white text-lg">hourglass_empty</span>
          </div>
          <div>
            <div class="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
              WaitingRoom
              <span class="text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800/40">v1.0</span>
            </div>
            <div class="text-[11px] text-slate-400">Dependency Tracker</div>
          </div>
        </div>
      </div>

      <!-- Quick Action: New Item -->
      <div class="p-3">
        <button class="w-full btn-primary justify-center py-2 text-xs" onclick="window.app.openQuickAdd()">
          <span class="material-symbols-outlined text-sm">add_circle</span>
          <span>New Waiting Item</span>
          <span class="text-[10px] opacity-70 font-mono ml-auto">N</span>
        </button>
      </div>

      <!-- Navigation Links -->
      <div class="flex-1 overflow-y-auto px-3 py-1 space-y-0.5">
        <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-2">Workspace</div>
        
        <a class="sidebar-nav-item ${activeRoute === 'dashboard' ? 'active' : ''}" onclick="window.app.navigate('dashboard')">
          <span class="material-symbols-outlined text-lg">dashboard</span>
          <span class="flex-1">Overview</span>
          ${urgentBadge}
        </a>

        <a class="sidebar-nav-item ${activeRoute === 'waiting-list' ? 'active' : ''}" onclick="window.app.navigate('waiting-list')">
          <span class="material-symbols-outlined text-lg">hourglass_top</span>
          <span class="flex-1">Waiting Items</span>
          ${activeBadge}
        </a>

        <a class="sidebar-nav-item ${activeRoute === 'kinetic-focus' ? 'active' : ''}" onclick="window.app.navigate('kinetic-focus')">
          <span class="material-symbols-outlined text-lg">bolt</span>
          <span class="flex-1">Kinetic Focus</span>
          <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/50">Flow</span>
        </a>

        <a class="sidebar-nav-item ${activeRoute === 'notifications-center' ? 'active' : ''}" onclick="window.app.navigate('notifications-center')">
          <span class="material-symbols-outlined text-lg">notifications</span>
          <span class="flex-1">Notifications</span>
          ${notifCount > 0 ? `<span class="px-1.5 py-0.5 text-[10px] font-mono rounded bg-indigo-950 text-indigo-300 border border-indigo-800/40">${notifCount}</span>` : ''}
        </a>

        <a class="sidebar-nav-item ${activeRoute === 'followup-composer' ? 'active' : ''}" onclick="window.app.navigate('followup-composer')">
          <span class="material-symbols-outlined text-lg">outgoing_mail</span>
          <span class="flex-1">Composer</span>
        </a>

        <a class="sidebar-nav-item ${activeRoute === 'schedule' ? 'active' : ''}" onclick="window.app.navigate('schedule')">
          <span class="material-symbols-outlined text-lg">calendar_month</span>
          <span class="flex-1">Deadlines & SLA</span>
        </a>

        <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 pt-4 pb-2">Directory & Reports</div>

        <a class="sidebar-nav-item ${activeRoute === 'contacts' ? 'active' : ''}" onclick="window.app.navigate('contacts')">
          <span class="material-symbols-outlined text-lg">contacts</span>
          <span class="flex-1">Contacts & Orgs</span>
        </a>

        <a class="sidebar-nav-item ${activeRoute === 'reports' ? 'active' : ''}" onclick="window.app.navigate('reports')">
          <span class="material-symbols-outlined text-lg">insights</span>
          <span class="flex-1">Analytics</span>
        </a>

        <a class="sidebar-nav-item ${activeRoute === 'audit-log' ? 'active' : ''}" onclick="window.app.navigate('audit-log')">
          <span class="material-symbols-outlined text-lg">history</span>
          <span class="flex-1">Audit Trail</span>
        </a>

        <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 pt-4 pb-2">System</div>

        <a class="sidebar-nav-item ${activeRoute === 'import-export' ? 'active' : ''}" onclick="window.app.navigate('import-export')">
          <span class="material-symbols-outlined text-lg">swap_horiz</span>
          <span class="flex-1">Import & Export</span>
        </a>

        <a class="sidebar-nav-item ${activeRoute === 'system-health' ? 'active' : ''}" onclick="window.app.navigate('system-health')">
          <span class="material-symbols-outlined text-lg">health_and_safety</span>
          <span class="flex-1">System Health</span>
        </a>

        <a class="sidebar-nav-item ${activeRoute === 'settings' ? 'active' : ''}" onclick="window.app.openProfileSettings()">
          <span class="material-symbols-outlined text-lg">settings</span>
          <span class="flex-1">Settings & Profile</span>
        </a>
      </div>

      <!-- Footer Help & Status -->
      <div class="p-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <button class="btn-ghost text-xs p-1" onclick="window.app.openShortcuts()" title="Keyboard Shortcuts (?)">
          <span class="material-symbols-outlined text-base">keyboard</span>
          <span>Shortcuts</span>
        </button>
        <button class="btn-ghost text-xs p-1" onclick="window.app.navigate('help-docs')" title="Documentation">
          <span class="material-symbols-outlined text-base">help</span>
        </button>
      </div>
    `;
  }

  renderTopbar(activeRoute, metrics = {}, unreadNotifCount = 0, settings = {}) {
    const routeTitles = {
      'dashboard': 'Overview Dashboard',
      'waiting-list': 'Waiting Items Directory',
      'waiting-detail': 'Dependency Details',
      'kinetic-focus': 'Kinetic Focus Mode',
      'notifications-center': 'Notification Center & Feed',
      'followup-composer': 'Follow-Up Message Composer',
      'contacts': 'Contacts & Organizations',
      'contact-detail': 'Contact Profile & History',
      'schedule': 'Schedule, Deadlines & SLA',
      'reports': 'Reports & Analytics',
      'audit-log': 'Global Activity & Audit Trail',
      'import-export': 'Data Migration & Export Wizard',
      'settings': 'Application & Profile Settings',
      'system-health': 'System Health & Integrity',
      'help-docs': 'Help & Documentation'
    };

    const title = routeTitles[activeRoute] || 'WaitingRoom';
    const avatar = settings.userAvatar || 'LR';
    const name = settings.userName || 'Dr. Lisa Reynolds';

    return `
      <!-- Left: Title & Quick Search -->
      <div class="flex items-center gap-4">
        <h1 class="text-base font-bold text-slate-100">${title}</h1>
        
        <button class="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400 bg-slate-900 border border-slate-700/60 rounded-lg hover:border-indigo-500/50 transition-colors cursor-pointer" onclick="window.app.openCommandPalette()">
          <span class="material-symbols-outlined text-sm">search</span>
          <span>Search or jump to...</span>
          <kbd class="px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 rounded text-slate-400 border border-slate-700">Ctrl+K</kbd>
        </button>
      </div>

      <!-- Right: Action Bar -->
      <div class="flex items-center gap-3">
        <!-- Quick Focus Button -->
        <button class="btn-secondary text-xs py-1.5" onclick="window.app.navigate('kinetic-focus')" title="Focus Mode">
          <span class="material-symbols-outlined text-amber-400 text-sm">bolt</span>
          <span class="hidden sm:inline">Focus Flow</span>
        </button>

        <!-- Quick Theme Toggle -->
        <button class="p-2 text-slate-400 hover:text-indigo-300 rounded-lg hover:bg-slate-800 transition-colors" onclick="window.app.toggleTheme()" title="Switch Theme (Dark, Midnight, Cyberpunk, Light)">
          <span class="material-symbols-outlined text-xl">palette</span>
        </button>

        <!-- Notification Bell -->
        <button class="relative p-2 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors" onclick="window.app.navigate('notifications-center')" title="Notification Center">
          <span class="material-symbols-outlined text-xl">notifications</span>
          ${unreadNotifCount > 0 ? `
            <span class="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-slate-900 animate-pulse"></span>
          ` : ''}
        </button>

        <!-- Profile / Status Indicator -->
        <div class="flex items-center gap-2 pl-2 border-l border-slate-800 cursor-pointer hover:opacity-90 transition-opacity" onclick="window.app.openProfileSettings()" title="Account & Profile Settings (${name})">
          <div class="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 border border-indigo-400/50 flex items-center justify-center text-xs font-bold text-white shadow-sm">
            ${avatar}
          </div>
          <span class="w-2 h-2 rounded-full bg-emerald-500" title="Local Database Healthy"></span>
        </div>
      </div>
    `;
  }
}
