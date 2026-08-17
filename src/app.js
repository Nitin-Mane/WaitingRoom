/**
 * WaitingRoom Main Application Controller & Router
 */

import { Repository } from './storage/repository.js';
import { NotificationService } from './services/notificationService.js';
import { Scheduler } from './services/scheduler.js';
import { ImportExportService } from './services/importExport.js';
import { BackupRestoreEngine } from './storage/backupRestore.js';
import { Navigation } from './components/navigation.js';
import { CommandPalette } from './components/commandPalette.js';
import { QuickAddModal } from './components/quickAddModal.js';
import { ShortcutsModal } from './components/shortcutsModal.js';
import { DashboardView } from './views/dashboardView.js';
import { WaitingListView } from './views/waitingListView.js';
import { WaitingDetailView } from './views/waitingDetailView.js';
import { KineticFocusView } from './views/kineticFocusView.js';
import { FollowUpComposerView } from './views/followUpComposerView.js';
import { ContactsView } from './views/contactsView.js';
import { ScheduleView } from './views/scheduleView.js';
import { ReportsView } from './views/reportsView.js';
import { AuditLogView } from './views/auditLogView.js';
import { ImportExportView } from './views/importExportView.js';
import { SettingsView } from './views/settingsView.js';
import { SystemHealthView } from './views/systemHealthView.js';
import { HelpDocumentationView } from './views/helpDocumentationView.js';
import { NotificationCenterView } from './views/notificationCenterView.js';
import { AuthView } from './views/authView.js';
import { AuthService } from './services/authService.js';
import { WaitingStatus } from './core/types.js';

export class App {
  constructor() {
    this.repo = new Repository();
    this.auth = new AuthService(this.repo);
    this.notifications = new NotificationService();
    this.scheduler = new Scheduler(this.repo, this.notifications);
    this.nav = new Navigation(this);
    this.commandPalette = new CommandPalette(this);

    this.currentRoute = 'dashboard';
    this.selectedItemId = null;
    this.selectedContactId = null;
    this.focusIndex = 0;

    // Auth State
    this.authMode = 'LOGIN';
    this.authError = null;

    // List State
    this.listFilter = 'ALL';
    this.listCategory = 'ALL';
    this.listSort = 'SCORE_DESC';
    this.listSearch = '';

    // Composer State
    this.composerItemId = null;
    this.composerTemplate = 'GENTLE';
    this.composerTone = 'POLITE';

    // Settings State
    this.settingsTab = 'profile';
  }

  async start() {
    await this.repo.init();
    await this.auth.init();
    this.notifications.init();
    this.scheduler.start();

    // Subscribe to database changes
    this.repo.subscribe(() => this.renderCurrentView());
    this.auth.subscribe(() => this.render());

    // Register global shortcuts
    this.initKeyboardShortcuts();

    // Initial render
    this.render();
  }

  initKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Ignore when inside input/textarea unless Escape or Enter
      const isInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT';

      if (e.key === 'Escape') {
        this.closeAllModals();
        return;
      }

      if (!this.auth.isAuthenticated()) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        this.openCommandPalette();
        return;
      }

      if (isInput) return;

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        this.openQuickAdd();
      } else if (e.key === '?') {
        e.preventDefault();
        this.openShortcuts();
      } else if (e.key === 'f' || e.key === 'F') {
        this.navigate('kinetic-focus');
      } else if (e.key === ' ' && this.currentRoute === 'kinetic-focus') {
        e.preventDefault();
        this.navigateFocus(this.focusIndex + 1);
      }
    });
  }

  async render() {
    const sidebarEl = document.getElementById('sidebar');
    const topbarEl = document.getElementById('topbar');
    const viewContainer = document.getElementById('view-container');

    // If not authenticated, render Login / Signup / Profile page
    if (!this.auth.isAuthenticated()) {
      if (sidebarEl) sidebarEl.style.display = 'none';
      if (topbarEl) topbarEl.style.display = 'none';
      if (viewContainer) {
        viewContainer.style.padding = '0';
        viewContainer.innerHTML = AuthView.render({
          mode: this.authMode,
          firebaseConfig: this.auth.getFirebaseConfig(),
          error: this.authError
        });
      }
      return;
    }

    // Authenticated View
    if (sidebarEl) sidebarEl.style.display = 'flex';
    if (topbarEl) topbarEl.style.display = 'flex';
    if (viewContainer) viewContainer.style.padding = '24px';

    const metrics = await this.repo.getDashboardMetrics();
    const settings = await this.repo.getAllSettings();

    if (sidebarEl) sidebarEl.innerHTML = this.nav.renderSidebar(this.currentRoute, metrics, settings);
    if (topbarEl) topbarEl.innerHTML = this.nav.renderTopbar(this.currentRoute, metrics, this.notifications.unreadCount, settings);

    await this.renderCurrentView();
  }

  async renderCurrentView() {
    const viewContainer = document.getElementById('view-container');
    if (!viewContainer) return;

    const items = await this.repo.getAllItems();
    const metrics = await this.repo.getDashboardMetrics();
    const counterparties = await this.repo.getAllCounterparties();
    const events = await this.repo.getAllTimelineEvents();
    const settings = await this.repo.getAllSettings();

    // Apply theme attribute and dark/light classes to root
    const activeTheme = settings.theme || 'dark';
    document.documentElement.setAttribute('data-theme', activeTheme);
    if (activeTheme === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }

    let html = '';

    switch (this.currentRoute) {
      case 'dashboard':
        html = DashboardView.render({ items, metrics });
        break;
      case 'waiting-list':
        html = WaitingListView.render({
          items,
          currentFilter: this.listFilter,
          currentCategory: this.listCategory,
          currentSort: this.listSort,
          searchQuery: this.listSearch
        });
        break;
      case 'waiting-detail':
        const selectedItem = await this.repo.getItemById(this.selectedItemId);
        html = WaitingDetailView.render(selectedItem);
        break;
      case 'kinetic-focus':
        html = KineticFocusView.render({ items, currentIndex: this.focusIndex });
        break;
      case 'notifications-center':
        html = NotificationCenterView.render({ notifications: this.notifications.notifications, items });
        break;
      case 'followup-composer':
        html = FollowUpComposerView.render({
          items,
          selectedItemId: this.composerItemId,
          selectedTemplate: this.composerTemplate,
          selectedTone: this.composerTone
        });
        break;
      case 'contacts':
        html = ContactsView.render({ counterparties, selectedContactId: this.selectedContactId, items });
        break;
      case 'schedule':
        html = ScheduleView.render({ items });
        break;
      case 'reports':
        html = ReportsView.render({ items, metrics });
        break;
      case 'audit-log':
        html = AuditLogView.render({ events });
        break;
      case 'import-export':
        html = ImportExportView.render();
        break;
      case 'settings':
        html = SettingsView.render({ settings, activeTab: this.settingsTab });
        break;
      case 'system-health':
        html = SystemHealthView.render({ items, counterparties, events });
        break;
      case 'help-docs':
        html = HelpDocumentationView.render();
        break;
      default:
        html = DashboardView.render({ items, metrics });
    }

    viewContainer.innerHTML = html;

    // Update navigation counters
    const sidebarEl = document.getElementById('sidebar');
    const topbarEl = document.getElementById('topbar');
    if (sidebarEl) sidebarEl.innerHTML = this.nav.renderSidebar(this.currentRoute, metrics, settings);
    if (topbarEl) topbarEl.innerHTML = this.nav.renderTopbar(this.currentRoute, metrics, this.notifications.unreadCount, settings);
  }

  // ==================== ROUTING ====================

  navigate(route) {
    this.currentRoute = route;
    if (route !== 'contacts') this.selectedContactId = null;
    this.render();
  }

  viewItemDetail(itemId) {
    this.selectedItemId = itemId;
    this.navigate('waiting-detail');
  }

  viewContactDetail(contactId) {
    this.selectedContactId = contactId;
    this.navigate('contacts');
  }

  navigateFocus(index) {
    this.focusIndex = Math.max(0, index);
    this.render();
  }

  // ==================== QUICK ADD ====================

  openQuickAdd() {
    const modal = document.getElementById('quick-add-modal');
    if (modal) {
      modal.classList.add('active');
      const firstInput = modal.querySelector('input[name="title"]');
      if (firstInput) firstInput.focus();
    }
  }

  closeQuickAdd() {
    const modal = document.getElementById('quick-add-modal');
    if (modal) modal.classList.remove('active');
  }

  async handleQuickAddSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    const title = formData.get('title');
    const description = formData.get('description');
    const category = formData.get('category');
    const counterpartyName = formData.get('counterpartyName');
    const counterpartyOrg = formData.get('counterpartyOrg');
    const counterpartyEmail = formData.get('counterpartyEmail');
    const expectedResponseAt = formData.get('expectedResponseAt') || null;
    const hardDeadlineAt = formData.get('hardDeadlineAt') || null;
    const userPriority = Number(formData.get('userPriority') || 3);
    const impactLevel = Number(formData.get('impactLevel') || 3);
    const monetaryExposure = Number(formData.get('monetaryExposure') || 0);
    const downstreamLabel = formData.get('downstreamLabel');

    const dependencies = [];
    if (downstreamLabel && downstreamLabel.trim()) {
      dependencies.push({
        label: downstreamLabel.trim(),
        targetType: 'TASK',
        criticality: impactLevel
      });
    }

    const created = await this.repo.saveItem({
      title,
      description,
      category,
      counterpartyName,
      counterpartyOrg,
      counterpartyEmail,
      expectedResponseAt,
      hardDeadlineAt,
      userPriority,
      impactLevel,
      monetaryExposure
    }, dependencies);

    this.closeQuickAdd();
    form.reset();

    this.notifications.notify({
      title: 'Waiting Item Tracked',
      body: `"${created.title}" added to active blockers.`,
      type: 'SUCCESS'
    });

    this.viewItemDetail(created.id);
  }

  // ==================== COMMAND PALETTE ====================

  openCommandPalette() {
    const modal = document.getElementById('command-palette-modal');
    if (modal) {
      modal.classList.add('active');
      const input = document.getElementById('cmd-input');
      if (input) {
        input.value = '';
        input.focus();
      }
      this.filterCommandPalette('');
    }
  }

  closeCommandPalette() {
    const modal = document.getElementById('command-palette-modal');
    if (modal) modal.classList.remove('active');
  }

  filterCommandPalette(query) {
    const listEl = document.getElementById('cmd-list');
    if (!listEl) return;

    const allCommands = this.commandPalette.getCommands();
    const q = query.toLowerCase().trim();

    const filtered = allCommands.filter(c => 
      c.title.toLowerCase().includes(q) || 
      c.category.toLowerCase().includes(q)
    );

    listEl.innerHTML = this.commandPalette.renderCommandList(filtered);
  }

  executeCommand(cmdId) {
    const cmd = this.commandPalette.getCommands().find(c => c.id === cmdId);
    this.closeCommandPalette();
    if (cmd && cmd.action) cmd.action();
  }

  // ==================== SHORTCUTS MODAL ====================

  openShortcuts() {
    const modal = document.getElementById('shortcuts-modal');
    if (modal) modal.classList.add('active');
  }

  closeShortcuts() {
    const modal = document.getElementById('shortcuts-modal');
    if (modal) modal.classList.remove('active');
  }

  closeAllModals() {
    this.closeQuickAdd();
    this.closeCommandPalette();
    this.closeShortcuts();
  }

  // ==================== COMPOSER ====================

  openComposerForItem(itemId) {
    this.composerItemId = itemId;
    this.navigate('followup-composer');
  }

  setComposerItem(itemId) {
    this.composerItemId = itemId;
    this.render();
  }

  setComposerTemplate(templateId) {
    this.composerTemplate = templateId;
    this.render();
  }

  setComposerTone(tone) {
    this.composerTone = tone;
    this.render();
  }

  copyComposerText() {
    const body = document.getElementById('composer-body');
    if (body) {
      navigator.clipboard.writeText(body.value);
      this.notifications.notify({
        title: 'Copied to Clipboard',
        body: 'Follow-up message copied ready for your email client or chat.',
        type: 'SUCCESS'
      });
    }
  }

  async logFollowUpFromComposer(itemId) {
    if (!itemId) return;
    const body = document.getElementById('composer-body')?.value || '';
    
    await this.repo.logFollowUpAction(itemId, {
      message: body,
      channel: 'Email'
    });

    this.notifications.notify({
      title: 'Follow-up Logged',
      body: 'Timeline updated and follow-up cooldown schedule reset.',
      type: 'SUCCESS'
    });

    this.viewItemDetail(itemId);
  }

  // ==================== ITEM ACTIONS ====================

  async quickSnooze(itemId, days = 3) {
    const snoozeUntil = new Date(Date.now() + days * 24 * 3600 * 1000).toISOString();
    await this.repo.transitionItemStatus(itemId, WaitingStatus.SNOOZED, {
      snoozeUntil,
      reason: `Quick snoozed for ${days} days.`
    });

    this.notifications.notify({
      title: 'Item Snoozed',
      body: `Reminder paused until ${new Date(snoozeUntil).toLocaleDateString()}.`,
      type: 'INFO'
    });
  }

  async promptEscalate(itemId) {
    const reason = prompt('Enter escalation rationale / channel (e.g. Supervisor CC, Phone call):');
    if (reason !== null) {
      await this.repo.transitionItemStatus(itemId, WaitingStatus.ESCALATED, {
        ladderLevel: 'Level 3 Escalation',
        reason
      });
      this.notifications.notify({
        title: 'Item Escalated',
        body: 'Escalation recorded in timeline.',
        type: 'ESCALATION'
      });
    }
  }

  async promptResolve(itemId) {
    const resolutionSummary = prompt('Enter resolution summary / outcome details:');
    if (resolutionSummary !== null) {
      await this.repo.transitionItemStatus(itemId, WaitingStatus.RESOLVED, {
        resolutionSummary: resolutionSummary || 'Completed and unblocked.'
      });
      this.notifications.notify({
        title: 'Dependency Resolved',
        body: 'Item archived with resolution record.',
        type: 'SUCCESS'
      });
    }
  }

  async promptReopen(itemId) {
    const reason = prompt('Enter reason for reopening:');
    if (reason) {
      await this.repo.transitionItemStatus(itemId, WaitingStatus.WAITING, { reason });
      this.notifications.notify({
        title: 'Item Reopened',
        body: 'Returned to active waiting list.',
        type: 'INFO'
      });
    }
  }

  async promptDelete(itemId) {
    if (confirm('Are you sure you want to permanently delete this waiting item?')) {
      await this.repo.deleteItem(itemId);
      this.notifications.notify({
        title: 'Item Deleted',
        body: 'Record removed from local database.',
        type: 'INFO'
      });
      this.navigate('waiting-list');
    }
  }

  async promptAddNote(itemId) {
    const note = prompt('Add note or communication update:');
    if (note) {
      await this.repo.appendTimelineEvent({
        waitingItemId: itemId,
        title: 'User note added',
        note,
        actor: 'User'
      });
    }
  }

  async promptAddDependency(itemId) {
    const label = prompt('Enter downstream deliverable / blocked work name:');
    if (label) {
      await this.repo.addDependency(itemId, {
        label,
        targetType: 'TASK',
        criticality: 4
      });
    }
  }

  async removeDependency(depId, itemId) {
    await this.repo.removeDependency(depId);
  }

  // ==================== LIST FILTERS ====================

  setListFilter(filter) {
    this.listFilter = filter;
    this.render();
  }

  setListCategory(cat) {
    this.listCategory = cat;
    this.render();
  }

  setListSort(sort) {
    this.listSort = sort;
    this.render();
  }

  setListSearch(q) {
    this.listSearch = q;
    this.render();
  }

  async toggleTheme() {
    const settings = await this.repo.getAllSettings();
    const themes = ['dark', 'midnight', 'cyberpunk', 'light'];
    const current = settings.theme || 'dark';
    const nextIdx = (themes.indexOf(current) + 1) % themes.length;
    const nextTheme = themes[nextIdx];
    await this.updateSetting('theme', nextTheme);
  }

  // ==================== SETTINGS & DATA ====================

  setSettingsTab(tab) {
    this.settingsTab = tab;
    this.render();
  }

  async updateSetting(key, value) {
    await this.repo.setSetting(key, value);
    this.render();
    this.notifications.notify({
      title: 'Setting Saved',
      body: `${key} updated.`,
      type: 'INFO'
    });
  }

  async triggerQuickExport(format) {
    const items = await this.repo.getAllItems();
    let content = '';
    let mime = 'text/plain';
    let filename = `waitingroom-export-${Date.now()}`;

    if (format === 'json') {
      const backup = await BackupRestoreEngine.createBackup(this.repo);
      content = JSON.stringify(backup, null, 2);
      mime = 'application/json';
      filename += '.json';
    } else if (format === 'csv') {
      content = ImportExportService.exportToCSV(items);
      mime = 'text/csv';
      filename += '.csv';
    } else if (format === 'md') {
      content = ImportExportService.exportToMarkdown(items);
      mime = 'text/markdown';
      filename += '.md';
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    this.notifications.notify({
      title: 'Export Generated',
      body: `Downloaded ${filename}`,
      type: 'SUCCESS'
    });
  }

  async handleFileImport(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      if (file.name.endsWith('.json')) {
        try {
          const bundle = JSON.parse(text);
          const res = await BackupRestoreEngine.restoreBackup(this.repo, bundle, false);
          this.notifications.notify({
            title: 'Import Successful',
            body: `Restored ${res.restoredItems} items and ${res.restoredContacts} contacts.`,
            type: 'SUCCESS'
          });
          this.navigate('dashboard');
        } catch (err) {
          alert(`Import failed: ${err.message}`);
        }
      } else if (file.name.endsWith('.csv')) {
        const items = ImportExportService.parseCSV(text);
        for (const it of items) await this.repo.saveItem(it);
        this.notifications.notify({
          title: 'CSV Ingested',
          body: `Imported ${items.length} records.`,
          type: 'SUCCESS'
        });
        this.navigate('waiting-list');
      }
    };
    reader.readAsText(file);
  }

  async loadDemoSeed() {
    const { SEED_ITEMS, SEED_COUNTERPARTIES, SEED_DEPENDENCIES, SEED_TIMELINE_EVENTS } = await import('./storage/seedData.js');
    for (const cp of SEED_COUNTERPARTIES) await this.repo.db.put('counterparties', cp);
    for (const item of SEED_ITEMS) await this.repo.db.put('waiting_items', item);
    for (const dep of SEED_DEPENDENCIES) await this.repo.db.put('dependencies', dep);
    for (const evt of SEED_TIMELINE_EVENTS) await this.repo.db.put('timeline_events', evt);

    this.notifications.notify({
      title: 'Starter Data Loaded',
      body: 'Loaded rich example items, counterparties, and histories.',
      type: 'SUCCESS'
    });
    this.navigate('dashboard');
  }

  async recalculateAll() {
    this.repo._notify();
    this.notifications.notify({
      title: 'Scores Recalculated',
      body: 'All active blocker scores and policy recommendations refreshed.',
      type: 'SUCCESS'
    });
  }

  async promptWipeDatabase() {
    if (confirm('WARNING: This will delete ALL local data in WaitingRoom. Proceed?')) {
      await this.repo.db.clear('waiting_items');
      await this.repo.db.clear('counterparties');
      await this.repo.db.clear('dependencies');
      await this.repo.db.clear('timeline_events');
      this.notifications.notify({
        title: 'Database Wiped',
        body: 'All local records cleared.',
        type: 'INFO'
      });
      this.navigate('dashboard');
    }
  }

  openProfileSettings() {
    this.settingsTab = 'profile';
    this.navigate('settings');
  }

  markAllNotificationsRead() {
    this.notifications.markAllAsRead();
    this.render();
    this.notifications.notify({
      title: 'Feed Updated',
      body: 'All notifications marked as read.',
      type: 'INFO'
    });
  }

  clearAllNotifications() {
    this.notifications.clearAll();
    this.render();
    this.notifications.notify({
      title: 'Feed Cleared',
      body: 'Notification history reset for this session.',
      type: 'INFO'
    });
  }

  // ==================== AUTHENTICATION ACTIONS ====================

  setAuthMode(mode) {
    this.authMode = mode;
    this.authError = null;
    this.render();
  }

  toggleFirebaseConfigModal() {
    const modal = document.getElementById('firebase-config-modal');
    if (modal) modal.classList.toggle('active');
  }

  async handleSaveFirebaseConfig(event) {
    event.preventDefault();
    const fd = new FormData(event.target);
    const config = {
      apiKey: fd.get('apiKey')?.trim(),
      authDomain: fd.get('authDomain')?.trim(),
      projectId: fd.get('projectId')?.trim()
    };
    await this.auth.saveFirebaseConfig(config);
    this.toggleFirebaseConfigModal();
    this.render();
    this.notifications.notify({
      title: 'Firebase Connected',
      body: 'Firebase configuration saved.',
      type: 'SUCCESS'
    });
  }

  async handleLoginSubmit(event) {
    event.preventDefault();
    const fd = new FormData(event.target);
    try {
      await this.auth.loginWithEmail(fd.get('email'), fd.get('password'));
      this.render();
      this.notifications.notify({
        title: 'Signed In',
        body: `Welcome back, ${this.auth.getCurrentUser().name}!`,
        type: 'SUCCESS'
      });
    } catch (err) {
      this.authError = err.message;
      this.render();
    }
  }

  async handleSignupSubmit(event) {
    event.preventDefault();
    const fd = new FormData(event.target);
    try {
      await this.auth.signUpWithEmail(fd.get('email'), fd.get('password'), {
        name: fd.get('name'),
        role: fd.get('role'),
        org: fd.get('org')
      });
      this.render();
      this.notifications.notify({
        title: 'Account Created',
        body: `Welcome to WaitingRoom, ${this.auth.getCurrentUser().name}!`,
        type: 'SUCCESS'
      });
    } catch (err) {
      this.authError = err.message;
      this.render();
    }
  }

  async handleProfileLogin(profileId) {
    await this.auth.loginWithProfile(profileId);
    this.render();
    this.notifications.notify({
      title: 'Profile Loaded',
      body: `Logged in as ${this.auth.getCurrentUser().name}`,
      type: 'SUCCESS'
    });
  }

  async handleGuestLogin() {
    await this.auth.loginAsGuest();
    this.render();
  }

  logout() {
    this.auth.logout();
    this.render();
  }
}

// Bootstrap
window.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
  window.app.start();
});
