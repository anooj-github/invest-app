/**
 * AuraInvest - Holdings View & Management
 */

import { store } from './state.js';
import { CATEGORY_LABELS } from './charts.js';

let activeCategoryFilter = 'all';
let searchQuery = '';
let currentSortColumn = 'value';
let currentSortDirection = 'desc'; // 'asc' or 'desc'

/**
 * Initialize Holdings View Event Listeners
 */
export function initHoldingsView() {
  const searchInput = document.getElementById('holdingSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderHoldingsTable();
    });
  }

  // Category filter pills
  const filterContainer = document.getElementById('holdingsFilterPills');
  if (filterContainer) {
    filterContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      filterContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategoryFilter = btn.dataset.category;
      renderHoldingsTable();
    });
  }

  // Table Sort Header Listeners
  const tableHeaders = document.querySelectorAll('#holdingsTable th[data-sort]');
  tableHeaders.forEach(th => {
    th.addEventListener('click', () => {
      const col = th.dataset.sort;
      if (currentSortColumn === col) {
        currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        currentSortColumn = col;
        currentSortDirection = 'desc';
      }
      renderHoldingsTable();
    });
  });

  // Holding Modal Form Submissions
  const holdingForm = document.getElementById('holdingForm');
  if (holdingForm) {
    holdingForm.addEventListener('submit', handleHoldingFormSubmit);
  }
}

/**
 * Render Holdings Data Table
 */
export function renderHoldingsTable() {
  const tbody = document.getElementById('holdingsTableBody');
  const countBadge = document.getElementById('holdingsCountBadge');
  if (!tbody) return;

  let holdings = [...store.state.holdings];
  const totalNetWorth = store.getTotalNetWorth();

  // Filter by Category
  if (activeCategoryFilter !== 'all') {
    holdings = holdings.filter(h => h.category === activeCategoryFilter);
  }

  // Filter by Search Query
  if (searchQuery) {
    holdings = holdings.filter(h => 
      h.name.toLowerCase().includes(searchQuery) ||
      h.symbol.toLowerCase().includes(searchQuery) ||
      (h.notes && h.notes.toLowerCase().includes(searchQuery))
    );
  }

  // Sort
  holdings.sort((a, b) => {
    let valA, valB;
    switch (currentSortColumn) {
      case 'name':
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
        return currentSortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      case 'price':
        valA = a.currentPrice || 0;
        valB = b.currentPrice || 0;
        break;
      case 'gain':
        valA = store.getHoldingGain(a);
        valB = store.getHoldingGain(b);
        break;
      case 'gainPercent':
        valA = store.getHoldingGainPercent(a);
        valB = store.getHoldingGainPercent(b);
        break;
      case 'allocation':
      case 'value':
      default:
        valA = store.getHoldingTotalValue(a);
        valB = store.getHoldingTotalValue(b);
        break;
    }
    return currentSortDirection === 'asc' ? valA - valB : valB - valA;
  });

  if (countBadge) {
    countBadge.textContent = `${holdings.length} Assets`;
  }

  if (holdings.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8">
          <div class="empty-state">
            <div class="empty-state-icon">💼</div>
            <h4>No holdings found</h4>
            <p>${searchQuery ? 'Try changing your search query or category filter.' : 'Add your first stock, crypto, ETF, or asset to begin tracking.'}</p>
            <button class="quick-btn btn-primary" style="width: auto; margin-top: 8px;" onclick="window.openHoldingModal()">
              <span>+ Add Investment</span>
            </button>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = holdings.map(h => {
    const totalVal = store.getHoldingTotalValue(h);
    const costBasis = store.getHoldingCostBasis(h);
    const gainDollar = store.getHoldingGain(h);
    const gainPct = store.getHoldingGainPercent(h);
    const isGain = gainDollar >= 0;
    const allocationPct = totalNetWorth > 0 ? (totalVal / totalNetWorth) * 100 : 0;
    const categoryLabel = CATEGORY_LABELS[h.category] || h.category;

    return `
      <tr data-id="${h.id}">
        <td>
          <div class="asset-cell">
            <div class="asset-icon-circle">
              ${h.symbol.slice(0, 3)}
            </div>
            <div class="asset-name-col">
              <strong>${escapeHtml(h.name)}</strong>
              <span>${escapeHtml(h.symbol)}</span>
            </div>
          </div>
        </td>
        <td>
          <span class="asset-badge ${h.category}">${categoryLabel}</span>
        </td>
        <td class="mono-num">
          <strong>${h.quantity.toLocaleString(undefined, { maximumFractionDigits: 4 })}</strong>
        </td>
        <td class="mono-num" style="color: var(--text-secondary);">
          ${store.formatMoney(h.avgBuyPrice)}
        </td>
        <td class="mono-num">
          <strong>${store.formatMoney(h.currentPrice)}</strong>
          ${h.dayChangePercent !== undefined ? `
            <div style="font-size: 0.72rem; color: ${h.dayChangePercent >= 0 ? 'var(--success)' : 'var(--danger)'};">
              ${h.dayChangePercent >= 0 ? '▲' : '▼'} ${Math.abs(h.dayChangePercent).toFixed(2)}% (24h)
            </div>
          ` : ''}
        </td>
        <td class="mono-num">
          <strong style="font-size: 0.95rem;">${store.formatMoney(totalVal)}</strong>
          <div style="font-size: 0.75rem; color: var(--text-muted);">
            Cost: ${store.formatMoney(costBasis)}
          </div>
        </td>
        <td>
          <div style="display: flex; flex-direction: column; gap: 2px;">
            <span class="badge ${isGain ? 'badge-success' : 'badge-danger'}">
              ${isGain ? '▲' : '▼'} ${store.formatMoney(gainDollar)}
            </span>
            <span class="mono-num" style="font-size: 0.76rem; color: ${isGain ? 'var(--success)' : 'var(--danger)'}; font-weight: 700;">
              ${store.formatPercent(gainPct)}
            </span>
          </div>
        </td>
        <td class="mono-num">
          <strong>${allocationPct.toFixed(1)}%</strong>
          <div style="width: 45px; height: 4px; background: rgba(255,255,255,0.08); border-radius: 2px; margin-top: 4px;">
            <div style="width: ${Math.min(100, allocationPct)}%; height: 100%; background: var(--accent-primary); border-radius: 2px;"></div>
          </div>
        </td>
        <td>
          <div class="row-actions">
            <button class="action-icon-btn" title="Edit Holding" onclick="window.editHolding('${h.id}')">
              ✏️
            </button>
            <button class="action-icon-btn delete" title="Delete Holding" onclick="window.confirmDeleteHolding('${h.id}', '${escapeHtml(h.name)}')">
              🗑️
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Handle Add/Edit Holding Form Submit
 */
function handleHoldingFormSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const holdingId = form.dataset.editingId;

  const data = {
    symbol: form.symbol.value,
    name: form.name.value,
    category: form.category.value,
    quantity: form.quantity.value,
    avgBuyPrice: form.avgBuyPrice.value,
    currentPrice: form.currentPrice.value || form.avgBuyPrice.value,
    notes: form.notes.value
  };

  if (!data.name || !data.symbol || isNaN(data.quantity) || isNaN(data.avgBuyPrice)) {
    window.showToast('Please fill in all required fields properly.', 'error');
    return;
  }

  if (holdingId) {
    store.updateHolding(holdingId, data);
    window.showToast(`Updated ${data.name} successfully!`, 'success');
  } else {
    store.addHolding(data);
    window.showToast(`Added ${data.name} to portfolio!`, 'success');
  }

  window.closeHoldingModal();
  renderHoldingsTable();
}

/**
 * Helper to escape HTML strings
 */
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
