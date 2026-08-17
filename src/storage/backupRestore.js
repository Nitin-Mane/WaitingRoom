/**
 * Backup and Restore Engine for WaitingRoom
 * Produces structured, verified local backup snapshots with schema validation.
 */

export class BackupRestoreEngine {
  /**
   * Creates a complete backup snapshot object
   * @param {Object} repository 
   * @returns {Object} Backup bundle
   */
  static async createBackup(repository) {
    const rawItems = await repository.db.getAll('waiting_items');
    const counterparties = await repository.db.getAll('counterparties');
    const dependencies = await repository.db.getAll('dependencies');
    const timeline_events = await repository.db.getAll('timeline_events');
    const settings = await repository.db.getAll('settings');

    const backup = {
      app: 'WaitingRoom',
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      recordCounts: {
        waiting_items: rawItems.length,
        counterparties: counterparties.length,
        dependencies: dependencies.length,
        timeline_events: timeline_events.length,
        settings: settings.length
      },
      data: {
        waiting_items: rawItems,
        counterparties,
        dependencies,
        timeline_events,
        settings
      }
    };

    return backup;
  }

  /**
   * Validates a candidate backup bundle
   * @param {Object} bundle 
   * @returns {Object} { valid: boolean, errors: string[], summary: string }
   */
  static validateBackup(bundle) {
    const errors = [];
    if (!bundle || typeof bundle !== 'object') {
      return { valid: false, errors: ['Backup payload is empty or not valid JSON.'], summary: 'Invalid format' };
    }
    if (bundle.app !== 'WaitingRoom') {
      errors.push('Backup bundle does not match WaitingRoom signature.');
    }
    if (!bundle.data || typeof bundle.data !== 'object') {
      errors.push('Backup is missing core data segment.');
    } else {
      if (!Array.isArray(bundle.data.waiting_items)) errors.push('Missing waiting_items array.');
      if (!Array.isArray(bundle.data.counterparties)) errors.push('Missing counterparties array.');
      if (!Array.isArray(bundle.data.dependencies)) errors.push('Missing dependencies array.');
      if (!Array.isArray(bundle.data.timeline_events)) errors.push('Missing timeline_events array.');
    }

    return {
      valid: errors.length === 0,
      errors,
      summary: errors.length === 0 
        ? `Valid snapshot containing ${bundle.data.waiting_items.length} items, ${bundle.data.counterparties.length} contacts, and ${bundle.data.timeline_events.length} events.`
        : `Validation failed with ${errors.length} issues.`
    };
  }

  /**
   * Restores a backup bundle into the database
   * @param {Object} repository 
   * @param {Object} bundle 
   * @param {boolean} [overwrite=true] 
   */
  static async restoreBackup(repository, bundle, overwrite = true) {
    const validation = this.validateBackup(bundle);
    if (!validation.valid) {
      throw new Error(`Cannot restore invalid backup: ${validation.errors.join('; ')}`);
    }

    if (overwrite) {
      await repository.db.clear('waiting_items');
      await repository.db.clear('counterparties');
      await repository.db.clear('dependencies');
      await repository.db.clear('timeline_events');
      await repository.db.clear('settings');
    }

    for (const item of bundle.data.waiting_items) await repository.db.put('waiting_items', item);
    for (const cp of bundle.data.counterparties) await repository.db.put('counterparties', cp);
    for (const dep of bundle.data.dependencies) await repository.db.put('dependencies', dep);
    for (const evt of bundle.data.timeline_events) await repository.db.put('timeline_events', evt);
    if (bundle.data.settings) {
      for (const set of bundle.data.settings) await repository.db.put('settings', set);
    }

    repository._notify();
    return {
      success: true,
      restoredItems: bundle.data.waiting_items.length,
      restoredContacts: bundle.data.counterparties.length,
      restoredEvents: bundle.data.timeline_events.length
    };
  }
}
