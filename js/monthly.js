/**
 * AuraInvest - Monthly Updates & Snapshot Controller
 */

import { store } from './state.js';
import { renderMonthlyGrowthChart } from './charts.js';

export function initMonthlyView() {
  const monthlyForm = document.getElementById('monthlyForm');
  if (monthlyForm) {
    monthlyForm.addEventListener('submit', handleMonthlyFormSubmit);
  }
}

/**
 * Render the Monthly Updates Timeline & Chart
 */
export function renderMonthlyView() {
  const timelineContainer = document.getElementById('monthlyTimeline');
  const countBadge = document.getElementById('monthlyCountBadge');
  if (!timelineContainer) return;

  const updates = [...(store.state.monthlyUpdates || [])];
  // Sort descending for timeline (newest month first)
  updates.sort((a, b) => b.monthYear.localeCompare(a.monthYear));

  if (countBadge) {
    countBadge.textContent = `${updates.length} Months Tracked`;
  }

  // Render Bar Chart
  renderMonthlyGrowthChart();

  if (updates.length === 0) {
    timelineContainer.innerHTML = `
      <div class="glass-card empty-state">
        <div class="empty-state-icon">📅</div>
        <h4>No monthly check-ins recorded</h4>
        <p>Record your monthly portfolio snapshot to track contributions, market gains, and personal investment notes.</p>
        <button class="quick-btn btn-primary" style="width: auto; margin-top: 8px;" onclick="window.openMonthlyModal()">
          <span>+ Record Monthly Snapshot</span>
        </button>
      </div>
    `;
    return;
  }

  timelineContainer.innerHTML = updates.map((m, idx) => {
    const isPositive = m.marketGain >= 0;
    const [year, month] = m.monthYear.split('-');
    const dateObj = new Date(year, parseInt(month) - 1);
    const monthName = dateObj.toLocaleString('default', { month: 'long', year: 'numeric' });

    // Calculate month-over-month total change if previous month exists
    const prevMonth = updates[idx + 1];
    let momNetChange = 0;
    let momPctChange = 0;
    if (prevMonth && prevMonth.totalNetWorth > 0) {
      momNetChange = m.totalNetWorth - prevMonth.totalNetWorth;
      momPctChange = (momNetChange / prevMonth.totalNetWorth) * 100;
    }

    return `
      <div class="glass-card monthly-card ${isPositive ? 'positive' : 'negative'}">
        <div class="monthly-card-header">
          <div class="month-badge">
            <span>🗓️</span> ${monthName}
          </div>
          <div class="row-actions">
            <button class="action-icon-btn" title="Edit Update" onclick="window.editMonthlyUpdate('${m.id}')">✏️</button>
            <button class="action-icon-btn delete" title="Delete Update" onclick="window.confirmDeleteMonthlyUpdate('${m.id}', '${monthName}')">🗑️</button>
          </div>
        </div>

        <div class="monthly-stats-row">
          <div class="month-stat-box">
            <span>Ending Net Worth</span>
            <strong class="mono-num">${store.formatMoney(m.totalNetWorth)}</strong>
          </div>
          <div class="month-stat-box">
            <span>New Capital Added</span>
            <strong class="mono-num" style="color: var(--accent-primary);">+${store.formatMoney(m.contributions)}</strong>
          </div>
          <div class="month-stat-box">
            <span>Market Gain / (Loss)</span>
            <strong class="mono-num" style="color: ${isPositive ? 'var(--success)' : 'var(--danger)'};">
              ${isPositive ? '+' : ''}${store.formatMoney(m.marketGain)}
            </strong>
          </div>
          ${prevMonth ? `
            <div class="month-stat-box">
              <span>MoM Net Change</span>
              <strong class="mono-num" style="color: ${momNetChange >= 0 ? 'var(--success)' : 'var(--danger)'};">
                ${momNetChange >= 0 ? '+' : ''}${store.formatMoney(momNetChange)} (${store.formatPercent(momPctChange)})
              </strong>
            </div>
          ` : ''}
        </div>

        ${m.notes ? `
          <div class="monthly-notes">
            <strong>Notes:</strong> ${escapeHtml(m.notes)}
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

/**
 * Handle Add/Edit Monthly Update Form
 */
function handleMonthlyFormSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const updateId = form.dataset.editingId;

  const data = {
    monthYear: form.monthYear.value,
    totalNetWorth: form.totalNetWorth.value,
    contributions: form.contributions.value || 0,
    marketGain: form.marketGain.value || 0,
    notes: form.notes.value
  };

  if (!data.monthYear || isNaN(data.totalNetWorth)) {
    window.showToast('Please select a valid month and enter the portfolio net worth.', 'error');
    return;
  }

  if (updateId) {
    store.updateMonthlyUpdate(updateId, data);
    window.showToast(`Updated snapshot for ${data.monthYear}!`, 'success');
  } else {
    store.addMonthlyUpdate(data);
    window.showToast(`Saved monthly update for ${data.monthYear}!`, 'success');
  }

  window.closeMonthlyModal();
  renderMonthlyView();
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
