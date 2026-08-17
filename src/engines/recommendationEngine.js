/**
 * Follow-up Recommendation Engine
 * Recommends actionable next steps based on SLAs, follow-up counts, and deadlines.
 */

import { RecommendedAction, ConfidenceLevel, WaitingStatus, CategoryDefaults, ItemCategory } from '../core/types.js';
import { BusinessCalendar } from './businessCalendar.js';

export const RECOMMENDATION_POLICY_VERSION = 'followup-v1';

export class RecommendationEngine {
  /**
   * Generates next action recommendation for an item
   * @param {Object} item - WaitingItem
   * @param {Object} [settings] - User cadence settings
   * @param {Date} [now] - Current timestamp
   * @returns {Object} Recommendation { action, recommendedAt, confidence, rationale, policyVersion }
   */
  static evaluate(item, settings = {}, now = new Date()) {
    const nowDate = new Date(now);
    const status = item.status || WaitingStatus.WAITING;
    const catConfig = CategoryDefaults[item.category] || CategoryDefaults[ItemCategory.OTHER];
    
    const maxFollowUps = item.maxFollowUps || settings.maxFollowUps || catConfig.maxFollowUpsBeforeEscalation || 2;
    const followUpIntervalDays = item.followUpIntervalDays || settings.followUpIntervalDays || catConfig.followUpIntervalDays || 4;
    const followUpCount = item.followUpCount || 0;

    // 1. Closed/Resolved/Cancelled items
    if (status === WaitingStatus.RESOLVED || status === WaitingStatus.CANCELLED) {
      return {
        action: RecommendedAction.CLOSE,
        recommendedAt: null,
        confidence: ConfidenceLevel.RULE_STRONG,
        rationale: ['Dependency is completed or cancelled. No active follow-up required.'],
        policyVersion: RECOMMENDATION_POLICY_VERSION
      };
    }

    // 2. Draft items
    if (status === WaitingStatus.DRAFT) {
      return {
        action: RecommendedAction.REVIEW,
        recommendedAt: nowDate.toISOString(),
        confidence: ConfidenceLevel.RULE_STRONG,
        rationale: ['Item is in DRAFT. Review details and send initial request to activate tracking.'],
        policyVersion: RECOMMENDATION_POLICY_VERSION
      };
    }

    // 3. Responded items requiring triage
    if (status === WaitingStatus.RESPONDED) {
      return {
        action: RecommendedAction.REVIEW,
        recommendedAt: nowDate.toISOString(),
        confidence: ConfidenceLevel.RULE_STRONG,
        rationale: ['Counterparty responded. Review if deliverable is satisfied or if further action is needed.'],
        policyVersion: RECOMMENDATION_POLICY_VERSION
      };
    }

    // 4. Actively Snoozed
    if (status === WaitingStatus.SNOOZED && item.nextReviewAt) {
      const reviewDate = new Date(item.nextReviewAt);
      if (reviewDate > nowDate) {
        return {
          action: RecommendedAction.WAIT,
          recommendedAt: item.nextReviewAt,
          confidence: ConfidenceLevel.RULE_STRONG,
          rationale: [`Snoozed until ${reviewDate.toLocaleDateString()}. Cooldown active.`],
          policyVersion: RECOMMENDATION_POLICY_VERSION
        };
      }
    }

    // 5. Hard deadline breached or imminent (< 24 hrs)
    if (item.hardDeadlineAt) {
      const deadlineDate = new Date(item.hardDeadlineAt);
      const diffMs = deadlineDate.getTime() - nowDate.getTime();
      const hoursLeft = diffMs / (1000 * 60 * 60);

      if (hoursLeft <= 0) {
        return {
          action: RecommendedAction.ESCALATE,
          recommendedAt: nowDate.toISOString(),
          confidence: ConfidenceLevel.RULE_STRONG,
          rationale: [
            `Hard deadline was breached on ${deadlineDate.toLocaleDateString()}.`,
            'Immediate escalation or alternate resolution channel recommended.'
          ],
          policyVersion: RECOMMENDATION_POLICY_VERSION
        };
      }
    }

    // 6. Expected response SLA analysis
    const requestDate = item.lastFollowUpAt 
      ? new Date(item.lastFollowUpAt) 
      : (item.requestSentAt ? new Date(item.requestSentAt) : new Date(item.createdAt || nowDate));

    const expectedDate = item.expectedResponseAt 
      ? new Date(item.expectedResponseAt) 
      : BusinessCalendar.addBusinessDays(requestDate, catConfig.initialReviewDays);

    const isOverdue = nowDate >= expectedDate;

    // Check cadence since last follow-up
    if (item.lastFollowUpAt) {
      const lastFollowUpDate = new Date(item.lastFollowUpAt);
      const daysSinceFollowUp = (nowDate.getTime() - lastFollowUpDate.getTime()) / (1000 * 60 * 60 * 24);

      if (daysSinceFollowUp < followUpIntervalDays) {
        const nextAllowedDate = BusinessCalendar.addBusinessDays(lastFollowUpDate, followUpIntervalDays);
        return {
          action: RecommendedAction.WAIT,
          recommendedAt: nextAllowedDate.toISOString(),
          confidence: ConfidenceLevel.RULE_MEDIUM,
          rationale: [
            `Follow-up #${followUpCount} sent on ${lastFollowUpDate.toLocaleDateString()}.`,
            `Respecting ${followUpIntervalDays}-day cooldown to avoid overwhelming counterparty.`,
            `Next review suggested on ${nextAllowedDate.toLocaleDateString()}.`
          ],
          policyVersion: RECOMMENDATION_POLICY_VERSION
        };
      }
    }

    // If expected response SLA is breached
    if (isOverdue) {
      if (followUpCount >= maxFollowUps) {
        return {
          action: RecommendedAction.ESCALATE,
          recommendedAt: nowDate.toISOString(),
          confidence: ConfidenceLevel.RULE_STRONG,
          rationale: [
            `Expected SLA elapsed and ${followUpCount} standard follow-ups yielded no response.`,
            'Recommend escalating to a secondary channel, supervisor, or direct contact.'
          ],
          policyVersion: RECOMMENDATION_POLICY_VERSION
        };
      }

      return {
        action: RecommendedAction.FOLLOW_UP,
        recommendedAt: nowDate.toISOString(),
        confidence: ConfidenceLevel.RULE_STRONG,
        rationale: [
          `Expected response window ended on ${expectedDate.toLocaleDateString()}.`,
          `Send follow-up reminder #${followUpCount + 1}.`
        ],
        policyVersion: RECOMMENDATION_POLICY_VERSION
      };
    }

    // 7. Normal waiting state within expected window
    return {
      action: RecommendedAction.WAIT,
      recommendedAt: expectedDate.toISOString(),
      confidence: ConfidenceLevel.RULE_STRONG,
      rationale: [
        'Within acceptable SLA response window.',
        `Target review date: ${expectedDate.toLocaleDateString()}.`
      ],
      policyVersion: RECOMMENDATION_POLICY_VERSION
    };
  }
}
