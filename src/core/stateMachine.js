/**
 * State Machine and Validation Engine for WaitingRoom Items
 */

import { WaitingStatus, TimelineEventType } from './types.js';

export class StateTransitionError extends Error {
  constructor(fromStatus, toStatus, reason) {
    super(`Cannot transition from ${fromStatus} to ${toStatus}: ${reason}`);
    this.name = 'StateTransitionError';
    this.fromStatus = fromStatus;
    this.toStatus = toStatus;
  }
}

export class WaitingStateMachine {
  /**
   * Validates whether a state transition is legal and creates corresponding timeline event
   * @param {Object} item - Current waiting item
   * @param {string} targetStatus - Target WaitingStatus
   * @param {Object} context - Transition parameters (reason, timestamp, metadata)
   * @returns {Object} { updatedItem, event }
   */
  static transition(item, targetStatus, context = {}) {
    const current = item.status || WaitingStatus.DRAFT;
    const now = context.timestamp || new Date().toISOString();
    const reason = context.reason || '';

    if (current === targetStatus) {
      return { updatedItem: { ...item }, event: null };
    }

    const updatedItem = {
      ...item,
      status: targetStatus,
      updatedAt: now,
      version: (item.version || 1) + 1
    };

    let eventType = TimelineEventType.NOTE_ADDED;
    let eventSummary = `Status updated to ${targetStatus}`;

    switch (targetStatus) {
      case WaitingStatus.WAITING:
        if (current === WaitingStatus.DRAFT) {
          if (!item.requestSentAt && !context.requestSentAt) {
            updatedItem.requestSentAt = now;
          }
          eventType = TimelineEventType.REQUEST_SENT;
          eventSummary = context.summary || `Request sent to ${item.counterpartyName || 'counterparty'}. Started waiting.`;
        } else if (current === WaitingStatus.RESPONDED) {
          eventType = TimelineEventType.NOTE_ADDED;
          eventSummary = reason ? `Additional action required: ${reason}` : 'Response required further follow-up. Returned to waiting.';
        } else if (current === WaitingStatus.RESOLVED) {
          if (!reason) {
            throw new StateTransitionError(current, targetStatus, 'Reopening a resolved item requires an explicit reason.');
          }
          eventType = TimelineEventType.REOPENED;
          eventSummary = `Reopened: ${reason}`;
          updatedItem.resolvedAt = null;
        } else if (current === WaitingStatus.SNOOZED) {
          eventType = TimelineEventType.NOTE_ADDED;
          eventSummary = 'Snooze window ended or manually resumed.';
        }
        break;

      case WaitingStatus.SNOOZED:
        if (current !== WaitingStatus.WAITING && current !== WaitingStatus.ESCALATED) {
          throw new StateTransitionError(current, targetStatus, 'Only active WAITING or ESCALATED items can be snoozed.');
        }
        if (!context.snoozeUntil && !updatedItem.nextReviewAt) {
          throw new StateTransitionError(current, targetStatus, 'Snoozing requires a future review timestamp.');
        }
        if (context.snoozeUntil) {
          updatedItem.nextReviewAt = context.snoozeUntil;
        }
        eventType = TimelineEventType.SNOOZED;
        eventSummary = `Snoozed until ${new Date(updatedItem.nextReviewAt).toLocaleDateString()}. ${reason ? `Reason: ${reason}` : ''}`;
        break;

      case WaitingStatus.ESCALATED:
        if (current !== WaitingStatus.WAITING && current !== WaitingStatus.SNOOZED) {
          throw new StateTransitionError(current, targetStatus, 'Only pending items can be escalated.');
        }
        updatedItem.escalationCount = (item.escalationCount || 0) + 1;
        updatedItem.lastEscalatedAt = now;
        eventType = TimelineEventType.ESCALATION;
        eventSummary = `Escalation #${updatedItem.escalationCount}: ${context.ladderLevel ? `[${context.ladderLevel}] ` : ''}${reason || 'Formal follow-up escalated'}`;
        break;

      case WaitingStatus.RESPONDED:
        if (current !== WaitingStatus.WAITING && current !== WaitingStatus.ESCALATED && current !== WaitingStatus.SNOOZED) {
          throw new StateTransitionError(current, targetStatus, 'Cannot record response on an inactive item.');
        }
        updatedItem.lastResponseAt = now;
        eventType = TimelineEventType.RESPONSE_RECEIVED;
        eventSummary = context.summary || `Received response from ${item.counterpartyName || 'counterparty'}. ${reason ? `Summary: ${reason}` : ''}`;
        break;

      case WaitingStatus.RESOLVED:
        if (current === WaitingStatus.CANCELLED) {
          throw new StateTransitionError(current, targetStatus, 'Cancelled items must be reactivated before resolving.');
        }
        updatedItem.resolvedAt = now;
        updatedItem.resolutionSummary = reason || context.resolutionSummary || 'Completed and unblocked.';
        eventType = TimelineEventType.RESOLVED;
        eventSummary = `Resolved: ${updatedItem.resolutionSummary}`;
        break;

      case WaitingStatus.CANCELLED:
        if (current === WaitingStatus.RESOLVED) {
          throw new StateTransitionError(current, targetStatus, 'Resolved items cannot be cancelled; reopen first.');
        }
        eventType = TimelineEventType.CANCELLED;
        eventSummary = `Cancelled: ${reason || 'Dependency no longer needed.'}`;
        break;

      default:
        throw new StateTransitionError(current, targetStatus, 'Unrecognized target state.');
    }

    const event = {
      id: context.eventId || `evt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      waitingItemId: item.id,
      type: eventType,
      title: eventSummary,
      note: context.note || '',
      actor: context.actor || 'User',
      createdAt: now,
      metadata: context.metadata || {}
    };

    return { updatedItem, event };
  }

  /**
   * Log a follow-up action without necessarily changing status
   */
  static logFollowUp(item, context = {}) {
    const now = context.timestamp || new Date().toISOString();
    const count = (item.followUpCount || 0) + 1;
    const nextReviewAt = context.nextReviewAt || null;

    const updatedItem = {
      ...item,
      followUpCount: count,
      lastFollowUpAt: now,
      nextReviewAt: nextReviewAt || item.nextReviewAt,
      updatedAt: now,
      version: (item.version || 1) + 1
    };

    const event = {
      id: context.eventId || `evt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      waitingItemId: item.id,
      type: TimelineEventType.FOLLOW_UP_LOGGED,
      title: `Follow-up #${count} logged via ${context.channel || 'Email'}`,
      note: context.message || context.note || '',
      actor: 'User',
      createdAt: now,
      metadata: {
        channel: context.channel || 'Email',
        templateUsed: context.templateUsed || 'Custom',
        recipient: context.recipient || item.counterpartyEmail || item.counterpartyName
      }
    };

    return { updatedItem, event };
  }
}
