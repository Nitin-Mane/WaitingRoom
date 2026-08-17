/**
 * WaitingRoom Repository
 * Encapsulates transactional queries, score recalculation, and observable change notifications.
 */

import { Database } from './db.js';
import { BlockingScoreEngine } from '../engines/blockingScoreEngine.js';
import { RecommendationEngine } from '../engines/recommendationEngine.js';
import { WaitingStateMachine } from '../core/stateMachine.js';
import { WaitingStatus, TimelineEventType } from '../core/types.js';
import {
  SEED_COUNTERPARTIES,
  SEED_ITEMS,
  SEED_DEPENDENCIES,
  SEED_TIMELINE_EVENTS,
  SEED_SETTINGS
} from './seedData.js';

export class Repository {
  constructor() {
    this.db = new Database();
    this.listeners = new Set();
  }

  async init() {
    await this.db.init();
    await this._seedIfNeeded();
    return this;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  _notify() {
    for (const listener of this.listeners) {
      try {
        listener();
      } catch (err) {
        console.error('Error in repo change listener', err);
      }
    }
  }

  async _seedIfNeeded() {
    const existing = await this.db.getAll('waiting_items');
    if (!existing || existing.length === 0) {
      for (const cp of SEED_COUNTERPARTIES) await this.db.put('counterparties', cp);
      for (const item of SEED_ITEMS) await this.db.put('waiting_items', item);
      for (const dep of SEED_DEPENDENCIES) await this.db.put('dependencies', dep);
      for (const evt of SEED_TIMELINE_EVENTS) await this.db.put('timeline_events', evt);
      for (const set of SEED_SETTINGS) await this.db.put('settings', set);
    }
  }

  // ==================== WAITING ITEMS ====================

  async getAllItems() {
    const rawItems = await this.db.getAll('waiting_items');
    const dependencies = await this.db.getAll('dependencies');
    const settings = await this.getAllSettings();

    return rawItems.map(item => {
      const itemDeps = dependencies.filter(d => d.waitingItemId === item.id);
      const scoreResult = BlockingScoreEngine.calculate(item, itemDeps);
      const recommendation = RecommendationEngine.evaluate(item, settings);
      return {
        ...item,
        blockingScore: scoreResult.score,
        scoreDetails: scoreResult,
        recommendation,
        dependencies: itemDeps
      };
    });
  }

  async getItemById(id) {
    const item = await this.db.get('waiting_items', id);
    if (!item) return null;

    const allDeps = await this.db.getAll('dependencies');
    const itemDeps = allDeps.filter(d => d.waitingItemId === id);
    const settings = await this.getAllSettings();

    const scoreResult = BlockingScoreEngine.calculate(item, itemDeps);
    const recommendation = RecommendationEngine.evaluate(item, settings);

    const allEvents = await this.db.getAll('timeline_events');
    const itemEvents = allEvents
      .filter(e => e.waitingItemId === id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    let counterparty = null;
    if (item.counterpartyId) {
      counterparty = await this.db.get('counterparties', item.counterpartyId);
    }

    return {
      ...item,
      blockingScore: scoreResult.score,
      scoreDetails: scoreResult,
      recommendation,
      dependencies: itemDeps,
      timeline: itemEvents,
      counterparty
    };
  }

  async saveItem(itemData, initialDependencies = []) {
    const now = new Date().toISOString();
    const isNew = !itemData.id;
    const id = itemData.id || `item_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    const item = {
      id,
      title: itemData.title || 'Untitled Waiting Item',
      description: itemData.description || '',
      category: itemData.category || 'OTHER',
      counterpartyId: itemData.counterpartyId || null,
      counterpartyName: itemData.counterpartyName || 'External Entity',
      counterpartyOrg: itemData.counterpartyOrg || '',
      counterpartyEmail: itemData.counterpartyEmail || '',
      status: itemData.status || WaitingStatus.WAITING,
      userPriority: itemData.userPriority !== undefined ? Number(itemData.userPriority) : 3,
      impactLevel: itemData.impactLevel !== undefined ? Number(itemData.impactLevel) : 3,
      monetaryExposure: itemData.monetaryExposure !== undefined ? Number(itemData.monetaryExposure) : 0,
      followUpCount: itemData.followUpCount || 0,
      escalationCount: itemData.escalationCount || 0,
      createdAt: itemData.createdAt || now,
      updatedAt: now,
      requestSentAt: itemData.requestSentAt || now,
      expectedResponseAt: itemData.expectedResponseAt || null,
      hardDeadlineAt: itemData.hardDeadlineAt || null,
      nextReviewAt: itemData.nextReviewAt || null,
      lastFollowUpAt: itemData.lastFollowUpAt || null,
      lastEscalatedAt: itemData.lastEscalatedAt || null,
      resolvedAt: itemData.resolvedAt || null,
      resolutionSummary: itemData.resolutionSummary || '',
      tags: Array.isArray(itemData.tags) ? itemData.tags : (itemData.tags ? itemData.tags.split(',').map(t => t.trim()) : []),
      notes: itemData.notes || '',
      version: (itemData.version || 0) + 1
    };

    await this.db.put('waiting_items', item);

    // Save initial dependencies
    if (initialDependencies && initialDependencies.length > 0) {
      for (const dep of initialDependencies) {
        const depId = dep.id || `dep_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        await this.db.put('dependencies', {
          id: depId,
          waitingItemId: id,
          targetType: dep.targetType || 'TASK',
          targetRef: dep.targetRef || '',
          label: dep.label || 'Downstream Work',
          criticality: dep.criticality || 3
        });
      }
    }

    // Append creation event if new
    if (isNew) {
      await this.appendTimelineEvent({
        waitingItemId: id,
        type: TimelineEventType.CREATED,
        title: `Created waiting item "${item.title}"`,
        note: item.description || 'Initial record created.',
        actor: 'User'
      });
    }

    this._notify();
    return this.getItemById(id);
  }

  async transitionItemStatus(itemId, targetStatus, context = {}) {
    const item = await this.db.get('waiting_items', itemId);
    if (!item) throw new Error(`Item ${itemId} not found`);

    const { updatedItem, event } = WaitingStateMachine.transition(item, targetStatus, context);
    await this.db.put('waiting_items', updatedItem);
    if (event) {
      await this.db.put('timeline_events', event);
    }

    this._notify();
    return this.getItemById(itemId);
  }

  async logFollowUpAction(itemId, context = {}) {
    const item = await this.db.get('waiting_items', itemId);
    if (!item) throw new Error(`Item ${itemId} not found`);

    const { updatedItem, event } = WaitingStateMachine.logFollowUp(item, context);
    await this.db.put('waiting_items', updatedItem);
    if (event) {
      await this.db.put('timeline_events', event);
    }

    this._notify();
    return this.getItemById(itemId);
  }

  async deleteItem(itemId) {
    await this.db.delete('waiting_items', itemId);
    // clean dependencies & events
    const deps = await this.db.getAll('dependencies');
    for (const d of deps) {
      if (d.waitingItemId === itemId) await this.db.delete('dependencies', d.id);
    }
    this._notify();
    return true;
  }

  // ==================== DEPENDENCIES ====================

  async addDependency(waitingItemId, depData) {
    const dep = {
      id: depData.id || `dep_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      waitingItemId,
      targetType: depData.targetType || 'TASK',
      targetRef: depData.targetRef || '',
      label: depData.label || 'Blocked Deliverable',
      criticality: Number(depData.criticality || 3)
    };
    await this.db.put('dependencies', dep);
    this._notify();
    return dep;
  }

  async removeDependency(depId) {
    await this.db.delete('dependencies', depId);
    this._notify();
    return true;
  }

  // ==================== TIMELINE EVENTS ====================

  async appendTimelineEvent(eventData) {
    const now = new Date().toISOString();
    const event = {
      id: eventData.id || `evt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      waitingItemId: eventData.waitingItemId,
      type: eventData.type || TimelineEventType.NOTE_ADDED,
      title: eventData.title || 'Timeline Note Added',
      note: eventData.note || '',
      actor: eventData.actor || 'User',
      createdAt: eventData.createdAt || now,
      metadata: eventData.metadata || {}
    };
    await this.db.put('timeline_events', event);
    this._notify();
    return event;
  }

  async getAllTimelineEvents() {
    const events = await this.db.getAll('timeline_events');
    return events.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // ==================== COUNTERPARTIES ====================

  async getAllCounterparties() {
    const cps = await this.db.getAll('counterparties');
    const items = await this.db.getAll('waiting_items');

    return cps.map(cp => {
      const cpItems = items.filter(i => i.counterpartyId === cp.id || i.counterpartyName === cp.name);
      const activeCount = cpItems.filter(i => i.status !== WaitingStatus.RESOLVED && i.status !== WaitingStatus.CANCELLED).length;
      const resolvedCount = cpItems.filter(i => i.status === WaitingStatus.RESOLVED).length;
      return {
        ...cp,
        activeCount,
        resolvedCount,
        totalItems: cpItems.length
      };
    });
  }

  async getCounterpartyById(id) {
    const cp = await this.db.get('counterparties', id);
    if (!cp) return null;
    const allItems = await this.getAllItems();
    const items = allItems.filter(i => i.counterpartyId === id || i.counterpartyName === cp.name);
    return { ...cp, items };
  }

  async saveCounterparty(cpData) {
    const id = cpData.id || `cp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const cp = {
      id,
      name: cpData.name,
      title: cpData.title || '',
      organization: cpData.organization || '',
      email: cpData.email || '',
      phone: cpData.phone || '',
      channelPreference: cpData.channelPreference || 'Email',
      averageResponseDays: Number(cpData.averageResponseDays || 3.0),
      totalInteractions: Number(cpData.totalInteractions || 0),
      notes: cpData.notes || ''
    };
    await this.db.put('counterparties', cp);
    this._notify();
    return cp;
  }

  // ==================== SETTINGS ====================

  async getAllSettings() {
    const list = await this.db.getAll('settings');
    const obj = {};
    for (const item of list) obj[item.key] = item.value;
    return obj;
  }

  async setSetting(key, value) {
    await this.db.put('settings', { key, value });
    this._notify();
    return value;
  }

  // ==================== AGGREGATED METRICS ====================

  async getDashboardMetrics() {
    const items = await this.getAllItems();
    const active = items.filter(i => i.status !== WaitingStatus.RESOLVED && i.status !== WaitingStatus.CANCELLED);
    const resolved = items.filter(i => i.status === WaitingStatus.RESOLVED);

    const urgent = active.filter(i => i.recommendation.action === 'FOLLOW_UP' || i.recommendation.action === 'ESCALATE' || i.blockingScore >= 70);
    const highImpact = active.filter(i => i.blockingScore >= 70).sort((a, b) => b.blockingScore - a.blockingScore);

    // Distribution
    const bands = { critical: 0, high: 0, important: 0, watch: 0, low: 0 };
    active.forEach(i => {
      const b = (i.scoreDetails.band || 'LOW').toLowerCase();
      if (bands[b] !== undefined) bands[b]++;
    });

    return {
      totalActive: active.length,
      urgentCount: urgent.length,
      resolvedCount: resolved.length,
      totalCount: items.length,
      highImpactCount: highImpact.length,
      bands,
      urgentItems: urgent.slice(0, 5),
      highImpactItems: highImpact.slice(0, 5),
      recentResolved: resolved.slice(0, 5)
    };
  }
}
