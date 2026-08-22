/**
 * AuraInvest - Central State Management & Financial Math Engine
 */

const STORAGE_KEY = 'aurainvest_portfolio_state_v1';

// Standard Currency Symbols & Multipliers (relative to USD)
export const CURRENCIES = {
  USD: { symbol: '$', rate: 1.0, label: 'USD ($)' },
  EUR: { symbol: '€', rate: 0.92, label: 'EUR (€)' },
  GBP: { symbol: '£', rate: 0.79, label: 'GBP (£)' },
  INR: { symbol: '₹', rate: 86.5, label: 'INR (₹)' },
  CAD: { symbol: 'CA$', rate: 1.36, label: 'CAD ($)' },
  AUD: { symbol: 'A$', rate: 1.52, label: 'AUD ($)' },
  JPY: { symbol: '¥', rate: 154.0, label: 'JPY (¥)' }
};

// Initial realistic starter portfolio if none exists in LocalStorage
const DEFAULT_INITIAL_STATE = {
  preferences: {
    currency: 'USD',
    theme: 'dark',
    chartTimeframe: '1Y'
  },
  holdings: [
    {
      id: 'h-1',
      symbol: 'AAPL',
      name: 'Apple Inc.',
      category: 'stock',
      quantity: 45,
      avgBuyPrice: 172.50,
      currentPrice: 228.40,
      dayChangePercent: 1.25,
      notes: 'Long term core holding'
    },
    {
      id: 'h-2',
      symbol: 'NVDA',
      name: 'NVIDIA Corporation',
      category: 'stock',
      quantity: 60,
      avgBuyPrice: 94.20,
      currentPrice: 132.80,
      dayChangePercent: 3.40,
      notes: 'AI & Data Center compute leader'
    },
    {
      id: 'h-3',
      symbol: 'VOO',
      name: 'Vanguard S&P 500 ETF',
      category: 'etf',
      quantity: 85,
      avgBuyPrice: 420.00,
      currentPrice: 512.60,
      dayChangePercent: 0.65,
      notes: 'Broad market foundation'
    },
    {
      id: 'h-4',
      symbol: 'BTC',
      name: 'Bitcoin',
      category: 'crypto',
      quantity: 0.85,
      avgBuyPrice: 48500.00,
      currentPrice: 66400.00,
      dayChangePercent: 2.10,
      notes: 'Digital store of value'
    },
    {
      id: 'h-5',
      symbol: 'ETH',
      name: 'Ethereum',
      category: 'crypto',
      quantity: 4.2,
      avgBuyPrice: 2650.00,
      currentPrice: 3450.00,
      dayChangePercent: -0.80,
      notes: 'Smart contract layer 1'
    },
    {
      id: 'h-6',
      symbol: 'VNQ',
      name: 'Vanguard Real Estate ETF',
      category: 'real-estate',
      quantity: 120,
      avgBuyPrice: 82.00,
      currentPrice: 89.50,
      dayChangePercent: 0.35,
      notes: 'Commercial & residential REITs'
    },
    {
      id: 'h-7',
      symbol: 'GLD',
      name: 'SPDR Gold Shares',
      category: 'commodity',
      quantity: 35,
      avgBuyPrice: 195.00,
      currentPrice: 232.10,
      dayChangePercent: 0.45,
      notes: 'Inflation hedge'
    },
    {
      id: 'h-8',
      symbol: 'HYSA',
      name: 'High Yield Cash Reserve',
      category: 'cash',
      quantity: 1,
      avgBuyPrice: 15000.00,
      currentPrice: 15000.00,
      dayChangePercent: 0.00,
      notes: '5.0% APY liquid emergency fund'
    }
  ],
  goals: [
    {
      id: 'g-1',
      title: 'First $250,000 Portfolio',
      targetAmount: 250000,
      targetDate: '2027-12-31',
      category: 'networth',
      notes: 'Milestone for compounding acceleration',
      icon: '🎯'
    },
    {
      id: 'g-2',
      title: 'Emergency Liquidity Fund',
      targetAmount: 25000,
      targetDate: '2026-12-31',
      category: 'cash',
      notes: '6 months living expenses',
      icon: '🛡️'
    },
    {
      id: 'g-3',
      title: 'Real Estate Property Deposit',
      targetAmount: 80000,
      targetDate: '2028-06-30',
      category: 'real-estate',
      notes: 'Down payment for rental property',
      icon: '🏡'
    },
    {
      id: 'g-4',
      title: '1 Full Bitcoin Milestone',
      targetAmount: 66400,
      targetDate: '2026-12-31',
      category: 'crypto',
      notes: 'Accumulate 1.00 BTC',
      icon: '⚡'
    }
  ],
  monthlyUpdates: [
    {
      id: 'm-1',
      monthYear: '2026-03',
      totalNetWorth: 152400,
      contributions: 3200,
      marketGain: 4800,
      notes: 'Added to VOO and AAPL during monthly DCA.'
    },
    {
      id: 'm-2',
      monthYear: '2026-04',
      totalNetWorth: 161200,
      contributions: 3500,
      marketGain: 5300,
      notes: 'Tech earnings exceeded expectations, strong rally.'
    },
    {
      id: 'm-3',
      monthYear: '2026-05',
      totalNetWorth: 168900,
      contributions: 3000,
      marketGain: 4700,
      notes: 'Increased Gold & Cash position to buffer market volatility.'
    },
    {
      id: 'm-4',
      monthYear: '2026-06',
      totalNetWorth: 177400,
      contributions: 3500,
      marketGain: 5000,
      notes: 'Semi-annual rebalance completed.'
    },
    {
      id: 'm-5',
      monthYear: '2026-07',
      totalNetWorth: 186800,
      contributions: 4000,
      marketGain: 5400,
      notes: 'Crypto breakout pushed portfolio to new all-time high.'
    },
    {
      id: 'm-6',
      monthYear: '2026-08',
      totalNetWorth: 195650,
      contributions: 3800,
      marketGain: 5050,
      notes: 'Solid month across equities and commodities.'
    }
  ]
};

// State Store Instance
class PortfolioState {
  constructor() {
    this.state = this.loadState();
    this.listeners = [];
  }

  loadState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...DEFAULT_INITIAL_STATE,
          ...parsed,
          preferences: { ...DEFAULT_INITIAL_STATE.preferences, ...(parsed.preferences || {}) }
        };
      }
    } catch (e) {
      console.warn('Could not parse stored portfolio state, using defaults:', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_INITIAL_STATE));
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Failed to persist portfolio state:', e);
    }
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => fn(this.state));
  }

  // --- Financial & Portfolio Metrics Engine ---

  getCurrency() {
    return this.state.preferences.currency || 'USD';
  }

  setCurrency(currencyCode) {
    if (CURRENCIES[currencyCode]) {
      this.state.preferences.currency = currencyCode;
      this.saveState();
    }
  }

  getTheme() {
    return this.state.preferences.theme || 'dark';
  }

  setTheme(themeName) {
    this.state.preferences.theme = themeName;
    document.documentElement.setAttribute('data-theme', themeName);
    this.saveState();
  }

  formatMoney(amountUSD, compact = false) {
    const cur = CURRENCIES[this.getCurrency()] || CURRENCIES.USD;
    const converted = (amountUSD || 0) * cur.rate;

    if (compact && Math.abs(converted) >= 1000) {
      const formatter = new Intl.NumberFormat('en-US', {
        notation: 'compact',
        compactDisplay: 'short',
        maximumFractionDigits: 1
      });
      return `${cur.symbol}${formatter.format(converted)}`;
    }

    const formatter = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: Math.abs(converted) < 10 && Math.abs(converted) > 0 ? 2 : 2,
      maximumFractionDigits: 2
    });
    return `${cur.symbol}${formatter.format(converted)}`;
  }

  formatPercent(val) {
    const sign = val > 0 ? '+' : '';
    return `${sign}${(val || 0).toFixed(2)}%`;
  }

  // Calculations
  getHoldingTotalValue(holding) {
    return (holding.quantity || 0) * (holding.currentPrice || 0);
  }

  getHoldingCostBasis(holding) {
    return (holding.quantity || 0) * (holding.avgBuyPrice || 0);
  }

  getHoldingGain(holding) {
    const value = this.getHoldingTotalValue(holding);
    const cost = this.getHoldingCostBasis(holding);
    return value - cost;
  }

  getHoldingGainPercent(holding) {
    const cost = this.getHoldingCostBasis(holding);
    if (cost === 0) return 0;
    return ((this.getHoldingTotalValue(holding) - cost) / cost) * 100;
  }

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
    return {
      dollar: dayDollarChange,
      percent: dayPctChange
    };
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
    let maxPct = this.getHoldingGainPercent(top);

    this.state.holdings.forEach(h => {
      const pct = this.getHoldingGainPercent(h);
      if (pct > maxPct) {
        maxPct = pct;
        top = h;
      }
    });
    return { holding: top, gainPercent: maxPct };
  }

  // --- Holdings CRUD ---
  addHolding(holdingData) {
    const newHolding = {
      id: 'h-' + Date.now(),
      symbol: (holdingData.symbol || '').toUpperCase().trim(),
      name: holdingData.name.trim(),
      category: holdingData.category || 'stock',
      quantity: parseFloat(holdingData.quantity) || 0,
      avgBuyPrice: parseFloat(holdingData.avgBuyPrice) || 0,
      currentPrice: parseFloat(holdingData.currentPrice) || parseFloat(holdingData.avgBuyPrice) || 0,
      dayChangePercent: parseFloat(holdingData.dayChangePercent) || (Math.random() * 2 - 0.8),
      notes: holdingData.notes || ''
    };
    this.state.holdings.push(newHolding);
    this.saveState();
    return newHolding;
  }

  updateHolding(id, updatedData) {
    const idx = this.state.holdings.findIndex(h => h.id === id);
    if (idx !== -1) {
      this.state.holdings[idx] = {
        ...this.state.holdings[idx],
        ...updatedData,
        symbol: (updatedData.symbol || this.state.holdings[idx].symbol).toUpperCase().trim(),
        quantity: parseFloat(updatedData.quantity !== undefined ? updatedData.quantity : this.state.holdings[idx].quantity),
        avgBuyPrice: parseFloat(updatedData.avgBuyPrice !== undefined ? updatedData.avgBuyPrice : this.state.holdings[idx].avgBuyPrice),
        currentPrice: parseFloat(updatedData.currentPrice !== undefined ? updatedData.currentPrice : this.state.holdings[idx].currentPrice)
      };
      this.saveState();
      return this.state.holdings[idx];
    }
    return null;
  }

  deleteHolding(id) {
    this.state.holdings = this.state.holdings.filter(h => h.id !== id);
    this.saveState();
  }

  // --- Goals CRUD ---
  addGoal(goalData) {
    const newGoal = {
      id: 'g-' + Date.now(),
      title: goalData.title.trim(),
      targetAmount: parseFloat(goalData.targetAmount) || 0,
      targetDate: goalData.targetDate || '',
      category: goalData.category || 'networth',
      notes: goalData.notes || '',
      icon: goalData.icon || '🎯',
      isCompleted: false
    };
    this.state.goals.push(newGoal);
    this.saveState();
    return newGoal;
  }

  updateGoal(id, updatedData) {
    const idx = this.state.goals.findIndex(g => g.id === id);
    if (idx !== -1) {
      this.state.goals[idx] = {
        ...this.state.goals[idx],
        ...updatedData,
        targetAmount: parseFloat(updatedData.targetAmount !== undefined ? updatedData.targetAmount : this.state.goals[idx].targetAmount)
      };
      this.saveState();
      return this.state.goals[idx];
    }
    return null;
  }

  deleteGoal(id) {
    this.state.goals = this.state.goals.filter(g => g.id !== id);
    this.saveState();
  }

  // --- Monthly Updates CRUD ---
  addMonthlyUpdate(updateData) {
    const newUpdate = {
      id: 'm-' + Date.now(),
      monthYear: updateData.monthYear,
      totalNetWorth: parseFloat(updateData.totalNetWorth) || 0,
      contributions: parseFloat(updateData.contributions) || 0,
      marketGain: parseFloat(updateData.marketGain) || 0,
      notes: updateData.notes || ''
    };
    // Ensure chronological order
    this.state.monthlyUpdates.push(newUpdate);
    this.state.monthlyUpdates.sort((a, b) => a.monthYear.localeCompare(b.monthYear));
    this.saveState();
    return newUpdate;
  }

  updateMonthlyUpdate(id, updatedData) {
    const idx = this.state.monthlyUpdates.findIndex(m => m.id === id);
    if (idx !== -1) {
      this.state.monthlyUpdates[idx] = {
        ...this.state.monthlyUpdates[idx],
        ...updatedData,
        totalNetWorth: parseFloat(updatedData.totalNetWorth !== undefined ? updatedData.totalNetWorth : this.state.monthlyUpdates[idx].totalNetWorth),
        contributions: parseFloat(updatedData.contributions !== undefined ? updatedData.contributions : this.state.monthlyUpdates[idx].contributions),
        marketGain: parseFloat(updatedData.marketGain !== undefined ? updatedData.marketGain : this.state.monthlyUpdates[idx].marketGain)
      };
      this.state.monthlyUpdates.sort((a, b) => a.monthYear.localeCompare(b.monthYear));
      this.saveState();
      return this.state.monthlyUpdates[idx];
    }
    return null;
  }

  deleteMonthlyUpdate(id) {
    this.state.monthlyUpdates = this.state.monthlyUpdates.filter(m => m.id !== id);
    this.saveState();
  }

  // Reset to default starter demo portfolio
  resetToDemoData() {
    this.state = JSON.parse(JSON.stringify(DEFAULT_INITIAL_STATE));
    this.saveState();
  }

  // Clear all data
  clearAllData() {
    this.state = {
      preferences: {
        currency: 'USD',
        theme: 'dark',
        chartTimeframe: '1Y'
      },
      holdings: [],
      goals: [],
      monthlyUpdates: []
    };
    this.saveState();
  }
}

export const store = new PortfolioState();
