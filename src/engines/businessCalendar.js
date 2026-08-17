/**
 * Business Calendar Utility
 * Computes business days (Mon-Fri) and timezone-safe date operations
 */

export class BusinessCalendar {
  /**
   * Check if a given Date is a business day (Monday - Friday)
   * @param {Date} date 
   * @returns {boolean}
   */
  static isBusinessDay(date) {
    const day = date.getDay();
    return day !== 0 && day !== 6; // 0 = Sunday, 6 = Saturday
  }

  /**
   * Adds N business days to a starting date
   * @param {Date|string|number} startDate 
   * @param {number} days 
   * @returns {Date}
   */
  static addBusinessDays(startDate, days) {
    const date = new Date(startDate);
    let remaining = Math.abs(days);
    const direction = days >= 0 ? 1 : -1;

    while (remaining > 0) {
      date.setDate(date.getDate() + direction);
      if (this.isBusinessDay(date)) {
        remaining--;
      }
    }
    return date;
  }

  /**
   * Calculates number of business days between two dates
   * @param {Date|string|number} start 
   * @param {Date|string|number} end 
   * @returns {number}
   */
  static businessDaysBetween(start, end) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (startDate > endDate) return -this.businessDaysBetween(endDate, startDate);

    let count = 0;
    const cur = new Date(startDate);
    cur.setHours(0, 0, 0, 0);
    const target = new Date(endDate);
    target.setHours(0, 0, 0, 0);

    while (cur < target) {
      cur.setDate(cur.getDate() + 1);
      if (this.isBusinessDay(cur)) {
        count++;
      }
    }
    return count;
  }

  /**
   * Format human relative time description
   * @param {Date|string} dateStr 
   * @param {Date} [now]
   * @returns {string}
   */
  static formatRelative(dateStr, now = new Date()) {
    if (!dateStr) return 'No date';
    const target = new Date(dateStr);
    const diffMs = target.getTime() - now.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;
    if (diffDays < -1 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;
    if (diffDays > 7) return target.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    return `${Math.abs(diffDays)} days overdue`;
  }
}
