/**
 * AuraInvest - Interactive Chart.js Controller
 */

import { store, CURRENCIES } from './state.js';

let performanceChartInstance = null;
let allocationChartInstance = null;
let monthlyGrowthChartInstance = null;

// Category Color Palette
export const CATEGORY_COLORS = {
  stock: '#6366f1',       // Indigo
  crypto: '#f59e0b',      // Amber
  etf: '#10b981',         // Emerald Green
  'real-estate': '#a855f7',// Purple
  cash: '#94a3b8',        // Slate
  commodity: '#eab308',   // Gold
  other: '#06b6d4'        // Cyan
};

export const CATEGORY_LABELS = {
  stock: 'Stocks',
  crypto: 'Crypto',
  etf: 'ETFs & Funds',
  'real-estate': 'Real Estate',
  cash: 'Cash & Bonds',
  commodity: 'Commodities',
  other: 'Other'
};

/**
 * Initialize / Render the Portfolio Growth Performance Chart
 */
export function renderPerformanceChart(timeframe = '1Y') {
  const canvas = document.getElementById('performanceChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const currentNetWorth = store.getTotalNetWorth();
  const currentCurrency = store.getCurrency();
  const currencyInfo = CURRENCIES[currentCurrency] || CURRENCIES.USD;
  const rate = currencyInfo.rate;
  const symbol = currencyInfo.symbol;

  // Generate responsive labels and data points based on monthly history & timeframe
  const historyData = generateHistoricalSeries(timeframe, currentNetWorth);

  // Gradient fill for area chart
  const gradient = ctx.createLinearGradient(0, 0, 0, 300);
  gradient.addColorStop(0, 'rgba(99, 102, 241, 0.35)');
  gradient.addColorStop(0.7, 'rgba(99, 102, 241, 0.05)');
  gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');

  const chartData = {
    labels: historyData.labels,
    datasets: [
      {
        label: 'Net Worth',
        data: historyData.values.map(val => val * rate),
        borderColor: '#6366f1',
        borderWidth: 3,
        backgroundColor: gradient,
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#6366f1',
        pointBorderWidth: 2,
        pointRadius: historyData.values.length > 20 ? 0 : 4,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: '#6366f1',
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 2
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.92)',
        titleColor: '#94a3b8',
        bodyColor: '#ffffff',
        titleFont: { family: 'Plus Jakarta Sans', size: 12 },
        bodyFont: { family: 'JetBrains Mono', size: 14, weight: 'bold' },
        padding: 12,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (context) => {
            const val = context.raw;
            return `Portfolio: ${symbol}${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.04)', drawBorder: false },
        ticks: {
          color: '#64748b',
          font: { family: 'Plus Jakarta Sans', size: 11 },
          maxRotation: 0
        }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.04)', drawBorder: false },
        ticks: {
          color: '#64748b',
          font: { family: 'JetBrains Mono', size: 11 },
          callback: (value) => {
            if (value >= 1000000) return `${symbol}${(value / 1000000).toFixed(1)}M`;
            if (value >= 1000) return `${symbol}${(value / 1000).toFixed(0)}k`;
            return `${symbol}${value}`;
          }
        }
      }
    }
  };

  if (performanceChartInstance) {
    performanceChartInstance.destroy();
  }

  performanceChartInstance = new Chart(ctx, {
    type: 'line',
    data: chartData,
    options: options
  });
}

/**
 * Generate historical data series for chart
 */
function generateHistoricalSeries(timeframe, currentNetWorth) {
  const months = store.state.monthlyUpdates || [];
  
  if (timeframe === '1W') {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];
    const values = [];
    let start = currentNetWorth * 0.985;
    for (let i = 0; i < 6; i++) {
      start += (currentNetWorth - start) * (0.15 + Math.random() * 0.15);
      values.push(Math.round(start));
    }
    values.push(Math.round(currentNetWorth));
    return { labels: days, values };
  }

  if (timeframe === '1M') {
    const labels = [];
    const values = [];
    const points = 10;
    const start = currentNetWorth * 0.96;
    for (let i = 0; i < points; i++) {
      labels.push(`Day ${i * 3 + 1}`);
      const progress = i / (points - 1);
      const val = start + (currentNetWorth - start) * Math.pow(progress, 0.9) + (Math.random() - 0.5) * (currentNetWorth * 0.01);
      values.push(Math.round(val));
    }
    values[values.length - 1] = Math.round(currentNetWorth);
    return { labels, values };
  }

  if (timeframe === '3M') {
    const labels = ['3 Months Ago', '2 Months Ago', 'Last Month', 'Today'];
    const values = [
      Math.round(currentNetWorth * 0.91),
      Math.round(currentNetWorth * 0.94),
      Math.round(currentNetWorth * 0.97),
      Math.round(currentNetWorth)
    ];
    return { labels, values };
  }

  // 1Y or ALL: Use recorded monthly snapshots if available
  if (months.length >= 3) {
    const labels = months.map(m => {
      const [year, month] = m.monthYear.split('-');
      const date = new Date(year, parseInt(month) - 1);
      return date.toLocaleString('default', { month: 'short', year: '2-digit' });
    });
    const values = months.map(m => m.totalNetWorth);
    // ensure current value is represented
    if (labels.length > 0 && Math.abs(values[values.length - 1] - currentNetWorth) > 50) {
      labels.push('Now');
      values.push(Math.round(currentNetWorth));
    }
    return { labels, values };
  }

  // Fallback 1Y simulated curve
  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const values = [];
  const base = currentNetWorth * 0.78;
  for (let i = 0; i < 12; i++) {
    const factor = i / 11;
    values.push(Math.round(base + (currentNetWorth - base) * factor + (Math.sin(i) * base * 0.03)));
  }
  values[11] = Math.round(currentNetWorth);
  return { labels, values };
}

/**
 * Initialize / Render the Asset Allocation Doughnut Chart
 */
export function renderAllocationChart() {
  const canvas = document.getElementById('allocationChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const allocation = store.getAllocationByCategory();
  const currentCurrency = store.getCurrency();
  const currencyInfo = CURRENCIES[currentCurrency] || CURRENCIES.USD;
  const rate = currencyInfo.rate;
  const symbol = currencyInfo.symbol;

  if (allocation.length === 0) {
    if (allocationChartInstance) allocationChartInstance.destroy();
    return;
  }

  const labels = allocation.map(a => CATEGORY_LABELS[a.category] || a.category);
  const data = allocation.map(a => a.value * rate);
  const backgroundColors = allocation.map(a => CATEGORY_COLORS[a.category] || CATEGORY_COLORS.other);

  const chartData = {
    labels: labels,
    datasets: [
      {
        data: data,
        backgroundColor: backgroundColors,
        borderWidth: 2,
        borderColor: 'rgba(15, 23, 42, 0.8)',
        hoverOffset: 6
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.92)',
        titleColor: '#94a3b8',
        bodyColor: '#ffffff',
        titleFont: { family: 'Plus Jakarta Sans', size: 12 },
        bodyFont: { family: 'JetBrains Mono', size: 13, weight: 'bold' },
        padding: 10,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: (context) => {
            const val = context.raw;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
            return ` ${symbol}${val.toLocaleString(undefined, { maximumFractionDigits: 0 })} (${pct}%)`;
          }
        }
      }
    }
  };

  if (allocationChartInstance) {
    allocationChartInstance.destroy();
  }

  allocationChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: chartData,
    options: options
  });

  // Render allocation breakdown list below chart
  renderAllocationBreakdownList(allocation);
}

function renderAllocationBreakdownList(allocation) {
  const container = document.getElementById('allocationList');
  if (!container) return;

  const total = store.getTotalNetWorth();
  container.innerHTML = allocation.map(item => {
    const color = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.other;
    const label = CATEGORY_LABELS[item.category] || item.category;
    return `
      <div class="allocation-item">
        <div style="display: flex; align-items: center;">
          <span class="allocation-dot" style="background: ${color};"></span>
          <span>${label}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 10px;">
          <span class="mono-num" style="color: var(--text-secondary);">${store.formatMoney(item.value, true)}</span>
          <strong class="mono-num" style="min-width: 45px; text-align: right;">${item.percentage.toFixed(1)}%</strong>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Initialize / Render the Monthly Growth & Contributions Breakdown Bar Chart
 */
export function renderMonthlyGrowthChart() {
  const canvas = document.getElementById('monthlyGrowthChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const months = store.state.monthlyUpdates || [];
  const currentCurrency = store.getCurrency();
  const currencyInfo = CURRENCIES[currentCurrency] || CURRENCIES.USD;
  const rate = currencyInfo.rate;
  const symbol = currencyInfo.symbol;

  if (months.length === 0) {
    if (monthlyGrowthChartInstance) monthlyGrowthChartInstance.destroy();
    return;
  }

  const labels = months.map(m => {
    const [year, month] = m.monthYear.split('-');
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleString('default', { month: 'short', year: 'numeric' });
  });

  const contributionsData = months.map(m => m.contributions * rate);
  const marketGainData = months.map(m => m.marketGain * rate);

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: 'New Capital Invested',
        data: contributionsData,
        backgroundColor: '#6366f1',
        borderRadius: 6,
        barPercentage: 0.6
      },
      {
        label: 'Market Appreciation / Gain',
        data: marketGainData,
        backgroundColor: '#10b981',
        borderRadius: 6,
        barPercentage: 0.6
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          color: '#94a3b8',
          font: { family: 'Plus Jakarta Sans', size: 12, weight: '600' },
          boxWidth: 12,
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.92)',
        titleColor: '#94a3b8',
        bodyColor: '#ffffff',
        titleFont: { family: 'Plus Jakarta Sans', size: 12 },
        bodyFont: { family: 'JetBrains Mono', size: 13, weight: 'bold' },
        padding: 12,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: (context) => {
            return ` ${context.dataset.label}: ${symbol}${context.raw.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.04)', drawBorder: false },
        ticks: { color: '#64748b', font: { family: 'Plus Jakarta Sans', size: 11 } }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.04)', drawBorder: false },
        ticks: {
          color: '#64748b',
          font: { family: 'JetBrains Mono', size: 11 },
          callback: (value) => `${symbol}${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`
        }
      }
    }
  };

  if (monthlyGrowthChartInstance) {
    monthlyGrowthChartInstance.destroy();
  }

  monthlyGrowthChartInstance = new Chart(ctx, {
    type: 'bar',
    data: chartData,
    options: options
  });
}
