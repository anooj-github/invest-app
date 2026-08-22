/**
 * AuraInvest - Export, Import & Backup Manager
 */

import { store } from './state.js';

export function exportToJSON() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(store.state, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadAnchor.setAttribute("download", `AuraInvest_Backup_${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  window.showToast('Portfolio exported to JSON successfully!', 'success');
}

export function exportToCSV() {
  const holdings = store.state.holdings || [];
  if (holdings.length === 0) {
    window.showToast('No holdings available to export.', 'error');
    return;
  }

  const headers = ['Symbol', 'Name', 'Category', 'Quantity', 'Avg Buy Price (USD)', 'Current Price (USD)', 'Total Value (USD)', 'Gain/Loss (USD)', 'Gain (%)', 'Notes'];
  const rows = holdings.map(h => [
    `"${h.symbol}"`,
    `"${h.name.replace(/"/g, '""')}"`,
    `"${h.category}"`,
    h.quantity,
    h.avgBuyPrice,
    h.currentPrice,
    store.getHoldingTotalValue(h).toFixed(2),
    store.getHoldingGain(h).toFixed(2),
    store.getHoldingGainPercent(h).toFixed(2),
    `"${(h.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  const dateStr = new Date().toISOString().slice(0, 10);
  link.setAttribute("download", `AuraInvest_Holdings_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.showToast('Holdings exported to CSV spreadsheet!', 'success');
}

export function importFromJSON(fileInput) {
  const file = fileInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      if (parsed.holdings && Array.isArray(parsed.holdings)) {
        store.state = {
          ...store.state,
          ...parsed
        };
        store.saveState();
        window.showToast('Portfolio imported successfully!', 'success');
        location.reload();
      } else {
        window.showToast('Invalid backup file format.', 'error');
      }
    } catch (err) {
      window.showToast('Failed to parse JSON file.', 'error');
    }
  };
  reader.readAsText(file);
}
