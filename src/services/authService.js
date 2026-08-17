/**
 * Authentication Service for WaitingRoom
 * Supports Firebase Console Authentication & Local-First Profile Sessions.
 */

export const PRESET_PROFILES = [
  {
    id: 'usr_lisa',
    name: 'Dr. Lisa Reynolds',
    email: 'lisa.reynolds@apexdynamics.io',
    role: 'Principal Systems Architect',
    org: 'Apex Dynamics Research Lab',
    avatar: 'LR',
    color: '#8083ff'
  },
  {
    id: 'usr_sarah',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@apexdynamics.io',
    role: 'Senior Technical Recruiter',
    org: 'Apex Dynamics HQ',
    avatar: 'SJ',
    color: '#38bdf8'
  },
  {
    id: 'usr_dave',
    name: 'Dave Chen',
    email: 'dave.chen@kernelcore.dev',
    role: 'Staff Kernel Architect',
    org: 'Kernel Core Systems',
    avatar: 'DC',
    color: '#a855f7'
  }
];

export class AuthService {
  constructor(repository) {
    this.repo = repository;
    this.currentUser = null;
    this.firebaseApp = null;
    this.firebaseAuth = null;
    this.firebaseAnalytics = null;
    this.firebaseReady = false;   // prevents duplicate init
    this.listeners = new Set();
  }

  async init() {
    // Load saved session
    const saved = localStorage.getItem('waitingroom_auth_user');
    if (saved) {
      try {
        this.currentUser = JSON.parse(saved);
      } catch (e) {
        this.currentUser = null;
      }
    }

    // Try initializing Firebase — prefer persisted config, fall back to page-injected global
    const rawConfig = localStorage.getItem('waitingroom_firebase_config');
    const config = rawConfig
      ? (() => { try { return JSON.parse(rawConfig); } catch { return null; } })()
      : (typeof window !== 'undefined' && window.FIREBASE_CONFIG) || null;

    if (config && config.apiKey) {
      try {
        const ok = await this.initFirebase(config);
        // Persist the auto-loaded config so subsequent refreshes are consistent
        if (ok && !rawConfig) {
          localStorage.setItem('waitingroom_firebase_config', JSON.stringify(config));
        }
        // If init failed and we had a stale stored config, clear it
        if (!ok && rawConfig) {
          console.warn('[Firebase] Clearing invalid stored config.');
          localStorage.removeItem('waitingroom_firebase_config');
        }
      } catch (e) {
        console.warn('[Firebase] Auto-initialization failed:', e.message);
        // Don't let Firebase errors block the app
      }
    }

    return this;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  _notify() {
    for (const l of this.listeners) l(this.currentUser);
  }

  isAuthenticated() {
    return !!this.currentUser;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  async initFirebase(config) {
    // Guard: already initialized successfully
    if (this.firebaseReady) return true;

    if (typeof window === 'undefined' || !window.firebase) {
      console.warn('[Firebase] SDK not loaded yet.');
      return false;
    }

    if (!config || !config.apiKey) {
      console.warn('[Firebase] Invalid config — missing apiKey.');
      return false;
    }

    try {
      // Avoid "duplicate app" error — reuse existing app if already initialized
      if (window.firebase.apps && window.firebase.apps.length > 0) {
        this.firebaseApp = window.firebase.app();
      } else {
        this.firebaseApp = window.firebase.initializeApp(config);
      }

      // Initialize Auth
      this.firebaseAuth = window.firebase.auth();

      // Initialize Analytics safely — it requires measurementId and browser support
      if (config.measurementId && window.firebase.analytics) {
        try {
          // analytics() is synchronous in compat SDK
          this.firebaseAnalytics = window.firebase.analytics();
          console.info('[Firebase] Analytics initialized:', config.measurementId);
        } catch (analyticsErr) {
          // Non-fatal: analytics blocked by ad-blocker or privacy settings
          console.warn('[Firebase] Analytics unavailable (likely ad-blocker):', analyticsErr.message);
        }
      }

      this.firebaseReady = true;
      console.info('[Firebase] ✅ Connected to project:', config.projectId);
      return true;
    } catch (err) {
      // Handle specific Firebase errors gracefully
      if (err.code === 'app/duplicate-app') {
        // App already exists — just get the reference
        this.firebaseApp = window.firebase.app();
        this.firebaseAuth = window.firebase.auth();
        this.firebaseReady = true;
        console.info('[Firebase] ✅ Reusing existing app:', config.projectId);
        return true;
      }
      console.error('[Firebase] Init error:', err.code, err.message);
      return false;
    }
  }

  async saveFirebaseConfig(config) {
    localStorage.setItem('waitingroom_firebase_config', JSON.stringify(config));
    return await this.initFirebase(config);
  }

  getFirebaseConfig() {
    try {
      return JSON.parse(localStorage.getItem('waitingroom_firebase_config') || '{}');
    } catch (e) {
      return {};
    }
  }

  async loginWithEmail(email, password) {
    if (!email || !password) throw new Error('Please provide email and password.');

    // 1. Try Firebase if connected and configured
    if (this.firebaseAuth) {
      try {
        const cred = await this.firebaseAuth.signInWithEmailAndPassword(email, password);
        const u = cred.user;
        const user = {
          id: u.uid,
          email: u.email,
          name: u.displayName || email.split('@')[0],
          role: 'Workspace Member',
          org: 'WaitingRoom User',
          avatar: (u.displayName || email).substring(0, 2).toUpperCase(),
          authProvider: 'firebase'
        };
        this._setSession(user);
        return { success: true, user };
      } catch (err) {
        // These errors or preset demo profiles fall back seamlessly to local-first auth
        const existing = PRESET_PROFILES.find(p => p.email.toLowerCase() === email.toLowerCase());
        const fallbackCodes = [
          'auth/configuration-not-found',
          'auth/operation-not-allowed',
          'auth/admin-restricted-operation',
          'auth/invalid-credential',
          'auth/user-not-found'
        ];
        if (existing || fallbackCodes.includes(err.code)) {
          console.warn('[Firebase] Sign-in fallback to local mode:', email, err.code);
          // fall through to local auth below
        } else {
          // Real errors (e.g. wrong password for existing user, network, too many requests) — surface to user
          throw new Error(this._friendlyAuthError(err));
        }
      }
    }

    // 2. Local-first authentication
    const existing = PRESET_PROFILES.find(p => p.email.toLowerCase() === email.toLowerCase());
    const user = existing ? { ...existing, authProvider: 'local' } : {
      id: `usr_${Date.now()}`,
      name: email.split('@')[0],
      email,
      role: 'Product Lead',
      org: 'Independent Workspace',
      avatar: email.substring(0, 2).toUpperCase(),
      authProvider: 'local'
    };
    this._setSession(user);
    return { success: true, user };
  }

  async signUpWithEmail(email, password, profileData = {}) {
    if (!email || !password) throw new Error('Please provide email and password.');

    // 1. Try Firebase if connected and configured
    if (this.firebaseAuth) {
      try {
        const cred = await this.firebaseAuth.createUserWithEmailAndPassword(email, password);
        const u = cred.user;
        if (profileData.name && u.updateProfile) {
          await u.updateProfile({ displayName: profileData.name });
        }
        const user = {
          id: u.uid,
          email: u.email,
          name: profileData.name || email.split('@')[0],
          role: profileData.role || 'Member',
          org: profileData.org || 'Local Workspace',
          avatar: (profileData.name || email).substring(0, 2).toUpperCase(),
          authProvider: 'firebase'
        };
        this._setSession(user);
        return { success: true, user };
      } catch (err) {
        // These codes mean Email/Password provider isn't enabled in Firebase Console
        // → fall through to local-first account creation silently
        const fallbackCodes = [
          'auth/configuration-not-found',
          'auth/operation-not-allowed',
          'auth/admin-restricted-operation'
        ];
        if (fallbackCodes.includes(err.code)) {
          console.warn('[Firebase] Email sign-up not enabled in console, using local-first mode:', err.code);
          // fall through to local account creation below
        } else {
          // Real errors (email-already-in-use, weak-password, network) — surface clearly
          throw new Error(this._friendlyAuthError(err));
        }
      }
    }

    // 2. Local-first account creation
    const user = {
      id: `usr_${Date.now()}`,
      email,
      name: profileData.name || email.split('@')[0],
      role: profileData.role || 'Research Architect',
      org: profileData.org || 'Independent Workspace',
      avatar: (profileData.name || email).substring(0, 2).toUpperCase(),
      authProvider: 'local'
    };
    this._setSession(user);
    return { success: true, user };
  }

  async loginWithProfile(profileId) {
    const profile = PRESET_PROFILES.find(p => p.id === profileId) || PRESET_PROFILES[0];
    const user = { ...profile, authProvider: 'profile-switch' };
    this._setSession(user);
    return { success: true, user };
  }


  async loginAsGuest() {
    const user = {
      id: 'usr_guest',
      name: 'Guest Explorer',
      email: 'guest@waitingroom.local',
      role: 'Visitor',
      org: 'Demo Sandbox',
      avatar: 'GE',
      authProvider: 'guest'
    };
    this._setSession(user);
    return { success: true, user };
  }

  /**
   * Translates Firebase Auth error codes into user-friendly messages.
   */
  _friendlyAuthError(err) {
    const map = {
      'auth/user-not-found':        'No account found with that email address.',
      'auth/wrong-password':        'Incorrect password. Please try again.',
      'auth/invalid-credential':    'Invalid email or password.',
      'auth/email-already-in-use':  'An account with this email already exists. Please sign in instead.',
      'auth/weak-password':         'Password must be at least 6 characters.',
      'auth/invalid-email':         'Please enter a valid email address.',
      'auth/too-many-requests':     'Too many failed attempts. Please wait a moment and try again.',
      'auth/network-request-failed':'Network error. Please check your connection.',
      'auth/user-disabled':         'This account has been disabled. Please contact support.'
    };
    return map[err.code] || err.message || 'Authentication failed. Please try again.';
  }

  _setSession(user) {
    this.currentUser = user;
    localStorage.setItem('waitingroom_auth_user', JSON.stringify(user));
    
    // Sync profile to app settings
    if (this.repo) {
      this.repo.setSetting('userName', user.name);
      this.repo.setSetting('userEmail', user.email);
      this.repo.setSetting('userRole', user.role || 'Principal Architect');
      this.repo.setSetting('userOrg', user.org || 'Apex Dynamics');
      this.repo.setSetting('userAvatar', user.avatar || 'LR');
    }

    this._notify();
  }

  logout() {
    if (this.firebaseAuth) {
      try { this.firebaseAuth.signOut(); } catch (e) {}
    }
    this.currentUser = null;
    localStorage.removeItem('waitingroom_auth_user');
    this._notify();
  }
}
