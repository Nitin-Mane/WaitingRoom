/**
 * Local-First IndexedDB Storage Engine for WaitingRoom
 * Provides transactional persistence with fallback to localStorage.
 */

const DB_NAME = 'WaitingRoomDB';
const DB_VERSION = 1;

export class Database {
  constructor() {
    this.db = null;
    this.useLocalStorage = false;
    this.memoryFallback = {
      waiting_items: new Map(),
      counterparties: new Map(),
      dependencies: new Map(),
      timeline_events: new Map(),
      settings: new Map()
    };
  }

  async init() {
    if (typeof indexedDB === 'undefined') {
      console.warn('IndexedDB not supported, falling back to local memory/localStorage');
      this.useLocalStorage = true;
      this._loadLocalStorageFallback();
      return this;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // 1. Waiting Items Store
        if (!db.objectStoreNames.contains('waiting_items')) {
          const itemStore = db.createObjectStore('waiting_items', { keyPath: 'id' });
          itemStore.createIndex('status', 'status', { unique: false });
          itemStore.createIndex('category', 'category', { unique: false });
          itemStore.createIndex('counterpartyId', 'counterpartyId', { unique: false });
          itemStore.createIndex('expectedResponseAt', 'expectedResponseAt', { unique: false });
          itemStore.createIndex('hardDeadlineAt', 'hardDeadlineAt', { unique: false });
          itemStore.createIndex('blockingScore', 'blockingScore', { unique: false });
          itemStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // 2. Counterparties Store
        if (!db.objectStoreNames.contains('counterparties')) {
          const cpStore = db.createObjectStore('counterparties', { keyPath: 'id' });
          cpStore.createIndex('name', 'name', { unique: false });
          cpStore.createIndex('organization', 'organization', { unique: false });
          cpStore.createIndex('email', 'email', { unique: false });
        }

        // 3. Dependencies Store
        if (!db.objectStoreNames.contains('dependencies')) {
          const depStore = db.createObjectStore('dependencies', { keyPath: 'id' });
          depStore.createIndex('waitingItemId', 'waitingItemId', { unique: false });
        }

        // 4. Timeline Events Store
        if (!db.objectStoreNames.contains('timeline_events')) {
          const eventStore = db.createObjectStore('timeline_events', { keyPath: 'id' });
          eventStore.createIndex('waitingItemId', 'waitingItemId', { unique: false });
          eventStore.createIndex('type', 'type', { unique: false });
          eventStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // 5. Settings Store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this);
      };

      request.onerror = (event) => {
        console.error('IndexedDB open failed, fallback activated', event.target.error);
        this.useLocalStorage = true;
        this._loadLocalStorageFallback();
        resolve(this);
      };
    });
  }

  _loadLocalStorageFallback() {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem('waitingroom_fallback_store');
        if (saved) {
          const parsed = JSON.parse(saved);
          Object.keys(parsed).forEach(storeName => {
            if (this.memoryFallback[storeName]) {
              parsed[storeName].forEach(item => {
                const key = item.id || item.key;
                if (key) this.memoryFallback[storeName].set(key, item);
              });
            }
          });
        }
      }
    } catch (e) {
      console.warn('Could not read localStorage fallback', e);
    }
  }

  _persistLocalStorageFallback() {
    try {
      if (typeof localStorage !== 'undefined') {
        const payload = {};
        Object.keys(this.memoryFallback).forEach(storeName => {
          payload[storeName] = Array.from(this.memoryFallback[storeName].values());
        });
        localStorage.setItem('waitingroom_fallback_store', JSON.stringify(payload));
      }
    } catch (e) {
      console.warn('Could not persist to localStorage', e);
    }
  }

  async put(storeName, item) {
    if (this.useLocalStorage || !this.db) {
      const key = item.id || item.key;
      this.memoryFallback[storeName].set(key, item);
      this._persistLocalStorageFallback();
      return item;
    }

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([storeName], 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.put(item);
      req.onsuccess = () => resolve(item);
      req.onerror = (e) => reject(e.target.error);
    });
  }

  async get(storeName, key) {
    if (this.useLocalStorage || !this.db) {
      return this.memoryFallback[storeName].get(key) || null;
    }

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([storeName], 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = (e) => reject(e.target.error);
    });
  }

  async getAll(storeName) {
    if (this.useLocalStorage || !this.db) {
      return Array.from(this.memoryFallback[storeName].values());
    }

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([storeName], 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = (e) => reject(e.target.error);
    });
  }

  async delete(storeName, key) {
    if (this.useLocalStorage || !this.db) {
      this.memoryFallback[storeName].delete(key);
      this._persistLocalStorageFallback();
      return true;
    }

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([storeName], 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.delete(key);
      req.onsuccess = () => resolve(true);
      req.onerror = (e) => reject(e.target.error);
    });
  }

  async clear(storeName) {
    if (this.useLocalStorage || !this.db) {
      this.memoryFallback[storeName].clear();
      this._persistLocalStorageFallback();
      return true;
    }

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([storeName], 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.clear();
      req.onsuccess = () => resolve(true);
      req.onerror = (e) => reject(e.target.error);
    });
  }
}
