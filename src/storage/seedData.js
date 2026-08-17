/**
 * Initial Seed Data for WaitingRoom
 * Provides rich, realistic dependencies, counterparties, and timeline histories.
 */

import { WaitingStatus, ItemCategory, TimelineEventType, DependencyTargetType } from '../core/types.js';

export const SEED_COUNTERPARTIES = [
  {
    id: 'cp_sarah_jenkins',
    name: 'Sarah Jenkins',
    title: 'Senior Technical Recruiter',
    organization: 'Apex Dynamics',
    email: 'sarah.jenkins@apexdynamics.io',
    phone: '+1 (555) 234-5678',
    channelPreference: 'Email / LinkedIn',
    averageResponseDays: 3.2,
    totalInteractions: 14,
    notes: 'Primary contact for Principal Staff System Architect role. Prefers morning emails.'
  },
  {
    id: 'cp_registrar',
    name: 'Office of the Registrar',
    title: 'Academic Records Dept.',
    organization: 'Imperial Institute of Technology',
    email: 'records-verification@imperial.ac.edu',
    phone: '+1 (555) 890-1234',
    channelPreference: 'Official Portal / Email',
    averageResponseDays: 7.5,
    totalInteractions: 8,
    notes: 'Handles degree attestation, transcripts, and provisional certificates.'
  },
  {
    id: 'cp_prof_vance',
    name: 'Prof. Marcus Vance',
    title: 'Head of High-Performance Systems Lab',
    organization: 'IIT Computational Lab',
    email: 'm.vance@computelab.org',
    phone: '+1 (555) 443-9821',
    channelPreference: 'Slack #hpc-lab / Email',
    averageResponseDays: 4.8,
    totalInteractions: 22,
    notes: 'Cluster grant approver. Usually reviews batch requests on Thursdays.'
  },
  {
    id: 'cp_finance_team',
    name: 'Finance & Reimbursements',
    title: 'Accounts Payable',
    organization: 'Apex Dynamics HQ',
    email: 'reimbursements@apexdynamics.io',
    phone: '+1 (555) 777-8899',
    channelPreference: 'Expensify / Finance Portal',
    averageResponseDays: 6.0,
    totalInteractions: 6,
    notes: 'Processing cycle runs bi-weekly on alternate Tuesdays.'
  },
  {
    id: 'cp_dave_chen',
    name: 'Dave Chen',
    title: 'Staff Architect & Core Reviewer',
    organization: 'Kernel Core Systems',
    email: 'dave.chen@kernelcore.dev',
    phone: '+1 (555) 123-9988',
    channelPreference: 'GitHub PR / Discord',
    averageResponseDays: 1.5,
    totalInteractions: 35,
    notes: 'Reviews performance-critical code changes and concurrency PRs.'
  }
];

export const SEED_ITEMS = [
  {
    id: 'item_sarah_interview',
    title: 'Staff Architect Interview Decision & Offer Framework',
    description: 'Awaiting formal feedback and compensation breakdown following final panel review on Distributed Systems.',
    category: ItemCategory.RECRUITER,
    counterpartyId: 'cp_sarah_jenkins',
    counterpartyName: 'Sarah Jenkins',
    counterpartyOrg: 'Apex Dynamics',
    counterpartyEmail: 'sarah.jenkins@apexdynamics.io',
    status: WaitingStatus.WAITING,
    userPriority: 5,
    impactLevel: 5,
    monetaryExposure: 5,
    followUpCount: 1,
    escalationCount: 0,
    createdAt: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
    requestSentAt: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
    expectedResponseAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    hardDeadlineAt: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
    lastFollowUpAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    nextReviewAt: new Date().toISOString(),
    resolvedAt: null,
    tags: ['career', 'interviews', 'priority-p0'],
    notes: 'Recruiter stated hiring committee met Monday. Followed up on Wednesday.'
  },
  {
    id: 'item_gpu_cluster',
    title: 'GPU Cluster Access Grant (8x H100 Node Allocation)',
    description: 'Grant allocation request for distributed deep learning benchmark on transformer inference.',
    category: ItemCategory.APPROVAL,
    counterpartyId: 'cp_prof_vance',
    counterpartyName: 'Prof. Marcus Vance',
    counterpartyOrg: 'IIT Computational Lab',
    counterpartyEmail: 'm.vance@computelab.org',
    status: WaitingStatus.ESCALATED,
    userPriority: 5,
    impactLevel: 4,
    monetaryExposure: 4,
    followUpCount: 2,
    escalationCount: 1,
    createdAt: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString(),
    requestSentAt: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString(),
    expectedResponseAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    hardDeadlineAt: new Date(Date.now() + 4 * 24 * 3600 * 1000).toISOString(),
    lastFollowUpAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    lastEscalatedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    nextReviewAt: new Date().toISOString(),
    resolvedAt: null,
    tags: ['research', 'compute', 'grant', 'hpc'],
    notes: 'Escalated to Lab Operations lead after initial SLA elapsed.'
  },
  {
    id: 'item_aws_reimbursement',
    title: 'AWS Cloud Benchmark Expenses Reimbursement ($4,250)',
    description: 'Expense claim #EXP-9921 for AWS cloud benchmark instances and dataset hosting.',
    category: ItemCategory.REIMBURSEMENT,
    counterpartyId: 'cp_finance_team',
    counterpartyName: 'Finance & Reimbursements',
    counterpartyOrg: 'Apex Dynamics HQ',
    counterpartyEmail: 'reimbursements@apexdynamics.io',
    status: WaitingStatus.WAITING,
    userPriority: 4,
    impactLevel: 3,
    monetaryExposure: 4,
    followUpCount: 0,
    escalationCount: 0,
    createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
    requestSentAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
    expectedResponseAt: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
    hardDeadlineAt: new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString(),
    nextReviewAt: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
    resolvedAt: null,
    tags: ['finance', 'expenses', 'aws'],
    notes: 'Submitted via portal. Awaiting manager approval stage.'
  },
  {
    id: 'item_pr_code_review',
    title: 'PR #418 Architecture Review — Event Bus & Concurrency',
    description: 'Critical pull request unblocking release v2.4. Requires Staff reviewer sign-off.',
    category: ItemCategory.CODE_REVIEW,
    counterpartyId: 'cp_dave_chen',
    counterpartyName: 'Dave Chen',
    counterpartyOrg: 'Kernel Core Systems',
    counterpartyEmail: 'dave.chen@kernelcore.dev',
    status: WaitingStatus.WAITING,
    userPriority: 4,
    impactLevel: 4,
    monetaryExposure: 2,
    followUpCount: 1,
    escalationCount: 0,
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    requestSentAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    expectedResponseAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    hardDeadlineAt: new Date(Date.now() + 1 * 24 * 3600 * 1000).toISOString(),
    lastFollowUpAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    nextReviewAt: new Date().toISOString(),
    resolvedAt: null,
    tags: ['github', 'engineering', 'code-review', 'v2.4'],
    notes: 'Pinged Dave on Slack channel with architecture benchmarks.'
  },
  {
    id: 'item_provisional_degree',
    title: 'Provisional Degree Certificate & Academic Transcript Attestation',
    description: 'Official attested degree certificate required for global employment visa verification.',
    category: ItemCategory.ACADEMIC,
    counterpartyId: 'cp_registrar',
    counterpartyName: 'Office of the Registrar',
    counterpartyOrg: 'Imperial Institute of Technology',
    counterpartyEmail: 'records-verification@imperial.ac.edu',
    status: WaitingStatus.RESOLVED,
    userPriority: 5,
    impactLevel: 5,
    monetaryExposure: 5,
    followUpCount: 3,
    escalationCount: 1,
    createdAt: new Date(Date.now() - 28 * 24 * 3600 * 1000).toISOString(),
    requestSentAt: new Date(Date.now() - 28 * 24 * 3600 * 1000).toISOString(),
    expectedResponseAt: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
    hardDeadlineAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    resolutionSummary: 'Received official digitally signed PDF and dispatched apostilled physical certificate via DHL.',
    tags: ['academic', 'visa', 'credentials', 'completed'],
    notes: 'Completed after supervisor intervention at registry office. Verification Hash: IIT-2026-CERT-9941.'
  }
];

export const SEED_DEPENDENCIES = [
  {
    id: 'dep_1',
    waitingItemId: 'item_sarah_interview',
    targetType: DependencyTargetType.DECISION,
    targetRef: 'DEC-2026-01',
    label: 'Relocation & Housing Contract Decision',
    criticality: 5
  },
  {
    id: 'dep_2',
    waitingItemId: 'item_sarah_interview',
    targetType: DependencyTargetType.MILESTONE,
    targetRef: 'CAREER-Q3',
    label: 'Accept Alternate Competing Offer Deadline',
    criticality: 4
  },
  {
    id: 'dep_3',
    waitingItemId: 'item_gpu_cluster',
    targetType: DependencyTargetType.PROJECT,
    targetRef: 'THESIS-CH4',
    label: 'Dissertation Distributed Benchmark Experiments',
    criticality: 5
  },
  {
    id: 'dep_4',
    waitingItemId: 'item_gpu_cluster',
    targetType: DependencyTargetType.MILESTONE,
    targetRef: 'NEURIPS-PAPER',
    label: 'NeurIPS Camera-Ready Evaluation Submission',
    criticality: 5
  },
  {
    id: 'dep_5',
    waitingItemId: 'item_pr_code_review',
    targetType: DependencyTargetType.TASK,
    targetRef: 'RELEASE-RC1',
    label: 'v2.4-RC1 Staging Branch Cut & E2E Validation',
    criticality: 4
  },
  {
    id: 'dep_6',
    waitingItemId: 'item_provisional_degree',
    targetType: DependencyTargetType.DOCUMENT,
    targetRef: 'VISA-DOCS',
    label: 'Global Mobility Visa Work Permit Filing',
    criticality: 5
  }
];

export const SEED_TIMELINE_EVENTS = [
  {
    id: 'evt_1',
    waitingItemId: 'item_sarah_interview',
    type: TimelineEventType.CREATED,
    title: 'Created waiting item for Staff Architect decision',
    note: 'Initial entry created after final round presentation.',
    actor: 'User',
    createdAt: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'evt_2',
    waitingItemId: 'item_sarah_interview',
    type: TimelineEventType.REQUEST_SENT,
    title: 'Sent confirmation email to Sarah Jenkins',
    note: 'Shared post-interview notes and confirmed availability.',
    actor: 'User',
    createdAt: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'evt_3',
    waitingItemId: 'item_sarah_interview',
    type: TimelineEventType.FOLLOW_UP_LOGGED,
    title: 'Follow-up #1 sent via Email',
    note: 'Polite inquiry regarding hiring committee decision.',
    actor: 'User',
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'evt_4',
    waitingItemId: 'item_gpu_cluster',
    type: TimelineEventType.CREATED,
    title: 'GPU Cluster access request submitted to HPC portal',
    note: 'Requested 8x H100 nodes for 14-day training run.',
    actor: 'User',
    createdAt: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'evt_5',
    waitingItemId: 'item_gpu_cluster',
    type: TimelineEventType.ESCALATION,
    title: 'Escalation #1: Contacted Lab Operations Manager',
    note: 'Overdue by 5 days. Sent urgent message via Slack #hpc-lab.',
    actor: 'User',
    createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'evt_6',
    waitingItemId: 'item_provisional_degree',
    type: TimelineEventType.RESOLVED,
    title: 'Resolved: Provisional Degree Certificate Received',
    note: 'Digital verification completed. Apostilled document en route.',
    actor: 'User',
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
  }
];

export const SEED_SETTINGS = [
  { key: 'theme', value: 'dark' },
  { key: 'accentColor', value: '#c0c1ff' },
  { key: 'compactDensity', value: false },
  { key: 'quietHoursEnabled', value: true },
  { key: 'quietHoursStart', value: '21:00' },
  { key: 'quietHoursEnd', value: '08:00' },
  { key: 'soundAlerts', value: true },
  { key: 'privacyRedactionMode', value: false },
  { key: 'defaultFollowUpInterval', value: 4 },
  { key: 'maxFollowUpsBeforeEscalation', value: 2 },
  { key: 'autoBackupFrequency', value: 'weekly' }
];
