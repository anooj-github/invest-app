/**
 * AuraInvest - Goals & Milestones Controller
 */

import { store } from './state.js';

export function initGoalsView() {
  const goalForm = document.getElementById('goalForm');
  if (goalForm) {
    goalForm.addEventListener('submit', handleGoalFormSubmit);
  }
}

/**
 * Render all Goals & Milestones Cards
 */
export function renderGoalsView() {
  const container = document.getElementById('goalsGrid');
  const countBadge = document.getElementById('goalsCountBadge');
  if (!container) return;

  const goals = store.state.goals || [];
  const totalNetWorth = store.getTotalNetWorth();

  if (countBadge) {
    countBadge.textContent = `${goals.length} Goals`;
  }

  if (goals.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1;">
        <div class="glass-card empty-state">
          <div class="empty-state-icon">🎯</div>
          <h4>No goals set yet</h4>
          <p>Create your first investment milestone, retirement target, or liquidity buffer goal.</p>
          <button class="quick-btn btn-primary" style="width: auto; margin-top: 8px;" onclick="window.openGoalModal()">
            <span>+ Create Goal</span>
          </button>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = goals.map(g => {
    // Determine current value based on goal category
    let currentValue = totalNetWorth;
    if (g.category && g.category !== 'networth') {
      currentValue = store.state.holdings
        .filter(h => h.category === g.category)
        .reduce((sum, h) => sum + store.getHoldingTotalValue(h), 0);
    }

    const target = g.targetAmount || 1;
    const progressPct = Math.min(100, Math.max(0, (currentValue / target) * 100));
    const remaining = Math.max(0, target - currentValue);
    const isCompleted = progressPct >= 100;

    // Target Date calculation
    let dateText = 'No deadline';
    if (g.targetDate) {
      const targetDateObj = new Date(g.targetDate);
      const diffTime = targetDateObj - new Date();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays < 0) {
        dateText = `<span style="color: var(--danger);">Target date passed</span>`;
      } else if (diffDays <= 30) {
        dateText = `<span style="color: var(--warning);">${diffDays} days left</span>`;
      } else {
        const months = Math.round(diffDays / 30.4);
        dateText = `<span>${months} months left (${targetDateObj.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })})</span>`;
      }
    }

    return `
      <div class="glass-card goal-card">
        <div>
          <div class="goal-top">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div class="goal-icon-badge">
                ${g.icon || '🎯'}
              </div>
              <div class="goal-info">
                <h3>${escapeHtml(g.title)}</h3>
                <p>${escapeHtml(g.notes || (g.category === 'networth' ? 'Overall Portfolio Milestone' : `${g.category.toUpperCase()} Target`))}</p>
              </div>
            </div>
            <div class="row-actions">
              <button class="action-icon-btn" title="Edit Goal" onclick="window.editGoal('${g.id}')">✏️</button>
              <button class="action-icon-btn delete" title="Delete Goal" onclick="window.confirmDeleteGoal('${g.id}', '${escapeHtml(g.title)}')">🗑️</button>
            </div>
          </div>

          <div class="goal-progress-wrap">
            <div class="progress-header">
              <span style="color: var(--text-secondary);">Progress</span>
              <strong class="mono-num" style="color: ${isCompleted ? 'var(--success)' : 'var(--accent-primary)'};">
                ${progressPct.toFixed(1)}% ${isCompleted ? '🎉 Complete!' : ''}
              </strong>
            </div>
            <div class="progress-bar-bg">
              <div class="progress-bar-fill ${isCompleted ? 'complete' : ''}" style="width: ${progressPct}%;"></div>
            </div>
          </div>

          <div class="goal-metrics">
            <div class="goal-metric-item">
              <span>Current</span>
              <strong class="mono-num">${store.formatMoney(currentValue)}</strong>
            </div>
            <div class="goal-metric-item">
              <span>Target</span>
              <strong class="mono-num">${store.formatMoney(target)}</strong>
            </div>
            <div class="goal-metric-item">
              <span>Remaining</span>
              <strong class="mono-num" style="color: ${isCompleted ? 'var(--success)' : 'var(--text-secondary)'};">
                ${isCompleted ? 'Goal Achieved' : store.formatMoney(remaining)}
              </strong>
            </div>
            <div class="goal-metric-item">
              <span>Timeline</span>
              <strong style="font-size: 0.82rem;">${dateText}</strong>
            </div>
          </div>
        </div>

        ${isCompleted ? `
          <div style="margin-top: 14px; padding: 8px; background: var(--success-bg); border: 1px solid var(--success-border); border-radius: var(--radius-sm); text-align: center; font-size: 0.8rem; color: var(--success); font-weight: 700; cursor: pointer;" onclick="window.triggerConfetti()">
            ✨ Milestone Reached! Click to celebrate 🎊
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

/**
 * Handle Add/Edit Goal Form
 */
function handleGoalFormSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const goalId = form.dataset.editingId;

  const data = {
    title: form.title.value,
    targetAmount: form.targetAmount.value,
    targetDate: form.targetDate.value,
    category: form.category.value,
    icon: form.icon.value || '🎯',
    notes: form.notes.value
  };

  if (!data.title || isNaN(data.targetAmount) || parseFloat(data.targetAmount) <= 0) {
    window.showToast('Please enter a valid goal title and target amount.', 'error');
    return;
  }

  if (goalId) {
    store.updateGoal(goalId, data);
    window.showToast(`Updated goal "${data.title}"!`, 'success');
  } else {
    store.addGoal(data);
    window.showToast(`Created goal "${data.title}"!`, 'success');
    window.triggerConfetti();
  }

  window.closeGoalModal();
  renderGoalsView();
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
