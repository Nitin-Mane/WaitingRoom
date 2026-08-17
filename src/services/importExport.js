/**
 * Import and Export Service for WaitingRoom
 * Formats: JSON (Full-fidelity), CSV (Tabular), Markdown (Executive Summary Report)
 */

export class ImportExportService {
  /**
   * Generates full CSV string from waiting items
   * @param {Array} items 
   * @returns {string}
   */
  static exportToCSV(items) {
    const headers = [
      'ID',
      'Title',
      'Category',
      'Status',
      'Counterparty',
      'Organization',
      'Email',
      'Priority',
      'Impact',
      'BlockingScore',
      'RequestSentAt',
      'ExpectedResponseAt',
      'HardDeadlineAt',
      'FollowUpCount',
      'EscalationCount',
      'Tags',
      'Notes'
    ];

    const rows = items.map(item => [
      item.id,
      `"${(item.title || '').replace(/"/g, '""')}"`,
      item.category || '',
      item.status || '',
      `"${(item.counterpartyName || '').replace(/"/g, '""')}"`,
      `"${(item.counterpartyOrg || '').replace(/"/g, '""')}"`,
      `"${(item.counterpartyEmail || '').replace(/"/g, '""')}"`,
      item.userPriority || 3,
      item.impactLevel || 3,
      item.blockingScore || 0,
      item.requestSentAt || '',
      item.expectedResponseAt || '',
      item.hardDeadlineAt || '',
      item.followUpCount || 0,
      item.escalationCount || 0,
      `"${(Array.isArray(item.tags) ? item.tags.join('; ') : (item.tags || '')).replace(/"/g, '""')}"`,
      `"${(item.notes || '').replace(/"/g, '""')}"`
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  /**
   * Generates a comprehensive human-readable Markdown report
   * @param {Array} items 
   * @param {Object} [metrics] 
   * @returns {string}
   */
  static exportToMarkdown(items, metrics = {}) {
    const now = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    const active = items.filter(i => i.status !== 'RESOLVED' && i.status !== 'CANCELLED');
    const resolved = items.filter(i => i.status === 'RESOLVED');

    let md = `# WaitingRoom — Dependency & Follow-up Audit Report\n\n`;
    md += `**Generated on:** ${now}  \n`;
    md += `**Active Blockers:** ${active.length} | **Resolved:** ${resolved.length} | **Total:** ${items.length}\n\n`;
    md += `---\n\n`;

    md += `## 1. High Priority & Actionable Blockers\n\n`;
    if (active.length === 0) {
      md += `*No active waiting items pending.*\n\n`;
    } else {
      active.forEach((item, idx) => {
        md += `### ${idx + 1}. [${item.scoreDetails ? item.scoreDetails.band : 'Active'}] ${item.title}\n`;
        md += `- **Counterparty:** ${item.counterpartyName || 'Unknown'} (${item.counterpartyOrg || 'Direct'})\n`;
        md += `- **Blocking Score:** \`${item.blockingScore || 0}/100\` | **Status:** \`${item.status}\` | **Category:** \`${item.category}\`\n`;
        if (item.hardDeadlineAt) {
          md += `- **Hard Deadline:** ${new Date(item.hardDeadlineAt).toLocaleDateString()}\n`;
        }
        if (item.expectedResponseAt) {
          md += `- **Expected Response:** ${new Date(item.expectedResponseAt).toLocaleDateString()}\n`;
        }
        if (item.dependencies && item.dependencies.length > 0) {
          md += `- **Blocks Downstream Deliverables:**\n`;
          item.dependencies.forEach(d => {
            md += `  - [${d.targetType}] ${d.label} (Criticality: ${d.criticality}/5)\n`;
          });
        }
        if (item.notes) {
          md += `- **Notes:** ${item.notes}\n`;
        }
        md += `\n`;
      });
    }

    md += `## 2. Recently Resolved Dependencies\n\n`;
    if (resolved.length === 0) {
      md += `*No resolved records in this export range.*\n\n`;
    } else {
      resolved.forEach((item, idx) => {
        md += `### ${idx + 1}. ✅ ${item.title}\n`;
        md += `- **Completed:** ${item.resolvedAt ? new Date(item.resolvedAt).toLocaleDateString() : 'Yes'}\n`;
        md += `- **Resolution Summary:** ${item.resolutionSummary || 'Completed without additional summary.'}\n`;
        md += `\n`;
      });
    }

    md += `---\n*Exported locally from WaitingRoom — Local-first Dependency Tracker*\n`;
    return md;
  }

  /**
   * Parses CSV content into items
   * @param {string} csvText 
   * @returns {Array} Parsed items
   */
  static parseCSV(csvText) {
    const lines = csvText.trim().split(/\r?\n/);
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const items = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      // Regex matching for CSV quotes
      const values = [];
      let cur = '';
      let insideQuote = false;
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"' && line[j + 1] === '"') {
          cur += '"';
          j++;
        } else if (char === '"') {
          insideQuote = !insideQuote;
        } else if (char === ',' && !insideQuote) {
          values.push(cur.trim());
          cur = '';
        } else {
          cur += char;
        }
      }
      values.push(cur.trim());

      const item = {
        title: values[1] || 'Imported Item',
        category: values[2] || 'OTHER',
        status: values[3] || 'WAITING',
        counterpartyName: values[4] || 'External Entity',
        counterpartyOrg: values[5] || '',
        counterpartyEmail: values[6] || '',
        userPriority: Number(values[7] || 3),
        impactLevel: Number(values[8] || 3),
        requestSentAt: values[10] || new Date().toISOString(),
        expectedResponseAt: values[11] || null,
        hardDeadlineAt: values[12] || null,
        tags: values[15] ? values[15].split(';').map(t => t.trim()) : [],
        notes: values[16] || ''
      };
      items.push(item);
    }
    return items;
  }
}
