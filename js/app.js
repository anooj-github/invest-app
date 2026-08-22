/**
 * AuraInvest — Complete Portfolio & Investment Tracking Engine
 * Pure Vanilla JavaScript (Zero build steps, runs directly in any browser)
 * Fully integrated with Google Apps Script & Google Sheets backend.
 */

(function() {
  'use strict';

  // ==========================================================================
  // 1. CONFIGURATION & CONSTANTS
  // ==========================================================================
  const STORAGE_KEY = 'aurainvest_portfolio_state_v2_inr';

  // Currencies (relative to base INR ₹)
  const CURRENCIES = {
    INR: { symbol: '₹', rate: 1.0, label: 'INR (₹)' },
    USD: { symbol: '$', rate: 0.0116, label: 'USD ($)' },
    EUR: { symbol: '€', rate: 0.0106, label: 'EUR (€)' },
    GBP: { symbol: '£', rate: 0.0091, label: 'GBP (£)' },
    CAD: { symbol: 'CA$', rate: 0.0157, label: 'CAD ($)' },
    AUD: { symbol: 'A$', rate: 0.0175, label: 'AUD ($)' },
    JPY: { symbol: '¥', rate: 1.78, label: 'JPY (¥)' }
  };

  const CATEGORY_COLORS = {
    stock: '#6366f1',       // Indigo
    etf: '#10b981',         // Emerald Green (Mutual Funds / ETFs)
    commodity: '#eab308',   // Gold
    cash: '#06b6d4',        // Cyan / Liquid & Fixed
    'real-estate': '#a855f7',// Purple
    crypto: '#f59e0b',      // Amber
    other: '#94a3b8'
  };

  const CATEGORY_LABELS = {
    stock: 'Stocks',
    etf: 'Mutual Funds & ETFs',
    commodity: 'Gold & Silver',
    cash: 'Fixed Income & Cash',
    'real-estate': 'Real Estate',
    crypto: 'Crypto',
    other: 'Other'
  };

  // Live Marquee Assets in INR
  const TICKER_ASSETS = [
    { symbol: 'NIFTY 50', price: 24825.00, change: 0.72 },
    { symbol: 'SENSEX', price: 81350.00, change: 0.65 },
    { symbol: 'GOLDBEES', price: 131.30, change: 0.45 },
    { symbol: 'SILVERBEES', price: 232.93, change: -1.20 },
    { symbol: 'BPCL', price: 311.00, change: -0.85 },
    { symbol: 'SBI PSU FUND', price: 38.39, change: 1.45 },
    { symbol: 'HDFC FLEXI CAP', price: 2375.25, change: 0.80 },
    { symbol: 'METALIETF', price: 13.24, change: 1.10 },
    { symbol: 'IT ETF', price: 33.90, change: 0.35 }
  ];

  // User's Exact Aug-2026 Portfolio Dataset
  const DEFAULT_INITIAL_STATE = {
    preferences: {
      currency: 'INR',
      theme: 'dark',
      chartTimeframe: '1Y',
      googleAppsScriptUrl: 'https://script.google.com/macros/s/AKfycbwvrC2yL39zzFr0xXgG3r2cHPzziwS-_rVfSZAQpsaj49sjyutn_uL-gzX_wizg--GeWw/exec'
    },
    holdings: [
      // 1. Stocks & ETFs
      {
        id: 'h-silverbees',
        symbol: 'SILVERBEES',
        name: 'Nippon India Silver ETF',
        category: 'commodity',
        quantity: 15,
        avgBuyPrice: 281.67,
        currentPrice: 232.9333,
        dayChangePercent: -0.65,
        notes: 'Sector: Commodities - Silver | 41.65% of Stocks'
      },
      {
        id: 'h-goldbees',
        symbol: 'GOLDBEES',
        name: 'Nippon India Gold ETF',
        category: 'commodity',
        quantity: 20,
        avgBuyPrice: 127.15,
        currentPrice: 131.30,
        dayChangePercent: 0.50,
        notes: 'Sector: Commodities - Gold | 25% of Stocks'
      },
      {
        id: 'h-bpcl',
        symbol: 'BPCL',
        name: 'Bharat Petroleum Corp Ltd',
        category: 'stock',
        quantity: 5,
        avgBuyPrice: 365.20,
        currentPrice: 311.00,
        dayChangePercent: -0.80,
        notes: 'Sector: Oil & Gas | 18% of Stocks'
      },
      {
        id: 'h-rmdrip',
        symbol: 'RM DRIP',
        name: 'RM Drip & Sprinklers Systems',
        category: 'stock',
        quantity: 5,
        avgBuyPrice: 122.40,
        currentPrice: 29.40,
        dayChangePercent: -1.25,
        notes: 'Sector: Water | 6% of Stocks'
      },
      {
        id: 'h-metalietf',
        symbol: 'METALIETF',
        name: 'ICICI Prudential Nifty Metal ETF',
        category: 'etf',
        quantity: 50,
        avgBuyPrice: 12.04,
        currentPrice: 13.24,
        dayChangePercent: 1.15,
        notes: 'Sector: Metals & Mining | 6% of Stocks'
      },
      {
        id: 'h-itetf',
        symbol: 'NIPPON IT',
        name: 'Nippon India ETF Nifty IT',
        category: 'etf',
        quantity: 10,
        avgBuyPrice: 33.80,
        currentPrice: 33.90,
        dayChangePercent: 0.30,
        notes: 'Sector: IT Sector | 3% of Stocks'
      },

      // 2. Mutual Funds
      {
        id: 'h-sbipsu',
        symbol: 'SBI-PSU',
        name: 'SBI PSU Direct Plan',
        category: 'etf',
        quantity: 1386,
        avgBuyPrice: 35.71284,
        currentPrice: 38.39177,
        dayChangePercent: 0.95,
        notes: 'Type: PSU Equity Fund | 75% of Mutual Funds'
      },
      {
        id: 'h-hdfcflexi',
        symbol: 'HDFC-FLEXI',
        name: 'HDFC Flexi Cap Fund',
        category: 'etf',
        quantity: 4,
        avgBuyPrice: 2375.25,
        currentPrice: 2375.25,
        dayChangePercent: 0.40,
        notes: 'Type: Flexi Cap Equity | 14.40% of Mutual Funds'
      },
      {
        id: 'h-hdfcsmall',
        symbol: 'HDFC-SMALL',
        name: 'HDFC Small Cap Fund',
        category: 'etf',
        quantity: 46,
        avgBuyPrice: 152.15217,
        currentPrice: 161.21739,
        dayChangePercent: 0.70,
        notes: 'Type: Small Cap Equity | 10.60% of Mutual Funds'
      },

      // 3. Post Office & NPS
      {
        id: 'h-postoffice',
        symbol: 'POST-OFFICE',
        name: 'Post Office Scheme (aggr)',
        category: 'cash',
        quantity: 1,
        avgBuyPrice: 50410.00,
        currentPrice: 50410.00,
        dayChangePercent: 0.00,
        notes: 'Government Guaranteed Fixed Income Post Office Scheme'
      },
      {
        id: 'h-nps',
        symbol: 'NPS',
        name: 'National Pension System (NPS)',
        category: 'cash',
        quantity: 1,
        avgBuyPrice: 16092.00,
        currentPrice: 16092.00,
        dayChangePercent: 0.00,
        notes: 'Tier-1 Pension & Retirement Account'
      },

      // 4. Emergency Fund & Goals Savings
      {
        id: 'h-emergency',
        symbol: 'EMERGENCY',
        name: 'Emergency Fund (Liquid Savings)',
        category: 'cash',
        quantity: 1,
        avgBuyPrice: 170000.00,
        currentPrice: 170000.00,
        dayChangePercent: 0.00,
        notes: 'Liquid Bank Reserve (52.23% of overall portfolio)'
      },
      {
        id: 'h-goalsavings',
        symbol: 'GOAL-SAVINGS',
        name: 'Goals Savings Account',
        category: 'cash',
        quantity: 1,
        avgBuyPrice: 10000.00,
        currentPrice: 10000.00,
        dayChangePercent: 0.00,
        notes: 'Dedicated short-term goal buffer'
      }
    ],
    goals: [
      {
        id: 'g-1',
        title: 'Emergency Liquidity Buffer (₹2 Lakhs)',
        targetAmount: 200000,
        targetDate: '2026-12-31',
        category: 'cash',
        notes: 'Maintain at least 6 months living expenses in liquid form',
        icon: '🛡️'
      },
      {
        id: 'g-2',
        title: 'First ₹5,00,000 Portfolio Milestone',
        targetAmount: 500000,
        targetDate: '2027-06-30',
        category: 'networth',
        notes: 'Next major wealth accumulation milestone',
        icon: '🎯'
      },
      {
        id: 'g-3',
        title: '₹1,00,000 Mutual Funds Milestone',
        targetAmount: 100000,
        targetDate: '2027-03-31',
        category: 'etf',
        notes: 'Build compounding long-term equity foundation',
        icon: '📈'
      },
      {
        id: 'g-4',
        title: 'Dedicated Goal Savings Buffer',
        targetAmount: 50000,
        targetDate: '2027-12-31',
        category: 'cash',
        notes: 'Short term vacation & lifestyle fund',
        icon: '💰'
      }
    ],
    monthlyUpdates: [
      {
        id: 'm-2026-08',
        monthYear: '2026-08',
        totalNetWorth: 325453,
        contributions: 322645,
        marketGain: 2808,
        notes: 'August 2026 baseline portfolio recorded. Total Invested: ₹3,22,645 | Net Worth: ₹3,25,453 | Net Gain: +₹2,808 (+0.87%).'
      }
    ]
  };

  // ==========================================================================
  // 2. STATE STORE & FINANCIAL CALCULATOR
  // ==========================================================================
  class StateStore {
    constructor() {
      this.state = this.load();
      this.listeners = [];
    }

    load() {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          const mergedPreferences = {
            ...DEFAULT_INITIAL_STATE.preferences,
            ...(parsed.preferences || {})
          };
          if (!mergedPreferences.googleAppsScriptUrl) {
            mergedPreferences.googleAppsScriptUrl = DEFAULT_INITIAL_STATE.preferences.googleAppsScriptUrl;
          }
          return {
            ...DEFAULT_INITIAL_STATE,
            ...parsed,
            preferences: mergedPreferences
          };
        }
      } catch (e) {
        console.warn('LocalStorage load error, using default state:', e);
      }
      return JSON.parse(JSON.stringify(DEFAULT_INITIAL_STATE));
    }

    save() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      } catch (e) {
        console.error('LocalStorage save error:', e);
      }
      this.notify();
    }

    subscribe(fn) {
      this.listeners.push(fn);
    }

    notify() {
      this.listeners.forEach(fn => fn(this.state));
    }

    getCurrency() {
      return this.state.preferences.currency || 'INR';
    }

    setCurrency(code) {
      if (CURRENCIES[code]) {
        this.state.preferences.currency = code;
        this.save();
      }
    }

    getTheme() {
      return this.state.preferences.theme || 'dark';
    }

    setTheme(theme) {
      this.state.preferences.theme = theme;
      document.documentElement.setAttribute('data-theme', theme);
      this.save();
    }

    getGoogleAppsScriptUrl() {
      return this.state.preferences.googleAppsScriptUrl || '';
    }

    setGoogleAppsScriptUrl(url) {
      this.state.preferences.googleAppsScriptUrl = url.trim();
      this.save();
    }

    formatMoney(amountINR, compact = false) {
      const cur = CURRENCIES[this.getCurrency()] || CURRENCIES.INR;
      const converted = (amountINR || 0) * cur.rate;

      // Special Indian compact notation (Lakhs & Crores for INR)
      if (this.getCurrency() === 'INR') {
        if (compact && Math.abs(converted) >= 10000000) {
          return `₹${(converted / 10000000).toFixed(2)} Cr`;
        }
        if (compact && Math.abs(converted) >= 100000) {
          return `₹${(converted / 100000).toFixed(2)} L`;
        }
        return `₹${Math.round(converted).toLocaleString('en-IN')}`;
      }

      if (compact && Math.abs(converted) >= 1000) {
        const formatter = new Intl.NumberFormat('en-US', {
          notation: 'compact',
          compactDisplay: 'short',
          maximumFractionDigits: 1
        });
        return `${cur.symbol}${formatter.format(converted)}`;
      }

      const formatter = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      return `${cur.symbol}${formatter.format(converted)}`;
    }

    formatPercent(val) {
      const sign = val > 0 ? '+' : '';
      return `${sign}${(val || 0).toFixed(2)}%`;
    }

    // Holding computations
    getHoldingTotalValue(h) {
      return (h.quantity || 0) * (h.currentPrice || 0);
    }

    getHoldingCostBasis(h) {
      return (h.quantity || 0) * (h.avgBuyPrice || 0);
    }

    getHoldingGain(h) {
      return this.getHoldingTotalValue(h) - this.getHoldingCostBasis(h);
    }

    getHoldingGainPercent(h) {
      const cost = this.getHoldingCostBasis(h);
      if (cost === 0) return 0;
      return (this.getHoldingGain(h) / cost) * 100;
    }

    // Portfolio overall computations
    getTotalNetWorth() {
      return this.state.holdings.reduce((sum, h) => sum + this.getHoldingTotalValue(h), 0);
    }

    getTotalCostBasis() {
      return this.state.holdings.reduce((sum, h) => sum + this.getHoldingCostBasis(h), 0);
    }

    getTotalGain() {
      return this.getTotalNetWorth() - this.getTotalCostBasis();
    }

    getTotalGainPercent() {
      const cost = this.getTotalCostBasis();
      if (cost === 0) return 0;
      return (this.getTotalGain() / cost) * 100;
    }

    getTodayChange() {
      let dayDollarChange = 0;
      this.state.holdings.forEach(h => {
        const val = this.getHoldingTotalValue(h);
        const dayPct = (h.dayChangePercent || 0) / 100;
        dayDollarChange += val * dayPct;
      });
      const totalVal = this.getTotalNetWorth();
      const dayPctChange = totalVal > 0 ? (dayDollarChange / totalVal) * 100 : 0;
      return { dollar: dayDollarChange, percent: dayPctChange };
    }

    getAllocationByCategory() {
      const totals = {};
      const totalNetWorth = this.getTotalNetWorth();

      this.state.holdings.forEach(h => {
        const cat = h.category || 'other';
        totals[cat] = (totals[cat] || 0) + this.getHoldingTotalValue(h);
      });

      const categories = Object.keys(totals).map(cat => ({
        category: cat,
        value: totals[cat],
        percentage: totalNetWorth > 0 ? (totals[cat] / totalNetWorth) * 100 : 0
      }));

      categories.sort((a, b) => b.value - a.value);
      return categories;
    }

    getTopPerformer() {
      if (!this.state.holdings.length) return null;
      let top = this.state.holdings[0];
      let maxGain = this.getHoldingGain(top);

      this.state.holdings.forEach(h => {
        const gain = this.getHoldingGain(h);
        if (gain > maxGain) {
          maxGain = gain;
          top = h;
        }
      });
      return { holding: top, gainAmount: maxGain, gainPercent: this.getHoldingGainPercent(top) };
    }

    // CRUD: Holdings
    addHolding(data) {
      const newHolding = {
        id: 'h-' + Date.now(),
        symbol: (data.symbol || '').toUpperCase().trim(),
        name: data.name.trim(),
        category: data.category || 'stock',
        quantity: parseFloat(data.quantity) || 0,
        avgBuyPrice: parseFloat(data.avgBuyPrice) || 0,
        currentPrice: parseFloat(data.currentPrice) || parseFloat(data.avgBuyPrice) || 0,
        dayChangePercent: parseFloat(data.dayChangePercent) || (Math.random() * 2.2 - 0.7),
        notes: data.notes || ''
      };
      this.state.holdings.push(newHolding);
      this.save();
      return newHolding;
    }

    updateHolding(id, data) {
      const idx = this.state.holdings.findIndex(h => h.id === id);
      if (idx !== -1) {
        this.state.holdings[idx] = {
          ...this.state.holdings[idx],
          ...data,
          symbol: (data.symbol || this.state.holdings[idx].symbol).toUpperCase().trim(),
          quantity: parseFloat(data.quantity !== undefined ? data.quantity : this.state.holdings[idx].quantity),
          avgBuyPrice: parseFloat(data.avgBuyPrice !== undefined ? data.avgBuyPrice : this.state.holdings[idx].avgBuyPrice),
          currentPrice: parseFloat(data.currentPrice !== undefined ? data.currentPrice : this.state.holdings[idx].currentPrice)
        };
        this.save();
        return this.state.holdings[idx];
      }
      return null;
    }

    deleteHolding(id) {
      this.state.holdings = this.state.holdings.filter(h => h.id !== id);
      this.save();
    }

    // CRUD: Goals
    addGoal(data) {
      const newGoal = {
        id: 'g-' + Date.now(),
        title: data.title.trim(),
        targetAmount: parseFloat(data.targetAmount) || 0,
        targetDate: data.targetDate || '',
        category: data.category || 'networth',
        notes: data.notes || '',
        icon: data.icon || '🎯',
        isCompleted: false
      };
      this.state.goals.push(newGoal);
      this.save();
      return newGoal;
    }

    updateGoal(id, data) {
      const idx = this.state.goals.findIndex(g => g.id === id);
      if (idx !== -1) {
        this.state.goals[idx] = {
          ...this.state.goals[idx],
          ...data,
          targetAmount: parseFloat(data.targetAmount !== undefined ? data.targetAmount : this.state.goals[idx].targetAmount)
        };
        this.save();
        return this.state.goals[idx];
      }
      return null;
    }

    deleteGoal(id) {
      this.state.goals = this.state.goals.filter(g => g.id !== id);
      this.save();
    }

    // CRUD: Monthly Updates
    addMonthlyUpdate(data) {
      const newUpdate = {
        id: 'm-' + (data.monthYear || Date.now()),
        monthYear: data.monthYear,
        totalNetWorth: parseFloat(data.totalNetWorth) || 0,
        contributions: parseFloat(data.contributions) || 0,
        marketGain: parseFloat(data.marketGain) || 0,
        notes: data.notes || ''
      };

      // Replace if month already exists, otherwise add
      const existingIdx = this.state.monthlyUpdates.findIndex(m => m.monthYear === data.monthYear);
      if (existingIdx !== -1) {
        this.state.monthlyUpdates[existingIdx] = newUpdate;
      } else {
        this.state.monthlyUpdates.push(newUpdate);
      }

      this.state.monthlyUpdates.sort((a, b) => a.monthYear.localeCompare(b.monthYear));
      this.save();
      return newUpdate;
    }

    updateMonthlyUpdate(id, data) {
      const idx = this.state.monthlyUpdates.findIndex(m => m.id === id);
      if (idx !== -1) {
        this.state.monthlyUpdates[idx] = {
          ...this.state.monthlyUpdates[idx],
          ...data,
          totalNetWorth: parseFloat(data.totalNetWorth !== undefined ? data.totalNetWorth : this.state.monthlyUpdates[idx].totalNetWorth),
          contributions: parseFloat(data.contributions !== undefined ? data.contributions : this.state.monthlyUpdates[idx].contributions),
          marketGain: parseFloat(data.marketGain !== undefined ? data.marketGain : this.state.monthlyUpdates[idx].marketGain)
        };
        this.state.monthlyUpdates.sort((a, b) => a.monthYear.localeCompare(b.monthYear));
        this.save();
        return this.state.monthlyUpdates[idx];
      }
      return null;
    }

    deleteMonthlyUpdate(id) {
      this.state.monthlyUpdates = this.state.monthlyUpdates.filter(m => m.id !== id);
      this.save();
    }

    resetToDemoData() {
      this.state = JSON.parse(JSON.stringify(DEFAULT_INITIAL_STATE));
      this.save();
    }

    clearAllData() {
      this.state = {
        preferences: { currency: 'INR', theme: 'dark', chartTimeframe: '1Y', googleAppsScriptUrl: '' },
        holdings: [],
        goals: [],
        monthlyUpdates: []
      };
      this.save();
    }
  }

  const store = new StateStore();

  // ==========================================================================
  // 3. GOOGLE APPS SCRIPT BACKEND SYNC ENGINE
  // ==========================================================================
  async function pushMonthlyUpdateToGoogleSheets(updateData, holdingsData) {
    const url = store.getGoogleAppsScriptUrl();
    if (!url) return false;

    try {
      window.showToast('Syncing with Google Sheets...', 'info');
      const payload = {
        action: 'saveMonthlyUpdate',
        updateData: {
          ...updateData,
          holdings: holdingsData || store.state.holdings
        }
      };

      await fetch(url, {
        method: 'POST',
        mode: 'no-cors', // standard for GAS web apps across origins
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      window.showToast('✅ Synced with Google Sheets successfully!', 'success');
      return true;
    } catch (err) {
      console.error('Google Sheets sync error:', err);
      window.showToast('Google Sheets sync encountered an issue. Local save successful.', 'error');
      return false;
    }
  }

  async function pushAllToGoogleSheets() {
    const url = store.getGoogleAppsScriptUrl();
    if (!url) {
      window.showToast('Please enter your Google Apps Script URL first.', 'error');
      return;
    }

    try {
      window.showToast('Uploading full portfolio to Google Sheets...', 'info');
      const payload = {
        action: 'syncAll',
        holdings: store.state.holdings,
        monthlyUpdates: store.state.monthlyUpdates,
        goals: store.state.goals
      };

      await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      window.showToast('✅ Full portfolio synced to Google Sheets!', 'success');
      updateSheetsStatusBadge();
    } catch (err) {
      console.error('GAS push error:', err);
      window.showToast('Failed to sync to Google Sheets.', 'error');
    }
  }

  async function fetchFromGoogleSheets() {
    const url = store.getGoogleAppsScriptUrl();
    if (!url) {
      window.showToast('Please enter your Google Apps Script URL first.', 'error');
      return;
    }

    try {
      window.showToast('Fetching latest data from Google Sheets...', 'info');
      const res = await fetch(url);
      const result = await res.json();

      if (result.status === 'success' && result.data) {
        if (result.data.holdings && result.data.holdings.length > 0) {
          store.state.holdings = result.data.holdings;
        }
        if (result.data.monthlyUpdates && result.data.monthlyUpdates.length > 0) {
          store.state.monthlyUpdates = result.data.monthlyUpdates;
        }
        if (result.data.goals && result.data.goals.length > 0) {
          store.state.goals = result.data.goals;
        }
        store.save();
        window.showToast('✅ Imported fresh data from Google Sheets!', 'success');
        updateAllViews();
      } else {
        window.showToast(result.message || 'No data found in Google Sheets.', 'info');
      }
    } catch (err) {
      console.error('GAS fetch error:', err);
      window.showToast('Could not fetch from Google Sheets URL. Check permissions (set to Anyone).', 'error');
    }
  }

  function updateSheetsStatusBadge() {
    const badge = document.getElementById('sheetsStatusBadge');
    if (!badge) return;
    const url = store.getGoogleAppsScriptUrl();
    if (url) {
      badge.className = 'sheets-badge connected';
      badge.innerHTML = '<span>🟢</span> <span>Google Sheets Connected</span>';
    } else {
      badge.className = 'sheets-badge offline';
      badge.innerHTML = '<span>☁️</span> <span>Connect Google Sheets</span>';
    }
  }

  // ==========================================================================
  // 4. CHART.JS CONTROLLERS
  // ==========================================================================
  let performanceChartInstance = null;
  let allocationChartInstance = null;
  let monthlyGrowthChartInstance = null;

  function renderPerformanceChart(timeframe = '1Y') {
    const canvas = document.getElementById('performanceChart');
    if (!canvas || typeof Chart === 'undefined') return;

    const ctx = canvas.getContext('2d');
    const currentNetWorth = store.getTotalNetWorth();
    const cur = CURRENCIES[store.getCurrency()] || CURRENCIES.INR;
    const rate = cur.rate;
    const symbol = cur.symbol;

    const historyData = generateHistoricalSeries(timeframe, currentNetWorth);

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
              return `Portfolio: ${store.formatMoney(val / rate)}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.04)', drawBorder: false },
          ticks: { color: '#64748b', font: { family: 'Plus Jakarta Sans', size: 11 }, maxRotation: 0 }
        },
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.04)', drawBorder: false },
          ticks: {
            color: '#64748b',
            font: { family: 'JetBrains Mono', size: 11 },
            callback: (value) => store.formatMoney(value / rate, true)
          }
        }
      }
    };

    if (performanceChartInstance) performanceChartInstance.destroy();
    performanceChartInstance = new Chart(ctx, { type: 'line', data: chartData, options: options });
  }

  function generateHistoricalSeries(timeframe, currentNetWorth) {
    const months = store.state.monthlyUpdates || [];

    if (timeframe === '1W') {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];
      const values = [];
      let start = currentNetWorth * 0.995;
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
      const start = currentNetWorth * 0.985;
      for (let i = 0; i < points; i++) {
        labels.push(`Day ${i * 3 + 1}`);
        const progress = i / (points - 1);
        const val = start + (currentNetWorth - start) * Math.pow(progress, 0.9) + (Math.random() - 0.5) * (currentNetWorth * 0.005);
        values.push(Math.round(val));
      }
      values[values.length - 1] = Math.round(currentNetWorth);
      return { labels, values };
    }

    if (timeframe === '3M') {
      const labels = ['Jun 2026', 'Jul 2026', 'Aug 2026', 'Current'];
      const values = [
        Math.round(currentNetWorth * 0.94),
        Math.round(currentNetWorth * 0.97),
        Math.round(currentNetWorth * 0.99),
        Math.round(currentNetWorth)
      ];
      return { labels, values };
    }

    if (months.length >= 2) {
      const labels = months.map(m => {
        const [year, month] = m.monthYear.split('-');
        const date = new Date(year, parseInt(month) - 1);
        return date.toLocaleString('default', { month: 'short', year: '2-digit' });
      });
      const values = months.map(m => m.totalNetWorth);
      return { labels, values };
    }

    // Default 1Y curve
    const labels = ['Sep 25', 'Nov 25', 'Jan 26', 'Mar 26', 'May 26', 'Jul 26', 'Aug 26 (Current)'];
    const values = [
      Math.round(currentNetWorth * 0.72),
      Math.round(currentNetWorth * 0.78),
      Math.round(currentNetWorth * 0.83),
      Math.round(currentNetWorth * 0.89),
      Math.round(currentNetWorth * 0.94),
      Math.round(currentNetWorth * 0.98),
      Math.round(currentNetWorth)
    ];
    return { labels, values };
  }

  function renderAllocationChart() {
    const canvas = document.getElementById('allocationChart');
    if (!canvas || typeof Chart === 'undefined') return;

    const ctx = canvas.getContext('2d');
    const allocation = store.getAllocationByCategory();
    const cur = CURRENCIES[store.getCurrency()] || CURRENCIES.INR;
    const rate = cur.rate;
    const symbol = cur.symbol;

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
              return ` ${store.formatMoney(val / rate)} (${pct}%)`;
            }
          }
        }
      }
    };

    if (allocationChartInstance) allocationChartInstance.destroy();
    allocationChartInstance = new Chart(ctx, { type: 'doughnut', data: chartData, options: options });

    renderAllocationBreakdownList(allocation);
  }

  function renderAllocationBreakdownList(allocation) {
    const container = document.getElementById('allocationList');
    if (!container) return;

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

  function renderMonthlyGrowthChart() {
    const canvas = document.getElementById('monthlyGrowthChart');
    if (!canvas || typeof Chart === 'undefined') return;

    const ctx = canvas.getContext('2d');
    const months = store.state.monthlyUpdates || [];
    const cur = CURRENCIES[store.getCurrency()] || CURRENCIES.INR;
    const rate = cur.rate;

    if (months.length === 0) {
      if (monthlyGrowthChartInstance) monthlyGrowthChartInstance.destroy();
      return;
    }

    const labels = months.map(m => {
      const [year, month] = m.monthYear.split('-');
      const date = new Date(year, parseInt(month) - 1);
      return date.toLocaleString('default', { month: 'short', year: 'numeric' });
    });

    const netWorthData = months.map(m => m.totalNetWorth * rate);
    const contributionsData = months.map(m => m.contributions * rate);
    const marketGainData = months.map(m => m.marketGain * rate);

    const chartData = {
      labels: labels,
      datasets: [
        {
          label: 'Total Net Worth',
          data: netWorthData,
          backgroundColor: '#6366f1',
          borderRadius: 6,
          barPercentage: 0.5
        },
        {
          label: 'Market Appreciation / Gain',
          data: marketGainData,
          backgroundColor: '#10b981',
          borderRadius: 6,
          barPercentage: 0.5
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
            label: (context) => ` ${context.dataset.label}: ${store.formatMoney(context.raw / rate)}`
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
            callback: (value) => store.formatMoney(value / rate, true)
          }
        }
      }
    };

    if (monthlyGrowthChartInstance) monthlyGrowthChartInstance.destroy();
    monthlyGrowthChartInstance = new Chart(ctx, { type: 'bar', data: chartData, options: options });
  }

  // ==========================================================================
  // 5. VIEW RENDERERS & MONTHLY ENTRY CONTROLLER
  // ==========================================================================
  let activeView = 'overview';
  let activeTimeframe = '1Y';
  let activeCategoryFilter = 'all';
  let searchQuery = '';
  let currentSortColumn = 'value';
  let currentSortDirection = 'desc';

  function renderHoldingsTable() {
    const tbody = document.getElementById('holdingsTableBody');
    const countBadge = document.getElementById('holdingsCountBadge');
    if (!tbody) return;

    let holdings = [...store.state.holdings];
    const totalNetWorth = store.getTotalNetWorth();

    if (activeCategoryFilter !== 'all') {
      holdings = holdings.filter(h => h.category === activeCategoryFilter);
    }

    if (searchQuery) {
      holdings = holdings.filter(h =>
        h.name.toLowerCase().includes(searchQuery) ||
        h.symbol.toLowerCase().includes(searchQuery) ||
        (h.notes && h.notes.toLowerCase().includes(searchQuery))
      );
    }

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

    if (countBadge) countBadge.textContent = `${holdings.length} Holdings`;

    if (holdings.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9">
            <div class="empty-state">
              <div class="empty-state-icon">💼</div>
              <h4>No holdings found</h4>
              <p>${searchQuery ? 'Try changing your search query or category filter.' : 'Add your first stock, mutual fund, or asset.'}</p>
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
                ${h.dayChangePercent >= 0 ? '▲' : '▼'} ${Math.abs(h.dayChangePercent).toFixed(2)}%
              </div>
            ` : ''}
          </td>
          <td class="mono-num">
            <strong style="font-size: 0.95rem;">${store.formatMoney(totalVal)}</strong>
            <div style="font-size: 0.75rem; color: var(--text-muted);">
              Invested: ${store.formatMoney(costBasis)}
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
            <strong>${allocationPct.toFixed(2)}%</strong>
            <div style="width: 45px; height: 4px; background: rgba(255,255,255,0.08); border-radius: 2px; margin-top: 4px;">
              <div style="width: ${Math.min(100, allocationPct)}%; height: 100%; background: var(--accent-primary); border-radius: 2px;"></div>
            </div>
          </td>
          <td>
            <div class="row-actions">
              <button class="action-icon-btn" title="Edit Holding" onclick="window.editHolding('${h.id}')">✏️</button>
              <button class="action-icon-btn delete" title="Delete Holding" onclick="window.confirmDeleteHolding('${h.id}', '${escapeHtml(h.name)}')">🗑️</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  function renderGoalsView() {
    const container = document.getElementById('goalsGrid');
    const countBadge = document.getElementById('goalsCountBadge');
    if (!container) return;

    const goals = store.state.goals || [];
    const totalNetWorth = store.getTotalNetWorth();

    if (countBadge) countBadge.textContent = `${goals.length} Goals`;

    if (goals.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1;">
          <div class="glass-card empty-state">
            <div class="empty-state-icon">🎯</div>
            <h4>No goals set yet</h4>
            <p>Create your first milestone, emergency liquidity buffer, or wealth target.</p>
            <button class="quick-btn btn-primary" style="width: auto; margin-top: 8px;" onclick="window.openGoalModal()">
              <span>+ Create Goal</span>
            </button>
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = goals.map(g => {
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

      let dateText = 'Ongoing';
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
                  ${progressPct.toFixed(1)}% ${isCompleted ? '🎉 Reached!' : ''}
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
                  ${isCompleted ? 'Goal Reached' : store.formatMoney(remaining)}
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

  function renderMonthlyView() {
    const timelineContainer = document.getElementById('monthlyTimeline');
    const countBadge = document.getElementById('monthlyCountBadge');
    if (!timelineContainer) return;

    const updates = [...(store.state.monthlyUpdates || [])];
    updates.sort((a, b) => b.monthYear.localeCompare(a.monthYear));

    if (countBadge) countBadge.textContent = `${updates.length} Months Tracked`;

    renderMonthlyGrowthChart();

    if (updates.length === 0) {
      timelineContainer.innerHTML = `
        <div class="glass-card empty-state">
          <div class="empty-state-icon">📅</div>
          <h4>No monthly updates recorded</h4>
          <p>Record your monthly portfolio snapshot to track contributions, market gains, and personal notes.</p>
          <button class="quick-btn btn-primary" style="width: auto; margin-top: 8px;" onclick="window.switchView('add-monthly')">
            <span>+ Add Monthly Update</span>
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
              <span>Total Principal Invested</span>
              <strong class="mono-num" style="color: var(--accent-primary);">${store.formatMoney(m.contributions)}</strong>
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

  // ==========================================================================
  // 6. DEDICATED "ADD MONTHLY UPDATE" TAB CONTROLLER
  // ==========================================================================
  function renderAddMonthlyView() {
    const container = document.getElementById('monthlyEntryFormContainer');
    if (!container) return;

    // Set default month to next month (e.g. Sep 2026) or current
    const monthInput = document.getElementById('entryMonthSelect');
    if (monthInput && !monthInput.value) {
      monthInput.value = '2026-09';
    }

    const holdings = store.state.holdings || [];

    // Group holdings by category for clean user-friendly entry
    const stocks = holdings.filter(h => h.category === 'stock' || h.category === 'commodity' || (h.category === 'etf' && !h.name.includes('Fund') && !h.name.includes('Plan')));
    const mutualFunds = holdings.filter(h => h.name.includes('Fund') || h.name.includes('Plan') || h.category === 'etf' && !stocks.includes(h));
    const fixedAndSchemes = holdings.filter(h => h.id === 'h-postoffice' || h.id === 'h-nps');
    const emergencyAndSavings = holdings.filter(h => h.id === 'h-emergency' || h.id === 'h-goalsavings');
    const remaining = holdings.filter(h => !stocks.includes(h) && !mutualFunds.includes(h) && !fixedAndSchemes.includes(h) && !emergencyAndSavings.includes(h));

    function renderGroupRows(groupItems) {
      if (groupItems.length === 0) return '<p style="font-size: 0.82rem; color: var(--text-muted); padding: 8px;">No items in this category.</p>';
      return groupItems.map(h => {
        const totalVal = store.getHoldingTotalValue(h);
        const costBasis = store.getHoldingCostBasis(h);
        return `
          <div class="entry-item-row" data-holding-id="${h.id}">
            <div>
              <strong style="display: block; font-size: 0.9rem;">${escapeHtml(h.name)}</strong>
              <span style="font-size: 0.75rem; color: var(--text-muted);">${escapeHtml(h.symbol)}</span>
            </div>
            <div>
              <label style="font-size: 0.7rem; color: var(--text-muted); display: block;">Units</label>
              <input type="number" step="any" class="entry-input-sm entry-qty" value="${h.quantity}">
            </div>
            <div>
              <label style="font-size: 0.7rem; color: var(--text-muted); display: block;">Total Invested (₹)</label>
              <input type="number" step="any" class="entry-input-sm entry-invested" value="${Math.round(costBasis)}">
            </div>
            <div>
              <label style="font-size: 0.7rem; color: var(--accent-cyan); display: block; font-weight: 700;">Current Value (₹) *</label>
              <input type="number" step="any" class="entry-input-sm entry-current-val" value="${Math.round(totalVal)}" style="border-color: rgba(6, 182, 212, 0.4);">
            </div>
            <div style="text-align: right;">
              <span class="entry-row-diff mono-num" style="font-size: 0.85rem; font-weight: 700;">
                ${store.formatMoney(totalVal - costBasis)}
              </span>
            </div>
          </div>
        `;
      }).join('');
    }

    container.innerHTML = `
      <div class="entry-sections-grid">
        <!-- 1. Stocks & ETFs -->
        <div class="glass-card entry-section-card stocks">
          <div class="card-header">
            <h3 class="card-title"><span>📈</span> 1. Stocks & ETFs</h3>
            <span class="card-subtitle">Update Current Value for each Stock/ETF</span>
          </div>
          <div class="entry-group-list" id="entryGroupStocks">
            ${renderGroupRows(stocks)}
          </div>
        </div>

        <!-- 2. Mutual Funds -->
        <div class="glass-card entry-section-card funds">
          <div class="card-header">
            <h3 class="card-title"><span>💼</span> 2. Mutual Funds</h3>
            <span class="card-subtitle">Update Current Portfolio Value for each Mutual Fund</span>
          </div>
          <div class="entry-group-list" id="entryGroupFunds">
            ${renderGroupRows(mutualFunds)}
          </div>
        </div>

        <!-- 3. Post Office Scheme & NPS -->
        <div class="glass-card entry-section-card fixed">
          <div class="card-header">
            <h3 class="card-title"><span>🏛️</span> 3. Post Office Scheme & NPS</h3>
            <span class="card-subtitle">Update Balance & Invested Amount</span>
          </div>
          <div class="entry-group-list" id="entryGroupFixed">
            ${renderGroupRows(fixedAndSchemes)}
          </div>
        </div>

        <!-- 4. Emergency Fund & Goals Savings -->
        <div class="glass-card entry-section-card savings">
          <div class="card-header">
            <h3 class="card-title"><span>🛡️</span> 4. Emergency Fund & Goals Savings</h3>
            <span class="card-subtitle">Liquid Reserve & Goals Buffer Balance</span>
          </div>
          <div class="entry-group-list" id="entryGroupSavings">
            ${renderGroupRows(emergencyAndSavings)}
          </div>
        </div>

        ${remaining.length > 0 ? `
          <div class="glass-card entry-section-card">
            <div class="card-header">
              <h3 class="card-title"><span>✨</span> 5. Other Assets</h3>
            </div>
            <div class="entry-group-list">
              ${renderGroupRows(remaining)}
            </div>
          </div>
        ` : ''}

        <!-- 5. Monthly Notes & Additional Contribution -->
        <div class="glass-card">
          <div class="card-header">
            <h3 class="card-title"><span>📝</span> Monthly Notes & Review</h3>
            <span class="card-subtitle">Reflections on performance and investments made</span>
          </div>
          <div class="form-group">
            <textarea id="entryMonthlyNotes" class="form-textarea" placeholder="e.g. Added SIPs to HDFC Flexi Cap and bought 5 more units of SILVERBEES during market correction..."></textarea>
          </div>
        </div>
      </div>
    `;

    // Attach live recalculation listeners to all input boxes
    container.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', calculateLiveMonthlyEntryTotals);
    });

    calculateLiveMonthlyEntryTotals();
  }

  function calculateLiveMonthlyEntryTotals() {
    let totalInvested = 0;
    let totalCurrentValue = 0;

    document.querySelectorAll('.entry-item-row').forEach(row => {
      const investedInput = row.querySelector('.entry-invested');
      const valInput = row.querySelector('.entry-current-val');
      const diffEl = row.querySelector('.entry-row-diff');

      const invested = parseFloat(investedInput ? investedInput.value : 0) || 0;
      const currentVal = parseFloat(valInput ? valInput.value : 0) || 0;
      const diff = currentVal - invested;

      totalInvested += invested;
      totalCurrentValue += currentVal;

      if (diffEl) {
        diffEl.textContent = `${diff >= 0 ? '+' : ''}${store.formatMoney(diff)}`;
        diffEl.style.color = diff >= 0 ? 'var(--success)' : 'var(--danger)';
      }
    });

    const totalGain = totalCurrentValue - totalInvested;
    const gainPct = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

    // Update live banner stats
    const bannerNetWorth = document.getElementById('entryLiveNetWorth');
    const bannerInvested = document.getElementById('entryLiveInvested');
    const bannerGain = document.getElementById('entryLiveGain');

    if (bannerNetWorth) bannerNetWorth.textContent = store.formatMoney(totalCurrentValue);
    if (bannerInvested) bannerInvested.textContent = store.formatMoney(totalInvested);
    if (bannerGain) {
      bannerGain.textContent = `${totalGain >= 0 ? '+' : ''}${store.formatMoney(totalGain)} (${store.formatPercent(gainPct)})`;
      bannerGain.style.color = totalGain >= 0 ? 'var(--success)' : 'var(--danger)';
    }
  }

  async function handleSaveMonthlyEntry() {
    const monthSelect = document.getElementById('entryMonthSelect');
    const monthYear = monthSelect ? monthSelect.value : '';
    if (!monthYear) {
      window.showToast('Please select a Month & Year.', 'error');
      return;
    }

    const updatedHoldings = [];
    let totalInvested = 0;
    let totalNetWorth = 0;

    document.querySelectorAll('.entry-item-row').forEach(row => {
      const id = row.dataset.holdingId;
      const holding = store.state.holdings.find(h => h.id === id);
      if (!holding) return;

      const qty = parseFloat(row.querySelector('.entry-qty').value) || holding.quantity;
      const invested = parseFloat(row.querySelector('.entry-invested').value) || (qty * holding.avgBuyPrice);
      const currentVal = parseFloat(row.querySelector('.entry-current-val').value) || (qty * holding.currentPrice);

      const avgBuyPrice = qty > 0 ? (invested / qty) : holding.avgBuyPrice;
      const currentPrice = qty > 0 ? (currentVal / qty) : holding.currentPrice;

      totalInvested += invested;
      totalNetWorth += currentVal;

      holding.quantity = qty;
      holding.avgBuyPrice = avgBuyPrice;
      holding.currentPrice = currentPrice;
      updatedHoldings.push(holding);
    });

    const notesInput = document.getElementById('entryMonthlyNotes');
    const notes = notesInput ? notesInput.value.trim() : '';

    const totalGain = totalNetWorth - totalInvested;

    // 1. Save Monthly Snapshot
    const updateRecord = {
      monthYear: monthYear,
      totalNetWorth: totalNetWorth,
      contributions: totalInvested,
      marketGain: totalGain,
      notes: notes || `Monthly update for ${monthYear}. Total Invested: ${store.formatMoney(totalInvested)} | Net Worth: ${store.formatMoney(totalNetWorth)}`
    };

    store.addMonthlyUpdate(updateRecord);
    store.save();

    // 2. Push to Google Sheets if connected
    await pushMonthlyUpdateToGoogleSheets(updateRecord, store.state.holdings);

    window.showToast(`🎉 Recorded snapshot for ${monthYear}!`, 'success');
    window.triggerConfetti();

    // Switch to Monthly Updates view to show the result
    switchView('monthly');
  }

  // ==========================================================================
  // 7. OVERVIEW & MAIN NAVIGATION
  // ==========================================================================
  function renderOverviewCards() {
    const totalNetWorth = store.getTotalNetWorth();
    const totalCost = store.getTotalCostBasis();
    const totalGain = store.getTotalGain();
    const totalGainPct = store.getTotalGainPercent();
    const dayChange = store.getTodayChange();
    const topPerformer = store.getTopPerformer();

    const netWorthEl = document.getElementById('metricNetWorth');
    if (netWorthEl) netWorthEl.textContent = store.formatMoney(totalNetWorth);

    const totalGainEl = document.getElementById('metricTotalGain');
    const totalGainBadge = document.getElementById('badgeTotalGain');
    if (totalGainEl) totalGainEl.textContent = store.formatMoney(totalGain);
    if (totalGainBadge) {
      totalGainBadge.className = `badge ${totalGain >= 0 ? 'badge-success' : 'badge-danger'}`;
      totalGainBadge.textContent = `${totalGain >= 0 ? '▲' : '▼'} ${store.formatPercent(totalGainPct)}`;
    }

    const dayChangeEl = document.getElementById('metricDayChange');
    const dayChangeBadge = document.getElementById('badgeDayChange');
    if (dayChangeEl) {
      const isUp = dayChange.dollar >= 0;
      dayChangeEl.textContent = `${isUp ? '+' : ''}${store.formatMoney(dayChange.dollar)}`;
      dayChangeEl.style.color = isUp ? 'var(--success)' : 'var(--danger)';
    }
    if (dayChangeBadge) {
      const isUp = dayChange.percent >= 0;
      dayChangeBadge.className = `badge ${isUp ? 'badge-success' : 'badge-danger'}`;
      dayChangeBadge.textContent = `${isUp ? '▲' : '▼'} ${Math.abs(dayChange.percent).toFixed(2)}%`;
    }

    const costBasisEl = document.getElementById('metricCostBasis');
    if (costBasisEl) costBasisEl.textContent = store.formatMoney(totalCost);

    const topPerformerNameEl = document.getElementById('highlightTopPerformerName');
    const topPerformerReturnEl = document.getElementById('highlightTopPerformerReturn');
    if (topPerformerNameEl && topPerformerReturnEl && topPerformer) {
      topPerformerNameEl.textContent = `${topPerformer.holding.name} (${topPerformer.holding.symbol})`;
      topPerformerReturnEl.textContent = `+${store.formatMoney(topPerformer.gainAmount)} (${store.formatPercent(topPerformer.gainPercent)})`;
    }
  }

  function updateAllViews() {
    const holdingsBadge = document.getElementById('holdingsNavBadge');
    if (holdingsBadge) holdingsBadge.textContent = store.state.holdings.length;

    const goalsBadge = document.getElementById('goalsNavBadge');
    if (goalsBadge) goalsBadge.textContent = store.state.goals.length;

    updateSheetsStatusBadge();
    renderOverviewCards();

    if (activeView === 'overview') {
      renderPerformanceChart(activeTimeframe);
      renderAllocationChart();
    } else if (activeView === 'holdings') {
      renderHoldingsTable();
    } else if (activeView === 'goals') {
      renderGoalsView();
    } else if (activeView === 'monthly') {
      renderMonthlyView();
    } else if (activeView === 'add-monthly') {
      renderAddMonthlyView();
    }
  }

  function switchView(viewName) {
    activeView = viewName;

    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.view === viewName);
    });

    document.querySelectorAll('.view-section').forEach(el => {
      el.classList.remove('active');
    });

    const targetContainer = document.getElementById(`view-${viewName}`);
    if (targetContainer) targetContainer.classList.add('active');

    const titles = {
      overview: 'Portfolio Overview',
      holdings: 'Holdings & Asset Ledger',
      'add-monthly': '➕ Add Monthly Update',
      goals: 'Financial Goals & Milestones',
      monthly: 'Monthly Updates & Review'
    };
    const titleEl = document.getElementById('activeViewTitle');
    if (titleEl) titleEl.textContent = titles[viewName] || 'Dashboard';

    if (viewName === 'overview') {
      setTimeout(() => {
        renderPerformanceChart(activeTimeframe);
        renderAllocationChart();
      }, 50);
    } else if (viewName === 'holdings') {
      renderHoldingsTable();
    } else if (viewName === 'goals') {
      renderGoalsView();
    } else if (viewName === 'monthly') {
      renderMonthlyView();
    } else if (viewName === 'add-monthly') {
      renderAddMonthlyView();
    }
  }

  // ==========================================================================
  // 8. LIVE TICKER & INITIALIZATION
  // ==========================================================================
  function setupLiveTicker() {
    const track = document.getElementById('tickerTrack');
    if (!track) return;

    const html = TICKER_ASSETS.map(item => `
      <div class="ticker-item" data-ticker="${item.symbol}">
        <span class="ticker-symbol">${item.symbol}</span>
        <span class="ticker-price">${store.formatMoney(item.price)}</span>
        <span class="ticker-delta ${item.change >= 0 ? 'up' : 'down'}">
          ${item.change >= 0 ? '▲' : '▼'} ${Math.abs(item.change).toFixed(2)}%
        </span>
      </div>
    `).join('');

    track.innerHTML = html + html;
  }

  function simulateTickerFluctuations() {
    TICKER_ASSETS.forEach(item => {
      const delta = (Math.random() - 0.49) * 0.3;
      item.change += delta;
      item.price *= (1 + delta / 100);
    });
    setupLiveTicker();
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // ==========================================================================
  // 9. GLOBAL WINDOW HANDLERS
  // ==========================================================================
  window.switchView = switchView;
  window.handleSaveMonthlyEntry = handleSaveMonthlyEntry;

  window.showToast = function(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '⚠️';

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(40px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  };

  window.triggerConfetti = function() {
    if (typeof confetti === 'function') {
      confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
    }
  };

  // Holding Modal Handlers
  window.openHoldingModal = function() {
    const modal = document.getElementById('holdingModal');
    const form = document.getElementById('holdingForm');
    const title = document.getElementById('holdingModalTitle');
    if (!modal || !form) return;

    form.reset();
    delete form.dataset.editingId;
    if (title) title.textContent = 'Add New Investment';
    modal.classList.add('active');
  };

  window.editHolding = function(id) {
    const holding = store.state.holdings.find(h => h.id === id);
    if (!holding) return;

    const modal = document.getElementById('holdingModal');
    const form = document.getElementById('holdingForm');
    const title = document.getElementById('holdingModalTitle');
    if (!modal || !form) return;

    form.dataset.editingId = id;
    if (title) title.textContent = `Edit Holding: ${holding.name}`;

    form.symbol.value = holding.symbol;
    form.name.value = holding.name;
    form.category.value = holding.category;
    form.quantity.value = holding.quantity;
    form.avgBuyPrice.value = holding.avgBuyPrice;
    form.currentPrice.value = holding.currentPrice;
    form.notes.value = holding.notes || '';

    modal.classList.add('active');
  };

  window.confirmDeleteHolding = function(id, name) {
    if (confirm(`Are you sure you want to remove "${name}" from your portfolio?`)) {
      store.deleteHolding(id);
      window.showToast(`Removed "${name}" from portfolio.`, 'info');
    }
  };

  window.closeHoldingModal = function() {
    const modal = document.getElementById('holdingModal');
    if (modal) modal.classList.remove('active');
  };

  // Goal Modal Handlers
  window.openGoalModal = function() {
    const modal = document.getElementById('goalModal');
    const form = document.getElementById('goalForm');
    const title = document.getElementById('goalModalTitle');
    if (!modal || !form) return;

    form.reset();
    delete form.dataset.editingId;
    if (title) title.textContent = 'Create Investment Goal';
    modal.classList.add('active');
  };

  window.editGoal = function(id) {
    const goal = store.state.goals.find(g => g.id === id);
    if (!goal) return;

    const modal = document.getElementById('goalModal');
    const form = document.getElementById('goalForm');
    const title = document.getElementById('goalModalTitle');
    if (!modal || !form) return;

    form.dataset.editingId = id;
    if (title) title.textContent = `Edit Goal: ${goal.title}`;

    form.title.value = goal.title;
    form.targetAmount.value = goal.targetAmount;
    form.targetDate.value = goal.targetDate || '';
    form.category.value = goal.category || 'networth';
    form.icon.value = goal.icon || '🎯';
    form.notes.value = goal.notes || '';

    modal.classList.add('active');
  };

  window.confirmDeleteGoal = function(id, title) {
    if (confirm(`Are you sure you want to delete goal "${title}"?`)) {
      store.deleteGoal(id);
      window.showToast(`Deleted goal "${title}".`, 'info');
    }
  };

  window.closeGoalModal = function() {
    const modal = document.getElementById('goalModal');
    if (modal) modal.classList.remove('active');
  };

  // Google Sheets Sync Modal Handlers
  window.openSheetsModal = function() {
    const modal = document.getElementById('sheetsModal');
    const input = document.getElementById('sheetsUrlInput');
    if (input) input.value = store.getGoogleAppsScriptUrl();
    if (modal) modal.classList.add('active');
  };

  window.closeSheetsModal = function() {
    const modal = document.getElementById('sheetsModal');
    if (modal) modal.classList.remove('active');
  };

  window.saveSheetsUrl = function() {
    const input = document.getElementById('sheetsUrlInput');
    if (!input) return;
    const url = input.value.trim();
    store.setGoogleAppsScriptUrl(url);
    window.showToast('Google Apps Script URL saved!', 'success');
    updateSheetsStatusBadge();
    window.closeSheetsModal();
  };

  window.syncAllSheets = function() {
    pushAllToGoogleSheets();
  };

  window.fetchFromSheets = function() {
    fetchFromGoogleSheets();
  };

  // Data & Backup Handlers
  window.openDataModal = function() {
    const modal = document.getElementById('dataModal');
    if (modal) modal.classList.add('active');
  };

  window.closeDataModal = function() {
    const modal = document.getElementById('dataModal');
    if (modal) modal.classList.remove('active');
  };

  window.triggerJSONExport = function() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(store.state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadAnchor.setAttribute("download", `AuraInvest_Backup_${dateStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    window.showToast('Portfolio exported to JSON successfully!', 'success');
  };

  window.triggerCSVExport = function() {
    const holdings = store.state.holdings || [];
    if (holdings.length === 0) {
      window.showToast('No holdings available to export.', 'error');
      return;
    }

    const headers = ['Symbol', 'Name', 'Category', 'Quantity', 'Avg Buy Price (INR)', 'Current Price (INR)', 'Total Value (INR)', 'Gain/Loss (INR)', 'Gain (%)', 'Notes'];
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
  };

  window.triggerJSONImport = function(fileInput) {
    const file = fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (parsed.holdings && Array.isArray(parsed.holdings)) {
          store.state = { ...store.state, ...parsed };
          store.save();
          window.showToast('Portfolio imported successfully!', 'success');
          updateAllViews();
          window.closeDataModal();
        } else {
          window.showToast('Invalid backup file format.', 'error');
        }
      } catch (err) {
        window.showToast('Failed to parse JSON file.', 'error');
      }
    };
    reader.readAsText(file);
  };

  window.resetDemoPortfolio = function() {
    if (confirm('Reset portfolio to the original August 2026 dataset?')) {
      store.resetToDemoData();
      window.closeDataModal();
      window.showToast('Loaded original August 2026 portfolio!', 'success');
    }
  };

  window.clearAllPortfolioData = function() {
    if (confirm('Are you sure you want to wipe ALL portfolio data and start with an empty slate? This cannot be undone.')) {
      store.clearAllData();
      window.closeDataModal();
      window.showToast('Portfolio cleared.', 'info');
    }
  };

  // ==========================================================================
  // 10. INITIAL DOM BINDINGS & EVENT LISTENERS
  // ==========================================================================
  document.addEventListener('DOMContentLoaded', () => {
    // Apply saved theme & currency
    document.documentElement.setAttribute('data-theme', store.getTheme());
    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect) themeSelect.value = store.getTheme();

    const currencySelect = document.getElementById('currencySelect');
    if (currencySelect) currencySelect.value = store.getCurrency();

    // Navigation setup
    document.querySelectorAll('.nav-item[data-view]').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        switchView(item.dataset.view);
      });
    });

    // Live Marquee
    setupLiveTicker();

    // Currency Switcher
    if (currencySelect) {
      currencySelect.addEventListener('change', (e) => {
        store.setCurrency(e.target.value);
        window.showToast(`Currency switched to ${e.target.value}`, 'info');
      });
    }

    // Theme Switcher
    if (themeSelect) {
      themeSelect.addEventListener('change', (e) => {
        store.setTheme(e.target.value);
      });
    }

    // Timeframe selector
    document.querySelectorAll('.time-pill[data-timeframe]').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.time-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        activeTimeframe = pill.dataset.timeframe;
        renderPerformanceChart(activeTimeframe);
      });
    });

    // Holdings Search
    const searchInput = document.getElementById('holdingSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase().trim();
        renderHoldingsTable();
      });
    }

    // Holdings Category Filter Pills
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

    // Holdings Table Sorting
    document.querySelectorAll('#holdingsTable th[data-sort]').forEach(th => {
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

    // Modal Form Submissions
    const holdingForm = document.getElementById('holdingForm');
    if (holdingForm) {
      holdingForm.addEventListener('submit', (e) => {
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
          window.showToast('Please fill in all required fields.', 'error');
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
      });
    }

    const goalForm = document.getElementById('goalForm');
    if (goalForm) {
      goalForm.addEventListener('submit', (e) => {
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
      });
    }

    // Modal Backdrop & ESC key closing
    document.querySelectorAll('.modal-backdrop').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('active'));
        }
      });
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('active'));
      }
    });

    // State subscribe listener
    store.subscribe(() => {
      updateAllViews();
    });

    // Initial render
    updateAllViews();

    // Periodic ticker price micro-fluctuations
    setInterval(simulateTickerFluctuations, 4000);
  });

})();
