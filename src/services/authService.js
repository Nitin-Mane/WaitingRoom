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
        await this.initFirebase(config);
        // Persist the auto-loaded config so subsequent refreshes are consistent
        if (!rawConfig) {
          localStorage.setItem('waitingroom_firebase_config', JSON.stringify(config));
        }
      } catch (e) {
        console.warn('Firebase auto-initialization failed', e);
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
    if (typeof window !== 'undefined' && window.firebase && config && config.apiKey) {
      try {
        if (!window.firebase.apps.length) {
          this.firebaseApp = window.firebase.initializeApp(config);
        } else {
          this.firebaseApp = window.firebase.app();
        }
        this.firebaseAuth = window.firebase.auth();

        // Initialize Analytics when measurementId is available
        if (config.measurementId && window.firebase.analytics) {
          try {
            this.firebaseAnalytics = window.firebase.analytics();
            console.info('[Firebase] Analytics initialized:', config.measurementId);
          } catch (analyticsErr) {
            console.warn('[Firebase] Analytics init skipped:', analyticsErr.message);
          }
        }

        console.info('[Firebase] Connected to project:', config.projectId);
        return true;
      } catch (err) {
        console.error('Firebase init error', err);
        return false;
      }
    }
    return false;
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
    // 1. Try Firebase if connected
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
        // Return explicit error or fallback
        throw err;
      }
    }

    // 2. Local-first simulation
    if (!email || !password) throw new Error('Please provide email and password.');
    
    // Check if matches known profile
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
    // 1. Try Firebase if connected
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
        throw err;
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
