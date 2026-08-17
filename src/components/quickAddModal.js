/**
 * Quick Add Item Modal Component
 */

import { ItemCategory, CategoryLabels } from '../core/types.js';

export class QuickAddModal {
  static render() {
    const categoryOptions = Object.entries(CategoryLabels)
      .map(([key, label]) => `<option value="${key}">${label}</option>`)
      .join('');

    return `
      <div id="quick-add-modal" class="modal-overlay" onclick="if(event.target === this) window.app.closeQuickAdd()">
        <div class="modal-dialog max-w-2xl bg-slate-900 border border-slate-700 p-6">
          <div class="flex items-center justify-between pb-4 border-b border-slate-800">
            <div class="flex items-center gap-2.5">
              <span class="material-symbols-outlined text-indigo-400 text-2xl">add_task</span>
              <div>
                <h2 class="text-base font-bold text-slate-100">Add New Waiting Item</h2>
                <p class="text-xs text-slate-400">Track an external deliverable, response, or dependency</p>
              </div>
            </div>
            <button class="text-slate-400 hover:text-slate-200 material-symbols-outlined text-lg" onclick="window.app.closeQuickAdd()">close</button>
          </div>

          <form id="quick-add-form" onsubmit="window.app.handleQuickAddSubmit(event)" class="space-y-4 pt-4 text-xs">
            <!-- Title -->
            <div>
              <label class="block font-semibold text-slate-300 mb-1">What are you waiting for? *</label>
              <input 
                name="title" 
                type="text" 
                required 
                placeholder="e.g. Visa Attestation Approval / PR #42 Architecture Review" 
                class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs"
              />
            </div>

            <!-- Description -->
            <div>
              <label class="block font-semibold text-slate-300 mb-1">Description / Context</label>
              <textarea 
                name="description" 
                rows="2" 
                placeholder="Details on what was requested and required criteria..."
                class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs"
              ></textarea>
            </div>

            <!-- Category & Counterparty Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block font-semibold text-slate-300 mb-1">Category *</label>
                <select 
                  name="category" 
                  class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500 text-xs"
                >
                  ${categoryOptions}
                </select>
              </div>

              <div>
                <label class="block font-semibold text-slate-300 mb-1">Waiting on Who / Entity? *</label>
                <input 
                  name="counterpartyName" 
                  type="text" 
                  required 
                  placeholder="Person, Organization, or Dept" 
                  class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs"
                />
              </div>
            </div>

            <!-- Organization & Email Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block font-semibold text-slate-300 mb-1">Organization / Dept</label>
                <input 
                  name="counterpartyOrg" 
                  type="text" 
                  placeholder="e.g. Apex Dynamics / University Registry" 
                  class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs"
                />
              </div>

              <div>
                <label class="block font-semibold text-slate-300 mb-1">Contact Email / Handle</label>
                <input 
                  name="counterpartyEmail" 
                  type="text" 
                  placeholder="email@domain.com or Slack handle" 
                  class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs"
                />
              </div>
            </div>

            <!-- Deadlines & SLAs -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
              <div>
                <label class="block font-semibold text-slate-300 mb-1">Expected Response By (SLA)</label>
                <input 
                  name="expectedResponseAt" 
                  type="date" 
                  class="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-indigo-500 text-xs"
                />
              </div>

              <div>
                <label class="block font-semibold text-slate-300 mb-1">Hard Deadline (If any)</label>
                <input 
                  name="hardDeadlineAt" 
                  type="date" 
                  class="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-indigo-500 text-xs"
                />
              </div>
            </div>

            <!-- Priority & Impact Dials -->
            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="block font-semibold text-slate-300 mb-1">Priority (1-5)</label>
                <select name="userPriority" class="w-full px-2 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-100 text-xs">
                  <option value="5">P0 — Critical (5)</option>
                  <option value="4">P1 — High (4)</option>
                  <option value="3" selected>P2 — Normal (3)</option>
                  <option value="2">P3 — Low (2)</option>
                  <option value="1">P4 — Trivial (1)</option>
                </select>
              </div>

              <div>
                <label class="block font-semibold text-slate-300 mb-1">Impact Level (1-5)</label>
                <select name="impactLevel" class="w-full px-2 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-100 text-xs">
                  <option value="5">Catastrophic Blocker (5)</option>
                  <option value="4">Severe Delay (4)</option>
                  <option value="3" selected>Moderate Impact (3)</option>
                  <option value="2">Minor Impact (2)</option>
                  <option value="1">Negligible (1)</option>
                </select>
              </div>

              <div>
                <label class="block font-semibold text-slate-300 mb-1">Financial Exposure</label>
                <select name="monetaryExposure" class="w-full px-2 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-100 text-xs">
                  <option value="0" selected>None (0)</option>
                  <option value="2">&lt; $1,000 (2)</option>
                  <option value="4">$1,000 - $10,000 (4)</option>
                  <option value="5">&gt; $10,000 (5)</option>
                </select>
              </div>
            </div>

            <!-- Downstream Blocker Input -->
            <div class="pt-2">
              <label class="block font-semibold text-slate-300 mb-1">Downstream Work Blocked by this (Optional)</label>
              <input 
                name="downstreamLabel" 
                type="text" 
                placeholder="e.g. Visa work permit filing / Staging branch release cut" 
                class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs"
              />
            </div>

            <!-- Actions -->
            <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button type="button" class="btn-secondary" onclick="window.app.closeQuickAdd()">Cancel</button>
              <button type="submit" class="btn-primary">
                <span class="material-symbols-outlined text-sm">save</span>
                <span>Track Waiting Item</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  }
}
