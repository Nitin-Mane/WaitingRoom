/**
 * Automated Domain & Engine Test Suite for WaitingRoom
 */

import { WaitingStatus, ItemCategory, RecommendedAction } from '../src/core/types.js';
import { WaitingStateMachine, StateTransitionError } from '../src/core/stateMachine.js';
import { BlockingScoreEngine } from '../src/engines/blockingScoreEngine.js';
import { RecommendationEngine } from '../src/engines/recommendationEngine.js';
import { BusinessCalendar } from '../src/engines/businessCalendar.js';
import { ImportExportService } from '../src/services/importExport.js';
import { BackupRestoreEngine } from '../src/storage/backupRestore.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

function runTests() {
  console.log('========================================');
  console.log('Running WaitingRoom Domain & Engine Tests');
  console.log('========================================\n');

  // 1. Business Calendar Tests
  console.log('1. Business Calendar Tests:');
  const wednesday = new Date('2026-08-19T10:00:00Z'); // Wednesday
  const plus3BizDays = BusinessCalendar.addBusinessDays(wednesday, 3); // Thu, Fri, Mon -> Monday
  assert(plus3BizDays.getDay() === 1, 'Adding 3 business days to Wednesday lands on Monday (skips weekend)');
  assert(BusinessCalendar.isBusinessDay(new Date('2026-08-22T10:00:00Z')) === false, 'Saturday is not a business day');
  assert(BusinessCalendar.isBusinessDay(new Date('2026-08-21T10:00:00Z')) === true, 'Friday is a business day');

  // 2. State Machine Transition Tests
  console.log('\n2. State Machine Transition Tests:');
  const draftItem = {
    id: 'test_1',
    title: 'Test PR Review',
    status: WaitingStatus.DRAFT,
    counterpartyName: 'Dave'
  };

  const { updatedItem: waitingItem, event: reqSentEvt } = WaitingStateMachine.transition(draftItem, WaitingStatus.WAITING);
  assert(waitingItem.status === WaitingStatus.WAITING, 'DRAFT -> WAITING transition succeeds');
  assert(reqSentEvt !== null && reqSentEvt.type === 'REQUEST_SENT', 'Timeline event created for request sent');

  const { updatedItem: snoozedItem } = WaitingStateMachine.transition(waitingItem, WaitingStatus.SNOOZED, {
    snoozeUntil: new Date(Date.now() + 86400000).toISOString()
  });
  assert(snoozedItem.status === WaitingStatus.SNOOZED, 'WAITING -> SNOOZED transition succeeds with future date');

  // Reopen requires reason
  const resolvedItem = { id: 'test_2', title: 'Degree', status: WaitingStatus.RESOLVED };
  let errorCaught = false;
  try {
    WaitingStateMachine.transition(resolvedItem, WaitingStatus.WAITING, { reason: '' });
  } catch (err) {
    if (err instanceof StateTransitionError) errorCaught = true;
  }
  assert(errorCaught, 'Reopening a RESOLVED item without reason throws StateTransitionError');

  // 3. Blocking Score Engine Tests
  console.log('\n3. Blocking Score Engine Tests:');
  const highPriorityItem = {
    id: 'item_high',
    title: 'Urgent System Delivery',
    impactLevel: 5,
    userPriority: 5,
    monetaryExposure: 5,
    createdAt: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
    requestSentAt: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
    expectedResponseAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    hardDeadlineAt: new Date(Date.now() + 12 * 3600 * 1000).toISOString() // 12 hours away
  };

  const highDependencies = [
    { label: 'Release Blocker', criticality: 5 },
    { label: 'Client Delivery', criticality: 5 }
  ];

  const highResult = BlockingScoreEngine.calculate(highPriorityItem, highDependencies);
  assert(highResult.score >= 80 && highResult.score <= 100, `High priority item produces high score: ${highResult.score}/100`);
  assert(highResult.band === 'High' || highResult.band === 'Critical', `Score band is ${highResult.band}`);
  assert(highResult.topFactors.length > 0, 'Produces factor breakdown');

  const lowPriorityItem = {
    id: 'item_low',
    title: 'Casual Reading Recommendation',
    impactLevel: 1,
    userPriority: 1,
    monetaryExposure: 0
  };
  const lowResult = BlockingScoreEngine.calculate(lowPriorityItem, []);
  assert(lowResult.score <= 35, `Low priority item produces low score: ${lowResult.score}/100`);

  // Monotonicity check
  const midItem = { ...lowPriorityItem, impactLevel: 4 };
  const midResult = BlockingScoreEngine.calculate(midItem, []);
  assert(midResult.score > lowResult.score, 'Score increases monotonically when impact increases');

  // 4. Recommendation Engine Tests
  console.log('\n4. Recommendation Engine Tests:');
  const overdueItem = {
    id: 'item_overdue',
    status: WaitingStatus.WAITING,
    category: ItemCategory.CODE_REVIEW,
    followUpCount: 0,
    expectedResponseAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString() // 2 days overdue
  };

  const rec1 = RecommendationEngine.evaluate(overdueItem);
  assert(rec1.action === RecommendedAction.FOLLOW_UP, 'Overdue expected response recommends FOLLOW_UP');

  const multiFollowUpItem = {
    ...overdueItem,
    followUpCount: 3,
    maxFollowUps: 2
  };
  const rec2 = RecommendationEngine.evaluate(multiFollowUpItem);
  assert(rec2.action === RecommendedAction.ESCALATE, 'Exceeding max follow-ups recommends ESCALATE');

  // 5. Backup & Import / Export Serialization Tests
  console.log('\n5. Backup & Import / Export Serialization Tests:');
  const dummyItems = [
    { id: '1', title: 'Task A', category: 'RECRUITER', status: 'WAITING', counterpartyName: 'Alice' },
    { id: '2', title: 'Task B', category: 'APPROVAL', status: 'RESOLVED', counterpartyName: 'Bob' }
  ];

  const csv = ImportExportService.exportToCSV(dummyItems);
  assert(csv.includes('Task A') && csv.includes('Alice'), 'CSV export contains items and counterparties');

  const parsed = ImportExportService.parseCSV(csv);
  assert(parsed.length === 2 && parsed[0].title === 'Task A', 'CSV parse reconstructs items');

  const dummyBackup = {
    app: 'WaitingRoom',
    schemaVersion: 1,
    data: {
      waiting_items: dummyItems,
      counterparties: [],
      dependencies: [],
      timeline_events: []
    }
  };
  const valResult = BackupRestoreEngine.validateBackup(dummyBackup);
  assert(valResult.valid === true, 'Backup validator accepts valid WaitingRoom bundle');

  const invalidBackup = { app: 'OtherApp', data: {} };
  const valResult2 = BackupRestoreEngine.validateBackup(invalidBackup);
  assert(valResult2.valid === false, 'Backup validator rejects foreign bundle');

  console.log('\n========================================');
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log('========================================');

  if (failed > 0) process.exit(1);
}

runTests();
