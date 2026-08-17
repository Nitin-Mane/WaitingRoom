/**
 * Blocking-Impact Score Engine
 * Computes a stable, explainable 0–100 score to rank active waiting items.
 */

import { CategoryDefaults, ItemCategory } from '../core/types.js';

export const SCORE_VERSION = 'blocking-v1';

export const WEIGHTS = Object.freeze({
  CRITICALITY: 0.28,
  DEADLINE: 0.22,
  DOWNSTREAM: 0.18,
  AGE: 0.14,
  FINANCIAL: 0.08,
  USER_PRIORITY: 0.10
});

export const SCORE_BANDS = Object.freeze({
  LOW: { min: 0, max: 24, label: 'Low', color: '#64748B', badgeClass: 'bg-slate-800 text-slate-300' },
  WATCH: { min: 25, max: 49, label: 'Watch', color: '#3B82F6', badgeClass: 'bg-blue-950 text-blue-300' },
  IMPORTANT: { min: 50, max: 69, label: 'Important', color: '#F59E0B', badgeClass: 'bg-amber-950 text-amber-300' },
  HIGH: { min: 70, max: 84, label: 'High', color: '#EA580C', badgeClass: 'bg-orange-950 text-orange-300' },
  CRITICAL: { min: 85, max: 100, label: 'Critical', color: '#EF4444', badgeClass: 'bg-red-950 text-red-300' }
});

export class BlockingScoreEngine {
  /**
   * Calculates 0-100 blocking score and full breakdown
   * @param {Object} item - WaitingItem
   * @param {Array} [dependencies] - List of downstream DependencyLinks
   * @param {Date} [now] - Reference time
   * @returns {Object} ScoreResult { score, band, topFactors, contributions, summary, version }
   */
  static calculate(item, dependencies = [], now = new Date()) {
    const nowDate = new Date(now);

    // 1. Criticality factor C (0..1)
    const criticalityLevel = item.impactLevel !== undefined ? item.impactLevel : 3;
    const C = Math.min(1, Math.max(0, criticalityLevel / 5.0));

    // 2. Deadline pressure factor D (0..1)
    let D = 0.0;
    if (item.hardDeadlineAt) {
      const deadlineDate = new Date(item.hardDeadlineAt);
      const diffMs = deadlineDate.getTime() - nowDate.getTime();
      const daysLeft = diffMs / (1000 * 60 * 60 * 24);

      if (daysLeft <= 0) D = 1.00;
      else if (daysLeft <= 1) D = 0.90;
      else if (daysLeft <= 3) D = 0.75;
      else if (daysLeft <= 7) D = 0.55;
      else if (daysLeft <= 14) D = 0.30;
      else D = 0.10;
    } else if (item.expectedResponseAt) {
      const expectedDate = new Date(item.expectedResponseAt);
      if (expectedDate < nowDate) {
        D = 0.15; // overdue expected response fallback
      }
    }

    // 3. Downstream blocking breadth B (0..1)
    const itemDeps = dependencies.filter(d => !d.waitingItemId || d.waitingItemId === item.id);
    let weightedDependents = 0;
    if (itemDeps.length > 0) {
      weightedDependents = itemDeps.reduce((sum, dep) => sum + ((dep.criticality || 3) / 5.0), 0);
    } else if (item.dependencyCount) {
      weightedDependents = item.dependencyCount * 0.6;
    }
    const B = Math.min(1, Math.log1p(weightedDependents) / Math.log1p(8));

    // 4. Waiting age / staleness factor A (0..1)
    const requestDate = item.requestSentAt ? new Date(item.requestSentAt) : (item.createdAt ? new Date(item.createdAt) : nowDate);
    const waitedDays = Math.max(0, (nowDate.getTime() - requestDate.getTime()) / (1000 * 60 * 60 * 24));
    
    let expectedDays = 5;
    if (item.expectedResponseAt) {
      const expDate = new Date(item.expectedResponseAt);
      expectedDays = Math.max(1, (expDate.getTime() - requestDate.getTime()) / (1000 * 60 * 60 * 24));
    } else {
      const catConfig = CategoryDefaults[item.category] || CategoryDefaults[ItemCategory.OTHER];
      expectedDays = catConfig.initialReviewDays || 5;
    }

    const ratio = waitedDays / expectedDays;
    const A = Math.min(1, Math.max(0, (ratio - 0.5) / 2.0));

    // 5. Financial / opportunity exposure F (0..1)
    const financialLevel = item.monetaryExposure !== undefined ? item.monetaryExposure : (item.financialLevel || 0);
    const F = Math.min(1, Math.max(0, financialLevel / 5.0));

    // 6. Explicit user priority P (0..1)
    const priorityLevel = item.userPriority !== undefined ? item.userPriority : 3;
    const P = Math.min(1, Math.max(0, priorityLevel / 5.0));

    // Raw score calculation
    const rawScore = (
      WEIGHTS.CRITICALITY * C +
      WEIGHTS.DEADLINE * D +
      WEIGHTS.DOWNSTREAM * B +
      WEIGHTS.AGE * A +
      WEIGHTS.FINANCIAL * F +
      WEIGHTS.USER_PRIORITY * P
    );

    const clampedRaw = Math.min(1, Math.max(0, rawScore));
    const score = Math.round(100 * clampedRaw);

    // Factor contributions in score points
    const contributions = {
      criticality: Math.round(100 * WEIGHTS.CRITICALITY * C),
      deadline: Math.round(100 * WEIGHTS.DEADLINE * D),
      downstream: Math.round(100 * WEIGHTS.DOWNSTREAM * B),
      age: Math.round(100 * WEIGHTS.AGE * A),
      financial: Math.round(100 * WEIGHTS.FINANCIAL * F),
      userPriority: Math.round(100 * WEIGHTS.USER_PRIORITY * P)
    };

    // Sorted top factors
    const topFactors = Object.entries(contributions)
      .map(([factor, pts]) => ({ factor, contribution: pts }))
      .sort((a, b) => b.contribution - a.contribution);

    // Determine band
    let band = SCORE_BANDS.LOW;
    if (score >= SCORE_BANDS.CRITICAL.min) band = SCORE_BANDS.CRITICAL;
    else if (score >= SCORE_BANDS.HIGH.min) band = SCORE_BANDS.HIGH;
    else if (score >= SCORE_BANDS.IMPORTANT.min) band = SCORE_BANDS.IMPORTANT;
    else if (score >= SCORE_BANDS.WATCH.min) band = SCORE_BANDS.WATCH;

    // Explainable Summary
    const summary = this._generateSummary(score, band, topFactors, item, itemDeps.length);

    return {
      score,
      band: band.label,
      bandColor: band.color,
      badgeClass: band.badgeClass,
      rawScore: Number(clampedRaw.toFixed(4)),
      contributions,
      topFactors,
      summary,
      version: SCORE_VERSION
    };
  }

  static _generateSummary(score, band, topFactors, item, depCount) {
    const dominant = topFactors[0] ? topFactors[0].factor : 'general';
    const reasons = [];

    if (item.hardDeadlineAt) {
      const days = Math.round((new Date(item.hardDeadlineAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (days <= 0) reasons.push('hard deadline is breached');
      else if (days <= 3) reasons.push(`deadline is approaching in ${days} days`);
    }

    if (depCount > 0) {
      reasons.push(`blocks ${depCount} downstream ${depCount === 1 ? 'deliverable' : 'deliverables'}`);
    }

    if ((item.impactLevel || 0) >= 4) {
      reasons.push('has high structural criticality');
    }

    if (reasons.length === 0) {
      if (score >= 50) reasons.push(`driven primarily by ${dominant} pressure`);
      else reasons.push('moderate impact across routine milestones');
    }

    return `${band.label} priority (${score}/100) because ${reasons.join(' and ')}.`;
  }
}
