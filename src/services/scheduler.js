/**
 * Notification Scheduler and Reconciliation Service
 * Reconciles overdue reminders upon startup and schedules follow-up checks.
 */

export class Scheduler {
  constructor(repository, notificationService) {
    this.repository = repository;
    this.notificationService = notificationService;
    this.timerId = null;
    this.checkIntervalMs = 60 * 1000; // 1 minute interval
  }

  start() {
    this.reconcileMissedReminders();
    if (this.timerId) clearInterval(this.timerId);
    this.timerId = setInterval(() => this.checkSchedules(), this.checkIntervalMs);
  }

  stop() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  /**
   * Reconciles missed reminders on startup
   */
  async reconcileMissedReminders() {
    try {
      const items = await this.repository.getAllItems();
      const settings = await this.repository.getAllSettings();
      const now = new Date();

      const missed = items.filter(item => {
        if (item.status === 'RESOLVED' || item.status === 'CANCELLED') return false;
        if (item.recommendation && (item.recommendation.action === 'FOLLOW_UP' || item.recommendation.action === 'ESCALATE')) {
          return true;
        }
        if (item.nextReviewAt && new Date(item.nextReviewAt) <= now) {
          return true;
        }
        return false;
      });

      if (missed.length > 0 && this.notificationService) {
        this.notificationService.notify({
          id: `reconcile_${Date.now()}`,
          title: `${missed.length} Actionable Items Ready for Review`,
          body: `You have ${missed.length} pending dependencies requiring follow-up or review.`,
          type: 'SCHEDULE_RECONCILED',
          count: missed.length,
          timestamp: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error('Error during reminder reconciliation', err);
    }
  }

  async checkSchedules() {
    try {
      const settings = await this.repository.getAllSettings();
      if (settings.quietHoursEnabled) {
        const now = new Date();
        const curTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const start = settings.quietHoursStart || '21:00';
        const end = settings.quietHoursEnd || '08:00';
        
        const inQuiet = start > end ? (curTime >= start || curTime < end) : (curTime >= start && curTime < end);
        if (inQuiet) return; // Skip during quiet hours
      }

      const items = await this.repository.getAllItems();
      const now = new Date();

      for (const item of items) {
        if (item.status === 'RESOLVED' || item.status === 'CANCELLED') continue;

        if (item.nextReviewAt) {
          const reviewDate = new Date(item.nextReviewAt);
          const diffMin = (now.getTime() - reviewDate.getTime()) / (1000 * 60);

          if (diffMin >= 0 && diffMin < 2) {
            this.notificationService.notify({
              id: `review_${item.id}_${Date.now()}`,
              title: `Follow-up Due: ${item.title}`,
              body: `Scheduled review window arrived for ${item.counterpartyName || 'dependency'}.`,
              itemId: item.id,
              type: 'FOLLOW_UP_DUE',
              timestamp: new Date().toISOString()
            });
          }
        }
      }
    } catch (err) {
      console.error('Error checking schedules', err);
    }
  }
}
