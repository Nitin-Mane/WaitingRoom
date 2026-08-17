/**
 * WaitingRoom Domain Types & Constants
 * Baseline Version: 1.0.0
 */

export const WaitingStatus = Object.freeze({
  DRAFT: 'DRAFT',
  WAITING: 'WAITING',
  SNOOZED: 'SNOOZED',
  ESCALATED: 'ESCALATED',
  RESPONDED: 'RESPONDED',
  RESOLVED: 'RESOLVED',
  CANCELLED: 'CANCELLED'
});

export const RecommendedAction = Object.freeze({
  WAIT: 'WAIT',
  FOLLOW_UP: 'FOLLOW_UP',
  ESCALATE: 'ESCALATE',
  REVIEW: 'REVIEW',
  SNOOZE: 'SNOOZE',
  CLOSE: 'CLOSE'
});

export const ConfidenceLevel = Object.freeze({
  RULE_STRONG: 'RULE_STRONG',
  RULE_MEDIUM: 'RULE_MEDIUM',
  USER_REVIEW: 'USER_REVIEW'
});

export const ItemCategory = Object.freeze({
  RECRUITER: 'RECRUITER',
  ACADEMIC: 'ACADEMIC',
  APPROVAL: 'APPROVAL',
  REIMBURSEMENT: 'REIMBURSEMENT',
  DELIVERY: 'DELIVERY',
  CODE_REVIEW: 'CODE_REVIEW',
  GOVERNMENT: 'GOVERNMENT',
  PROCUREMENT: 'PROCUREMENT',
  COLLABORATOR: 'COLLABORATOR',
  OTHER: 'OTHER'
});

export const CategoryLabels = Object.freeze({
  [ItemCategory.RECRUITER]: 'Recruiter / Job',
  [ItemCategory.ACADEMIC]: 'Academic & Research',
  [ItemCategory.APPROVAL]: 'Document & Approval',
  [ItemCategory.REIMBURSEMENT]: 'Reimbursement & Invoice',
  [ItemCategory.DELIVERY]: 'Delivery & Hardware',
  [ItemCategory.CODE_REVIEW]: 'Code Review & PR',
  [ItemCategory.GOVERNMENT]: 'Government / Institutional',
  [ItemCategory.PROCUREMENT]: 'Procurement & Vendor',
  [ItemCategory.COLLABORATOR]: 'Collaborator & Team',
  [ItemCategory.OTHER]: 'General Dependency'
});

export const DependencyTargetType = Object.freeze({
  TASK: 'TASK',
  PROJECT: 'PROJECT',
  MILESTONE: 'MILESTONE',
  DECISION: 'DECISION',
  DOCUMENT: 'DOCUMENT',
  OTHER: 'OTHER'
});

export const TimelineEventType = Object.freeze({
  CREATED: 'CREATED',
  REQUEST_SENT: 'REQUEST_SENT',
  NOTE_ADDED: 'NOTE_ADDED',
  FOLLOW_UP_LOGGED: 'FOLLOW_UP_LOGGED',
  REMINDER_FIRED: 'REMINDER_FIRED',
  ESCALATION: 'ESCALATION',
  RESPONSE_RECEIVED: 'RESPONSE_RECEIVED',
  SNOOZED: 'SNOOZED',
  RESOLVED: 'RESOLVED',
  REOPENED: 'REOPENED',
  CANCELLED: 'CANCELLED',
  IMPORT: 'IMPORT'
});

export const EscalationLevel = Object.freeze({
  LEVEL_1_GENTLE: { level: 1, name: 'Gentle Nudge', channel: 'Same Channel' },
  LEVEL_2_DIRECT: { level: 2, name: 'Direct Follow-up', channel: 'Email / Direct Message' },
  LEVEL_3_SUPERVISOR: { level: 3, name: 'Lead / Supervisor Escalation', channel: 'Manager / CC' },
  LEVEL_4_HIGH_PRIORITY: { level: 4, name: 'In-Person / Phone Call', channel: 'Direct Urgent Contact' }
});

export const CategoryDefaults = Object.freeze({
  [ItemCategory.RECRUITER]: { initialReviewDays: 4, followUpIntervalDays: 5, maxFollowUpsBeforeEscalation: 2 },
  [ItemCategory.ACADEMIC]: { initialReviewDays: 5, followUpIntervalDays: 5, maxFollowUpsBeforeEscalation: 2 },
  [ItemCategory.REIMBURSEMENT]: { initialReviewDays: 7, followUpIntervalDays: 7, maxFollowUpsBeforeEscalation: 2 },
  [ItemCategory.APPROVAL]: { initialReviewDays: 4, followUpIntervalDays: 3, maxFollowUpsBeforeEscalation: 2 },
  [ItemCategory.DELIVERY]: { initialReviewDays: 1, followUpIntervalDays: 1, maxFollowUpsBeforeEscalation: 3 },
  [ItemCategory.CODE_REVIEW]: { initialReviewDays: 1, followUpIntervalDays: 1, maxFollowUpsBeforeEscalation: 2 },
  [ItemCategory.GOVERNMENT]: { initialReviewDays: 10, followUpIntervalDays: 7, maxFollowUpsBeforeEscalation: 1 },
  [ItemCategory.PROCUREMENT]: { initialReviewDays: 5, followUpIntervalDays: 4, maxFollowUpsBeforeEscalation: 2 },
  [ItemCategory.COLLABORATOR]: { initialReviewDays: 3, followUpIntervalDays: 3, maxFollowUpsBeforeEscalation: 2 },
  [ItemCategory.OTHER]: { initialReviewDays: 5, followUpIntervalDays: 5, maxFollowUpsBeforeEscalation: 2 }
});
