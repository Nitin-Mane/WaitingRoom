/**
 * Authentication & Profile Login View
 * Animated Login, Signup, and Profile-Based Switcher with Firebase Console Integration.
 */

import { PRESET_PROFILES } from '../services/authService.js';

export class AuthView {
  static render(data = {}) {
    const { mode = 'LOGIN', firebaseConfig = {}, error = null, loading = false } = data;
    const isFirebaseConnected = !!firebaseConfig.apiKey;

    return `
      <div class="view-animate min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-[#0b1326] text-[#dae2fd]">
        <!-- Ambient Glowing Background Orbs & Grid -->
        <div class="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(128,131,255,0.15),rgba(255,255,255,0))] pointer-events-none"></div>
        <div class="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-indigo-600/15 blur-[120px] pointer-events-none"></div>
        <div class="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-purple-600/15 blur-[120px] pointer-events-none"></div>

        <!-- Central Auth Box -->
        <div class="w-full max-w-md z-10 space-y-6">
          <!-- Brand Logo Header -->
          <div class="text-center space-y-2">
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#494bd6] via-[#8083ff] to-[#c0c1ff] p-0.5 shadow-2xl shadow-indigo-950/80 mb-2">
              <div class="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <span class="material-symbols-outlined text-indigo-300 text-3xl animate-pulse" style="font-variation-settings: 'FILL' 1;">hourglass_bottom</span>
              </div>
            </div>
            <h1 class="text-2xl font-black text-white tracking-tight">WaitingRoom</h1>
            <p class="text-xs text-slate-400">Never lose track of what you're waiting for</p>
          </div>

          <!-- Auth Card Container -->
          <div class="wr-card bg-slate-900/90 border border-slate-700/80 p-6 rounded-2xl shadow-2xl backdrop-blur-xl space-y-5">
            <!-- Mode Switcher Tabs -->
            <div class="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold">
              <button 
                class="flex-1 py-2 rounded-lg transition-all ${mode === 'LOGIN' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}"
                onclick="window.app.setAuthMode('LOGIN')"
              >
                Sign In
              </button>
              <button 
                class="flex-1 py-2 rounded-lg transition-all ${mode === 'SIGNUP' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}"
                onclick="window.app.setAuthMode('SIGNUP')"
              >
                Sign Up
              </button>
              <button 
                class="flex-1 py-2 rounded-lg transition-all ${mode === 'PROFILES' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}"
                onclick="window.app.setAuthMode('PROFILES')"
              >
                Profiles
              </button>
            </div>

            <!-- Error Banner if any -->
            ${error ? `
              <div class="p-3 bg-red-950/60 border border-red-800/60 rounded-xl text-xs text-red-300 flex items-center gap-2">
                <span class="material-symbols-outlined text-base text-red-400">error</span>
                <span>${error}</span>
              </div>
            ` : ''}

            <!-- 1. SIGN IN FORM -->
            ${mode === 'LOGIN' ? `
              <form onsubmit="window.app.handleLoginSubmit(event)" class="space-y-4 text-xs">
                <div>
                  <label class="block font-semibold text-slate-300 mb-1">Email Address</label>
                  <input 
                    name="email" 
                    type="email" 
                    required 
                    placeholder="lisa.reynolds@apexdynamics.io" 
                    value="lisa.reynolds@apexdynamics.io"
                    class="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs"
                  />
                </div>

                <div>
                  <div class="flex items-center justify-between mb-1">
                    <label class="font-semibold text-slate-300">Password</label>
                    <a class="text-[11px] text-indigo-400 hover:underline cursor-pointer" onclick="alert('In offline/local mode, any password works. For Firebase, use your registered password.')">Forgot?</a>
                  </div>
                  <input 
                    name="password" 
                    type="password" 
                    required 
                    placeholder="••••••••" 
                    value="password123"
                    class="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs"
                  />
                </div>

                <button type="submit" class="w-full btn-primary justify-center py-2.5 text-xs font-bold rounded-xl shadow-lg shadow-indigo-950">
                  <span class="material-symbols-outlined text-sm">login</span>
                  <span>Sign In to Workspace</span>
                </button>
              </form>
            ` : ''}

            <!-- 2. SIGN UP FORM -->
            ${mode === 'SIGNUP' ? `
              <form onsubmit="window.app.handleSignupSubmit(event)" class="space-y-3 text-xs">
                <div>
                  <label class="block font-semibold text-slate-300 mb-1">Full Name</label>
                  <input 
                    name="name" 
                    type="text" 
                    required 
                    placeholder="e.g. Dr. Lisa Reynolds" 
                    class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <label class="block font-semibold text-slate-300 mb-1">Title / Role</label>
                    <input 
                      name="role" 
                      type="text" 
                      placeholder="e.g. Staff Architect" 
                      class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label class="block font-semibold text-slate-300 mb-1">Organization</label>
                    <input 
                      name="org" 
                      type="text" 
                      placeholder="e.g. Apex Dynamics" 
                      class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label class="block font-semibold text-slate-300 mb-1">Email</label>
                  <input 
                    name="email" 
                    type="email" 
                    required 
                    placeholder="you@domain.com" 
                    class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label class="block font-semibold text-slate-300 mb-1">Password</label>
                  <input 
                    name="password" 
                    type="password" 
                    required 
                    placeholder="Create a password" 
                    class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <button type="submit" class="w-full btn-primary justify-center py-2.5 text-xs font-bold rounded-xl mt-2">
                  <span class="material-symbols-outlined text-sm">person_add</span>
                  <span>Create Account & Workspace</span>
                </button>
              </form>
            ` : ''}

            <!-- 3. PROFILE-BASED QUICK LOGIN -->
            ${mode === 'PROFILES' ? `
              <div class="space-y-3">
                <p class="text-xs text-slate-400">Select a pre-configured profile to instantly launch the workspace:</p>
                
                <div class="space-y-2">
                  ${PRESET_PROFILES.map(prof => `
                    <div 
                      class="p-3 bg-slate-950 border border-slate-800 hover:border-indigo-500/80 rounded-xl flex items-center justify-between cursor-pointer transition-all hover:bg-slate-800/40"
                      onclick="window.app.handleProfileLogin('${prof.id}')"
                    >
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white shadow-md" style="background-color: ${prof.color};">
                          ${prof.avatar}
                        </div>
                        <div>
                          <div class="font-bold text-xs text-slate-100">${prof.name}</div>
                          <div class="text-[11px] text-slate-400">${prof.role} &bull; ${prof.org}</div>
                        </div>
                      </div>
                      <span class="material-symbols-outlined text-slate-500 text-base">arrow_forward</span>
                    </div>
                  `).join('')}
                </div>

                <button class="w-full btn-secondary justify-center py-2 text-xs" onclick="window.app.handleGuestLogin()">
                  <span class="material-symbols-outlined text-sm">explore</span>
                  <span>Continue as Guest Explorer</span>
                </button>
              </div>
            ` : ''}

            <!-- Firebase Console Link Bar -->
            <div class="pt-4 border-t border-slate-800 flex items-center justify-between text-[11px]">
              <div class="flex items-center gap-1.5 ${isFirebaseConnected ? 'text-emerald-400' : 'text-amber-400'}">
                <span class="w-2 h-2 rounded-full ${isFirebaseConnected ? 'bg-emerald-500' : 'bg-amber-500'}"></span>
                <span>${isFirebaseConnected ? 'Firebase Connected' : 'Local Offline Auth Active'}</span>
              </div>

              <button class="text-indigo-400 hover:text-indigo-200 underline font-medium cursor-pointer" onclick="window.app.toggleFirebaseConfigModal()">
                ${isFirebaseConnected ? 'Firebase Settings' : 'Connect Firebase Console'}
              </button>
            </div>
          </div>
        </div>

        <!-- Firebase Config Modal Overlay -->
        <div id="firebase-config-modal" class="modal-overlay" onclick="if(event.target === this) window.app.toggleFirebaseConfigModal()">
          <div class="modal-dialog max-w-lg bg-slate-900 border border-slate-700 p-6 space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-slate-800">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-amber-400 text-xl">local_fire_department</span>
                <h3 class="text-sm font-bold text-slate-100">Firebase Console Connection</h3>
              </div>
              <button class="text-slate-400 hover:text-slate-200 material-symbols-outlined text-base" onclick="window.app.toggleFirebaseConfigModal()">close</button>
            </div>

            <p class="text-xs text-slate-400">
              Enter your Firebase project credentials from the <strong class="text-slate-200">Firebase Console</strong> (Project Settings &rarr; General &rarr; Your apps).
            </p>

            <form onsubmit="window.app.handleSaveFirebaseConfig(event)" class="space-y-3 text-xs">
              <div>
                <label class="block font-semibold text-slate-300 mb-1">API Key</label>
                <input name="apiKey" type="text" placeholder="AIzaSy..." value="${firebaseConfig.apiKey || ''}" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs font-mono" />
              </div>
              <div>
                <label class="block font-semibold text-slate-300 mb-1">Auth Domain</label>
                <input name="authDomain" type="text" placeholder="your-project.firebaseapp.com" value="${firebaseConfig.authDomain || ''}" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs font-mono" />
              </div>
              <div>
                <label class="block font-semibold text-slate-300 mb-1">Project ID</label>
                <input name="projectId" type="text" placeholder="your-project-id" value="${firebaseConfig.projectId || ''}" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs font-mono" />
              </div>

              <div class="flex items-center justify-end gap-2 pt-2">
                <button type="button" class="btn-secondary" onclick="window.app.toggleFirebaseConfigModal()">Cancel</button>
                <button type="submit" class="btn-primary">Save & Connect</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
  }
}
