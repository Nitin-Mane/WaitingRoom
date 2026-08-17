/**
 * Application Settings View (Comprehensive 8 Tabs including Profile & Account Details)
 */

export class SettingsView {
  static render(data = {}) {
    const { settings = {}, activeTab = 'profile' } = data;

    const tabs = [
      { id: 'profile', name: 'Profile & Account', icon: 'account_circle' },
      { id: 'general', name: 'General Preferences', icon: 'tune' },
      { id: 'appearance', name: 'Appearance & Theme', icon: 'palette' },
      { id: 'followups', name: 'Follow-up Cadence', icon: 'schedule' },
      { id: 'notifications', name: 'Notification Status', icon: 'notifications' },
      { id: 'privacy', name: 'Privacy & Storage', icon: 'lock' },
      { id: 'backup', name: 'Backup & Restore', icon: 'save' },
      { id: 'integrations', name: 'Loopback API', icon: 'hub' }
    ];

    return `
      <div class="view-animate max-w-5xl mx-auto space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-base font-bold text-slate-100">Application Settings</h2>
            <p class="text-xs text-slate-400">Configure profile, account preferences, notification policies, and appearance</p>
          </div>
          <button class="btn-primary text-xs" onclick="window.app.renderCurrentView()">
            <span class="material-symbols-outlined text-sm">check</span>
            <span>Applied Locally</span>
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <!-- Settings Sidebar Tabs -->
          <div class="space-y-1">
            ${tabs.map(t => `
              <div 
                class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${activeTab === t.id ? 'bg-indigo-950 text-indigo-300 border border-indigo-800/60 font-semibold shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'}"
                onclick="window.app.setSettingsTab('${t.id}')"
              >
                <span class="material-symbols-outlined text-base">${t.icon}</span>
                <span>${t.name}</span>
              </div>
            `).join('')}
          </div>

          <!-- Settings Tab Content Area (3 cols) -->
          <div class="md:col-span-3">
            <div class="wr-card bg-slate-900 border border-slate-800 p-6 space-y-6">
              ${this.renderTabContent(activeTab, settings)}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  static renderTabContent(tab, settings) {
    // 1. Profile & Account Settings
    if (tab === 'profile') {
      const userName = settings.userName || 'Dr. Lisa Reynolds';
      const userRole = settings.userRole || 'Principal Distributed Systems Architect';
      const userOrg = settings.userOrg || 'Apex Dynamics Research Lab';
      const userEmail = settings.userEmail || 'lisa.reynolds@apexdynamics.io';
      const userAvatar = settings.userAvatar || 'LR';
      const userTimezone = settings.userTimezone || 'Asia/Kolkata';

      return `
        <div class="space-y-6">
          <div class="flex items-start justify-between pb-4 border-b border-slate-800">
            <div class="flex items-center gap-4">
              <!-- Avatar Preview -->
              <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 border-2 border-indigo-400/50 flex items-center justify-center font-black text-xl text-white shadow-xl">
                ${userAvatar}
              </div>
              <div>
                <h3 class="text-base font-bold text-slate-100">${userName}</h3>
                <p class="text-xs text-slate-400">${userRole} &bull; <strong class="text-slate-200">${userOrg}</strong></p>
                <div class="text-[11px] text-slate-500 font-mono mt-1">${userEmail}</div>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <div class="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-right">
                <div class="text-[10px] uppercase font-bold text-slate-400">Account Type</div>
                <div class="text-xs font-bold text-emerald-400 mt-0.5 flex items-center gap-1 justify-end">
                  <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Local-First Pro</span>
                </div>
                <div class="text-[10px] text-slate-500">Zero Cloud / Hardware Offline</div>
              </div>

              <button class="btn-secondary text-xs py-2 px-3 hover:text-red-400" onclick="window.app.logout()" title="Sign Out & Switch Account">
                <span class="material-symbols-outlined text-sm">logout</span>
                <span>Switch / Sign Out</span>
              </button>
            </div>
          </div>

          <!-- Edit Profile Form -->
          <div class="space-y-4 text-xs">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block font-semibold text-slate-300 mb-1">Full Name</label>
                <input 
                  type="text" 
                  value="${userName}" 
                  class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                  onchange="window.app.updateSetting('userName', this.value)"
                />
              </div>

              <div>
                <label class="block font-semibold text-slate-300 mb-1">Avatar Initials</label>
                <input 
                  type="text" 
                  maxlength="3"
                  value="${userAvatar}" 
                  class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs uppercase font-mono text-center focus:outline-none focus:border-indigo-500"
                  onchange="window.app.updateSetting('userAvatar', this.value.toUpperCase())"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block font-semibold text-slate-300 mb-1">Professional Title / Role</label>
                <input 
                  type="text" 
                  value="${userRole}" 
                  class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                  onchange="window.app.updateSetting('userRole', this.value)"
                />
              </div>

              <div>
                <label class="block font-semibold text-slate-300 mb-1">Organization / Institution</label>
                <input 
                  type="text" 
                  value="${userOrg}" 
                  class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                  onchange="window.app.updateSetting('userOrg', this.value)"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block font-semibold text-slate-300 mb-1">Primary Email / Sender Handle</label>
                <input 
                  type="text" 
                  value="${userEmail}" 
                  class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                  onchange="window.app.updateSetting('userEmail', this.value)"
                />
              </div>

              <div>
                <label class="block font-semibold text-slate-300 mb-1">Workspace Timezone</label>
                <select 
                  class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                  onchange="window.app.updateSetting('userTimezone', this.value)"
                >
                  <option value="Asia/Kolkata" ${userTimezone === 'Asia/Kolkata' ? 'selected' : ''}>UTC+05:30 (Asia/Kolkata - IST)</option>
                  <option value="America/New_York" ${userTimezone === 'America/New_York' ? 'selected' : ''}>UTC-05:00 (America/New_York - EST)</option>
                  <option value="America/Los_Angeles" ${userTimezone === 'America/Los_Angeles' ? 'selected' : ''}>UTC-08:00 (America/Los_Angeles - PST)</option>
                  <option value="Europe/London" ${userTimezone === 'Europe/London' ? 'selected' : ''}>UTC+00:00 (Europe/London - GMT/BST)</option>
                  <option value="Europe/Berlin" ${userTimezone === 'Europe/Berlin' ? 'selected' : ''}>UTC+01:00 (Europe/Berlin - CET)</option>
                  <option value="Asia/Tokyo" ${userTimezone === 'Asia/Tokyo' ? 'selected' : ''}>UTC+09:00 (Asia/Tokyo - JST)</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Account Security Status Card -->
          <div class="pt-4 border-t border-slate-800 space-y-3">
            <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider">Account Storage & Security</h4>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div class="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                <div class="text-slate-400 font-medium">Data Storage Sandbox</div>
                <div class="font-mono text-indigo-300 font-bold">IndexedDB v1.0 (Local-First)</div>
                <div class="text-[10px] text-slate-500">Data never leaves your machine</div>
              </div>

              <div class="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                <div class="text-slate-400 font-medium">Encryption & Integrity</div>
                <div class="font-mono text-emerald-400 font-bold">Hardware Sandbox Active</div>
                <div class="text-[10px] text-slate-500">Offline tamper-evident event log</div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    // 2. Appearance & Themes
    if (tab === 'appearance') {
      const currentTheme = settings.theme || 'dark';

      const themeCards = [
        {
          id: 'dark',
          name: 'Dark Navy',
          desc: 'Balanced deep indigo and navy palette (Default)',
          bg: '#0b1326',
          cardBg: '#171f33',
          accent: '#c0c1ff',
          textColor: '#dae2fd'
        },
        {
          id: 'midnight',
          name: 'Midnight OLED',
          desc: 'High contrast deep black surfaces with indigo highlights',
          bg: '#030712',
          cardBg: '#111827',
          accent: '#a5b4fc',
          textColor: '#f3f4f6'
        },
        {
          id: 'cyberpunk',
          name: 'Cyberpunk Slate',
          desc: 'Electric blue and slate cybernetic theme',
          bg: '#080d1a',
          cardBg: '#13203f',
          accent: '#38bdf8',
          textColor: '#e0f2fe'
        },
        {
          id: 'light',
          name: 'Light Clean',
          desc: 'Bright, crisp daytime interface with indigo accents',
          bg: '#f8fafc',
          cardBg: '#ffffff',
          accent: '#4f46e5',
          textColor: '#0f172a'
        }
      ];

      return `
        <div class="space-y-6">
          <div>
            <h3 class="text-sm font-bold text-slate-100">Appearance & Themes</h3>
            <p class="text-xs text-slate-400">Select your preferred color mode and visual density</p>
          </div>
          
          <!-- Theme Preset Cards Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            ${themeCards.map(tc => `
              <div 
                class="wr-card p-4 border-2 rounded-xl cursor-pointer transition-all ${currentTheme === tc.id ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-lg' : 'border-slate-800 hover:border-slate-700'}"
                onclick="window.app.updateSetting('theme', '${tc.id}')"
              >
                <!-- Mini UI Preview Box -->
                <div class="h-20 rounded-lg p-2.5 mb-3 flex flex-col justify-between border border-slate-700/40" style="background-color: ${tc.bg};">
                  <div class="flex items-center justify-between">
                    <div class="w-12 h-2 rounded" style="background-color: ${tc.accent};"></div>
                    <div class="w-3 h-3 rounded-full" style="background-color: ${tc.accent}; opacity: 0.8;"></div>
                  </div>
                  <div class="p-2 rounded flex items-center justify-between border border-slate-700/30" style="background-color: ${tc.cardBg};">
                    <div class="w-16 h-1.5 rounded" style="background-color: ${tc.textColor}; opacity: 0.6;"></div>
                    <div class="w-6 h-1.5 rounded" style="background-color: ${tc.accent};"></div>
                  </div>
                </div>

                <div class="flex items-center justify-between">
                  <div>
                    <div class="font-bold text-xs text-slate-100 flex items-center gap-1.5">
                      <span>${tc.name}</span>
                      ${currentTheme === tc.id ? '<span class="text-indigo-400 text-xs font-semibold">✓ Active</span>' : ''}
                    </div>
                    <div class="text-[11px] text-slate-400 mt-0.5">${tc.desc}</div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Density & Layout Settings -->
          <div class="pt-4 border-t border-slate-800 space-y-3">
            <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider">Layout Density</h4>

            <div class="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs">
              <div>
                <div class="font-semibold text-slate-200">High-Density Table Rows</div>
                <div class="text-slate-500 text-[11px]">Display more data rows per screen</div>
              </div>
              <input type="checkbox" ${settings.compactDensity ? 'checked' : ''} onchange="window.app.updateSetting('compactDensity', this.checked)" />
            </div>
          </div>
        </div>
      `;
    }

    // 3. Notification Policies & Status
    if (tab === 'notifications') {
      return `
        <div class="space-y-6">
          <div>
            <h3 class="text-sm font-bold text-slate-100">Notification Policies & Live Status</h3>
            <p class="text-xs text-slate-400">Configure reminder triggers, desktop notifications, and quiet hours</p>
          </div>

          <!-- Live Status Summary -->
          <div class="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                <span class="material-symbols-outlined text-xl">notifications_active</span>
              </div>
              <div>
                <div class="font-bold text-slate-100">Notification Scheduler Running</div>
                <div class="text-[11px] text-slate-400">Automatic reconciliation checks run every 60 seconds</div>
              </div>
            </div>
            <button class="btn-secondary text-xs py-1" onclick="window.app.navigate('notifications-center')">
              Open Center &rarr;
            </button>
          </div>
          
          <div class="space-y-3 text-xs">
            <div class="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div>
                <div class="font-semibold text-slate-200">Enable Quiet Hours</div>
                <div class="text-slate-500 text-[11px]">Suppress alerts during rest hours (21:00 to 08:00)</div>
              </div>
              <input type="checkbox" ${settings.quietHoursEnabled !== false ? 'checked' : ''} onchange="window.app.updateSetting('quietHoursEnabled', this.checked)" />
            </div>

            <div class="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div>
                <div class="font-semibold text-slate-200">In-App Toast Alerts</div>
                <div class="text-slate-500 text-[11px]">Display subtle popup banners when deadlines approach</div>
              </div>
              <input type="checkbox" ${settings.soundAlerts !== false ? 'checked' : ''} onchange="window.app.updateSetting('soundAlerts', this.checked)" />
            </div>

            <div class="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div>
                <div class="font-semibold text-slate-200">Browser Desktop Notifications</div>
                <div class="text-slate-500 text-[11px]">OS level tray and window alerts</div>
              </div>
              <button class="btn-secondary text-xs py-1" onclick="window.app.notifications.requestBrowserPermission()">
                Request Permission
              </button>
            </div>
          </div>
        </div>
      `;
    }

    // 4. Privacy & Storage
    if (tab === 'privacy') {
      return `
        <div class="space-y-6">
          <div>
            <h3 class="text-sm font-bold text-slate-100">Privacy & Local-First Storage Guarantees</h3>
            <p class="text-xs text-slate-400">WaitingRoom runs 100% locally on your machine. No telemetry or private text is ever dispatched to external servers.</p>
          </div>
          
          <div class="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-3">
            <div class="text-emerald-400 font-semibold flex items-center gap-1.5">
              <span class="material-symbols-outlined text-sm">security</span>
              <span>Zero-Cloud Storage Guarantee</span>
            </div>
            <p class="text-slate-300 leading-relaxed">
              Your database resides strictly in your browser / desktop sandbox storage. All backups are stored as local files.
            </p>
          </div>

          <div class="space-y-3 text-xs">
            <div class="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div>
                <div class="font-semibold text-slate-200">Redaction & Privacy Mode</div>
                <div class="text-slate-500 text-[11px]">Hides sensitive financial and personal note details in screenshots</div>
              </div>
              <input type="checkbox" ${settings.privacyRedactionMode ? 'checked' : ''} onchange="window.app.updateSetting('privacyRedactionMode', this.checked)" />
            </div>
          </div>
        </div>
      `;
    }

    // Default: General Preferences
    return `
      <div class="space-y-6">
        <div>
          <h3 class="text-sm font-bold text-slate-100">General Workspace Preferences</h3>
          <p class="text-xs text-slate-400">Startup behaviors and regional formatting</p>
        </div>
        
        <div class="space-y-3 text-xs">
          <div class="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
            <div>
              <div class="font-semibold text-slate-200">Startup View</div>
              <div class="text-slate-500 text-[11px]">Default landing view upon application launch</div>
            </div>
            <select class="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-slate-200 text-xs" onchange="window.app.updateSetting('startupView', this.value)">
              <option value="dashboard" ${settings.startupView === 'dashboard' ? 'selected' : ''}>Overview Dashboard</option>
              <option value="waiting-list" ${settings.startupView === 'waiting-list' ? 'selected' : ''}>Waiting Items Directory</option>
              <option value="kinetic-focus" ${settings.startupView === 'kinetic-focus' ? 'selected' : ''}>Kinetic Focus Mode</option>
            </select>
          </div>

          <div class="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
            <div>
              <div class="font-semibold text-slate-200">Default Follow-Up Cadence</div>
              <div class="text-slate-500 text-[11px]">Days between check-in recommendations</div>
            </div>
            <input 
              type="number" 
              min="1" 
              max="30" 
              value="${settings.defaultFollowUpInterval || 4}" 
              class="w-16 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-slate-200 text-xs text-center"
              onchange="window.app.updateSetting('defaultFollowUpInterval', Number(this.value))"
            />
          </div>

          <div class="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
            <div>
              <div class="font-semibold text-slate-200">Max Follow-ups Before Escalation</div>
              <div class="text-slate-500 text-[11px]">Auto-recommends Level 3 Escalation once exceeded</div>
            </div>
            <input 
              type="number" 
              min="1" 
              max="5" 
              value="${settings.maxFollowUpsBeforeEscalation || 2}" 
              class="w-16 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-slate-200 text-xs text-center"
              onchange="window.app.updateSetting('maxFollowUpsBeforeEscalation', Number(this.value))"
            />
          </div>
        </div>
      </div>
    `;
  }
}
