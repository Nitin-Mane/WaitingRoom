/**
 * Follow-up Composer View
 * Interactive message drafting engine with dynamic templates, tone selector, and 1-click execution.
 */

export class FollowUpComposerView {
  static getTemplates(item = {}, tone = 'POLITE') {
    const cpName = item.counterpartyName || 'there';
    const title = item.title || 'the pending deliverable';
    const deadline = item.hardDeadlineAt ? new Date(item.hardDeadlineAt).toLocaleDateString() : 'the upcoming deadline';
    const depList = item.dependencies && item.dependencies.length > 0 
      ? `This currently holds up: ${item.dependencies.map(d => d.label).join(', ')}.`
      : '';

    const templates = {
      GENTLE: {
        id: 'GENTLE',
        name: 'Gentle Check-in',
        subject: `Quick check-in regarding ${title}`,
        body: `Hi ${cpName},\n\nHope you are having a productive week! I wanted to briefly check in on the status of ${title}.\n\nWhen you get a moment, could you please share a quick update on the expected timeline?\n\nThank you so much,\nBest regards`
      },
      DEADLINE: {
        id: 'DEADLINE',
        name: 'Approaching Deadline Notice',
        subject: `Update needed: ${title} (Target: ${deadline})`,
        body: `Hi ${cpName},\n\nFollowing up on ${title}. We have a critical milestone approaching on ${deadline}.\n\n${depList}\n\nPlease let me know if there are any outstanding questions or if additional information is required from my side to help unblock this.\n\nThanks,\nBest regards`
      },
      ESCALATION: {
        id: 'ESCALATION',
        name: 'Formal Escalation & Impact Statement',
        subject: `URGENT: Escalation regarding ${title}`,
        body: `Hello ${cpName},\n\nI am writing to formally follow up regarding ${title}. The expected resolution SLA was breached, and downstream deliverables are now directly impacted.\n\n${depList}\n\nGiven the priority, could we please schedule a quick 5-minute alignment or establish an expedited turnaround date today?\n\nSincerely,`
      }
    };

    if (tone === 'DIRECT') {
      templates.GENTLE.body = `Hi ${cpName},\n\nChecking in on ${title}. Is this on track for review today?\n\nThanks,`;
      templates.DEADLINE.body = `Hi ${cpName},\n\nWe need resolution on ${title} by ${deadline} to avoid blocking downstream work.\n\nPlease confirm ETA.\n\nThanks,`;
    } else if (tone === 'URGENT') {
      templates.GENTLE.body = `Hi ${cpName},\n\nUrgent ping regarding ${title}. We need this unblocked as soon as possible today.\n\nThanks,`;
    }

    return templates;
  }

  static render(data = {}) {
    const { items = [], selectedItemId = null, selectedTemplate = 'GENTLE', selectedTone = 'POLITE' } = data;
    const activeItems = items.filter(i => i.status !== 'RESOLVED' && i.status !== 'CANCELLED');
    const currentItem = items.find(i => i.id === selectedItemId) || activeItems[0] || null;

    const templates = this.getTemplates(currentItem || {}, selectedTone);
    const activeTemplate = templates[selectedTemplate] || templates.GENTLE;

    return `
      <div class="view-animate max-w-5xl mx-auto space-y-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-indigo-950/60 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <span class="material-symbols-outlined text-lg">outgoing_mail</span>
            </div>
            <div>
              <h2 class="text-base font-bold text-slate-100">Follow-Up Message Composer</h2>
              <p class="text-xs text-slate-400">Draft polite, direct, or escalated communications in seconds</p>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Left Controls (1 col) -->
          <div class="space-y-4">
            <!-- 1. Select Item -->
            <div class="wr-card bg-slate-900 border border-slate-800 p-4 space-y-2">
              <label class="block text-xs font-semibold text-slate-300">Select Waiting Item</label>
              <select 
                class="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                onchange="window.app.setComposerItem(this.value)"
              >
                ${activeItems.map(item => `
                  <option value="${item.id}" ${currentItem && currentItem.id === item.id ? 'selected' : ''}>
                    [${item.blockingScore}] ${item.title}
                  </option>
                `).join('')}
              </select>
            </div>

            <!-- 2. Template Selector -->
            <div class="wr-card bg-slate-900 border border-slate-800 p-4 space-y-2">
              <label class="block text-xs font-semibold text-slate-300">Message Template</label>
              <div class="space-y-1.5 text-xs">
                ${Object.values(templates).map(tmpl => `
                  <div 
                    class="p-2.5 rounded-lg border cursor-pointer transition-all ${selectedTemplate === tmpl.id ? 'bg-indigo-950/80 border-indigo-500 text-indigo-200 font-semibold' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'}"
                    onclick="window.app.setComposerTemplate('${tmpl.id}')"
                  >
                    ${tmpl.name}
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- 3. Tone Selector -->
            <div class="wr-card bg-slate-900 border border-slate-800 p-4 space-y-2">
              <label class="block text-xs font-semibold text-slate-300">Tone & Urgency</label>
              <div class="grid grid-cols-3 gap-1.5 text-xs">
                <button class="py-1.5 px-2 rounded border text-center ${selectedTone === 'POLITE' ? 'bg-indigo-600 border-indigo-500 text-white font-semibold' : 'bg-slate-950 border-slate-800 text-slate-400'}" onclick="window.app.setComposerTone('POLITE')">
                  Polite
                </button>
                <button class="py-1.5 px-2 rounded border text-center ${selectedTone === 'DIRECT' ? 'bg-indigo-600 border-indigo-500 text-white font-semibold' : 'bg-slate-950 border-slate-800 text-slate-400'}" onclick="window.app.setComposerTone('DIRECT')">
                  Direct
                </button>
                <button class="py-1.5 px-2 rounded border text-center ${selectedTone === 'URGENT' ? 'bg-red-600 border-red-500 text-white font-semibold' : 'bg-slate-950 border-slate-800 text-slate-400'}" onclick="window.app.setComposerTone('URGENT')">
                  Urgent
                </button>
              </div>
            </div>
          </div>

          <!-- Right Editor & Output (2 cols) -->
          <div class="lg:col-span-2 space-y-4">
            <div class="wr-card bg-slate-900 border border-slate-800 p-6 space-y-4">
              <!-- Recipient Bar -->
              <div class="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs">
                <span class="text-slate-400">Recipient:</span>
                <span class="font-semibold text-slate-100">${currentItem ? `${currentItem.counterpartyName} (${currentItem.counterpartyEmail || 'No email saved'})` : 'None'}</span>
              </div>

              <!-- Subject Line -->
              <div class="space-y-1">
                <label class="block text-xs font-semibold text-slate-400">Subject Line</label>
                <input 
                  id="composer-subject" 
                  type="text" 
                  value="${activeTemplate.subject}" 
                  class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              <!-- Message Body -->
              <div class="space-y-1">
                <label class="block text-xs font-semibold text-slate-400">Message Body</label>
                <textarea 
                  id="composer-body" 
                  rows="10" 
                  class="w-full p-4 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs font-mono leading-relaxed focus:outline-none focus:border-indigo-500"
                >${activeTemplate.body}</textarea>
              </div>

              <!-- Bottom Actions -->
              <div class="flex items-center justify-between pt-2 border-t border-slate-800">
                <button class="btn-secondary text-xs" onclick="window.app.copyComposerText()">
                  <span class="material-symbols-outlined text-sm">content_copy</span>
                  <span>Copy to Clipboard</span>
                </button>

                <button class="btn-primary text-xs" onclick="window.app.logFollowUpFromComposer('${currentItem ? currentItem.id : ''}')">
                  <span class="material-symbols-outlined text-sm">send</span>
                  <span>Log as Sent & Set Review</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
