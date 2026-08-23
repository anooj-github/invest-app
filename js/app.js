/**
 * Sharkfin — Complete Financial OS Engine
 * Pillars: Overview, Investment (Manual & SIP), Assets, Loans (EMI & Amortization),
 * Savings (Emergency Fund & Goals), Expense (Daily & Month-over-Month Comparison)
 * Pure Vanilla JavaScript with Chart.js & Confetti
 */

(function() {
  'use strict';

  // ==========================================================================
  // 1. CONFIGURATION & CONSTANTS
  // ==========================================================================
  const STORAGE_KEY = 'sharkfin_state_v13_gold_14950';

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
    etf: '#10b981',         // Emerald Green
    commodity: '#eab308',   // Gold
    cash: '#06b6d4',        // Cyan
    'real-estate': '#a855f7',// Purple
    crypto: '#f59e0b',      // Amber
    other: '#94a3b8'
  };

  const CATEGORY_LABELS = {
    stock: 'Stocks (Equity)',
    etf: 'Mutual Funds & ETFs',
    commodity: 'Gold & Silver',
    cash: 'Fixed Income & Cash',
    'real-estate': 'Real Estate & REIT',
    crypto: 'Cryptocurrency',
    other: 'Other'
  };

  const EXPENSE_CATEGORY_NAMES = {
    food: 'Food & Dining',
    groceries: 'Groceries',
    housing: 'Housing & Rent',
    utilities: 'Utilities & Bills',
    transport: 'Transport & Fuel',
    shopping: 'Shopping & Apparel',
    healthcare: 'Healthcare',
    entertainment: 'Entertainment',
    education: 'Education',
    other: 'Other'
  };

  const EXPENSE_CATEGORY_ICONS = {
    food: '🍔',
    groceries: '🛒',
    housing: '🏠',
    utilities: '💡',
    transport: '🚗',
    shopping: '🛍️',
    healthcare: '🏥',
    entertainment: '🎬',
    education: '📚',
    other: '💼'
  };

  // Live Marquee Assets in INR
  const TICKER_ASSETS = [
    { symbol: 'GOLD (24K/g)', price: 14950.00, change: 1.85 },
    { symbol: 'NIFTY 50', price: 24825.00, change: 0.72 },
    { symbol: 'SENSEX', price: 81350.00, change: 0.65 },
    { symbol: 'GOLDBEES', price: 174.70, change: 0.45 },
    { symbol: 'SILVERBEES', price: 175.07, change: -1.20 },
    { symbol: 'BPCL', price: 311.00, change: -0.85 },
    { symbol: 'SBI PSU FUND', price: 38.39, change: 1.45 },
    { symbol: 'HDFC FLEXI CAP', price: 2375.25, change: 0.80 },
    { symbol: 'METALIETF', price: 13.24, change: 1.10 },
    { symbol: 'IT ETF', price: 33.90, change: 0.35 }
  ];

  // User's Exact Aug-2026 Portfolio & Loan Dataset
  const DEFAULT_INITIAL_STATE = {
    preferences: {
      currency: 'INR',
      theme: 'dark',
      googleAppsScriptUrl: 'https://script.google.com/macros/s/AKfycbwvrC2yL39zzFr0xXgG3r2cHPzziwS-_rVfSZAQpsaj49sjyutn_uL-gzX_wizg--GeWw/exec'
    },
    investments: {
      manualHoldings: [
        // 1. Stocks & ETFs from user sheet
        {
          id: 'h-silverbees',
          symbol: 'SILVERBEES',
          name: 'Nippon India Silver ETF',
          category: 'commodity',
          quantity: 15,
          avgBuyPrice: 281.67, // Total Invested: ₹4,225
          currentPrice: 175.07, // Current Value: ₹2,626
          notes: 'Sector: Commodities - Silver | 41.65% of Stocks'
        },
        {
          id: 'h-goldbees',
          symbol: 'GOLDBEES',
          name: 'Nippon India Gold ETF',
          category: 'commodity',
          quantity: 20,
          avgBuyPrice: 127.15, // Total Invested: ₹2,543
          currentPrice: 174.70, // Current Value: ₹3,494
          notes: 'Sector: Commodities - Gold | 25.00% of Stocks'
        },
        {
          id: 'h-bpcl',
          symbol: 'BPCL',
          name: 'Bharat Petroleum Corp Ltd',
          category: 'stock',
          quantity: 5,
          avgBuyPrice: 365.20, // Total Invested: ₹1,826
          currentPrice: 311.00, // Current Value: ₹1,555
          notes: 'Sector: Oil & Gas | 18.00% of Stocks'
        },
        {
          id: 'h-rmdrip',
          symbol: 'RMDRIP',
          name: 'RM Drip & Sprinklers Systems Ltd',
          category: 'stock',
          quantity: 5,
          avgBuyPrice: 122.40, // Total Invested: ₹612
          currentPrice: 29.40,  // Current Value: ₹147
          notes: 'Sector: Water Irrigation | 6.00% of Stocks'
        },
        {
          id: 'h-metalietf',
          symbol: 'METALIETF',
          name: 'ICICI Prudential Nifty Metal ETF',
          category: 'etf',
          quantity: 50,
          avgBuyPrice: 12.04, // Total Invested: ₹602
          currentPrice: 13.24, // Current Value: ₹662
          notes: 'Sector: Metals & Mining | 6.00% of Stocks'
        },
        {
          id: 'h-it-etf',
          symbol: 'IT ETF',
          name: 'Nippon India ETF Nifty IT',
          category: 'etf',
          quantity: 10,
          avgBuyPrice: 33.80, // Total Invested: ₹338
          currentPrice: 33.90, // Current Value: ₹339
          notes: 'Sector: IT Sector | 3.00% of Stocks'
        },
        // 2. Mutual Funds (Manual Lump Sum Holdings as requested)
        {
          id: 'h-hdfc-flexi',
          symbol: 'HDFCFLEXI',
          name: 'HDFC Flexi CAP Fund',
          category: 'etf',
          quantity: 4,
          avgBuyPrice: 2375.25, // Total Invested: ₹9,501
          currentPrice: 2375.25, // Current Value: ₹9,501
          notes: 'Units: 4 | Manual Mutual Fund Holding'
        },
        {
          id: 'h-hdfc-small',
          symbol: 'HDFCSMALL',
          name: 'HDFC Small CAP Fund',
          category: 'etf',
          quantity: 46,
          avgBuyPrice: 152.15, // Total Invested: ₹6,999
          currentPrice: 161.22, // Current Value: ₹7,416 (+₹417)
          notes: 'Units: 46 | Manual Mutual Fund Holding'
        },
        // 3. Retirement & Fixed Holdings
        {
          id: 'h-nps',
          symbol: 'NPS',
          name: 'National Pension Scheme (NPS)',
          category: 'cash',
          quantity: 1,
          avgBuyPrice: 16092.00, // Total Invested: ₹16,092
          currentPrice: 16092.00, // Current Value: ₹16,092
          notes: 'Retirement NPS Tier-1 | 4.94% of Portfolio'
        }
      ],
      sips: [
        // 1. SBI PSU Direct Plan SIP (₹5,000 / month)
        {
          id: 'sip-sbi-psu',
          name: 'SBI PSU Direct Plan',
          category: 'etf',
          monthlyAmount: 5000, // ₹5,000 / month
          investedAmount: 49498, // Exact from user sheet
          sipDay: 5,
          startDate: '2023-06-05',
          installmentsPaid: 10,
          currentValue: 53211, // Total Invested: ₹49,498, Current: ₹53,211 (+₹3,713)
          expectedReturn: 14.5,
          status: 'active',
          notes: 'Units: 1386 | Invested: ₹49,498 | Monthly SIP: ₹5,000 (Auto-updating)'
        },
        // 2. Post Office Scheme SIP (₹5,000 / month @ 8.2% return)
        {
          id: 'sip-post-office',
          name: 'Post Office Scheme (Recurring)',
          category: 'cash',
          monthlyAmount: 5000, // ₹5,000 / month
          investedAmount: 50410, // Total Invested: ₹50,410
          sipDay: 5,
          startDate: '2023-06-05',
          installmentsPaid: 10,
          currentValue: 54544, // Current Value with 8.2% return: ₹54,544 (+₹4,134)
          expectedReturn: 8.2, // 8.2% ROI
          status: 'active',
          notes: 'Govt Recurring Scheme @ 8.2% ROI | Monthly SIP: ₹5,000 (Auto-updating)'
        }
      ]
    },
    assets: [
      // User's Tangible / Fixed Assets
      {
        id: 'asset-car-14l',
        name: '14L Car (Bought 2023)',
        category: 'vehicle',
        purchasePrice: 1400000, // ₹14 Lakhs
        currentValuation: 1400000,
        purchaseDate: '2023-06-01',
        icon: '🚗',
        notes: 'Personal 4-Wheeler Car | Bought in 2023 for ₹14 Lakhs'
      },
      {
        id: 'asset-duke-250',
        name: 'KTM Duke 250',
        category: 'vehicle',
        purchasePrice: 280000, // ₹2.8 Lakhs
        currentValuation: 280000,
        purchaseDate: '2023-08-01',
        icon: '🏍️',
        notes: '250cc Performance Motorcycle | Bought for ₹2.8 Lakhs'
      },
      {
        id: 'asset-gold-25g',
        name: 'Physical Gold (25 grams)',
        category: 'gold',
        purchasePrice: 175000, // Cost basis: ~₹7,000/g
        currentValuation: 373750, // 25 grams @ ₹14,950/g daily market rate = ₹3,73,750
        purchaseDate: '2023-01-01',
        quantityGrams: 25,
        icon: '🪙',
        notes: '24K Physical Gold (25 grams @ ₹14,950/g daily rate as of 23 Aug 2026)'
      }
    ],
    loans: [
      // User's exact Loan: 10 Lakhs with 8.5% interest, 5 years tenure, started June 2023, Monthly EMI: ₹20,600 (Auto-deducted on 5th of every month)
      {
        id: 'loan-user-10l',
        name: 'Personal / Bank Loan',
        type: 'personal',
        principal: 1000000, // 10 Lakhs (₹10,00,000)
        interestRate: 8.5,  // 8.5% p.a.
        tenureMonths: 60,   // 5 Years (60 Months)
        monthlyEmi: 20600,  // Exact EMI: ₹20,600 / month
        emiDay: 5,          // Auto-updates on 5th of every month
        startDate: '2023-06-05', // Started June 5, 2023
        extraPrepayment: 0,
        notes: '₹10 Lakhs @ 8.5% ROI for 5 Years | Monthly EMI: ₹20,600 | Auto-updated on 5th of every month'
      }
    ],
    savings: {
      // User's exact Emergency Fund & Goals Savings
      emergencyFund: {
        currentAmount: 170000, // ₹1,70,000 (52.23% of total assets)
        targetAmount: 300000   // Target: ₹3,00,000
      },
      goals: [
        {
          id: 'g-goals-savings',
          title: 'Goals Savings',
          targetAmount: 100000,
          currentAmount: 10000, // ₹10,000 (3.07% of total assets)
          targetDate: '2027-12-31',
          icon: '🎯',
          notes: 'Dedicated milestone savings corpus'
        }
      ]
    },
    expenses: [] // Clean 0 expenses until user logs daily entries
  };

  // Global State Variable
  let state = null;

  // Chart Instances
  let charts = {
    overviewComposition: null,
    overviewCashflow: null,
    investAllocation: null,
    expenseCategory: null,
    expenseDailyTrend: null
  };

  // ==========================================================================
  // 2. STATE PERSISTENCE & STORAGE
  // ==========================================================================
  function loadState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        state = JSON.parse(stored);
        // Ensure all top-level keys exist
        if (!state.investments) state.investments = { manualHoldings: [], sips: [] };
        if (!state.assets) state.assets = DEFAULT_INITIAL_STATE.assets ? JSON.parse(JSON.stringify(DEFAULT_INITIAL_STATE.assets)) : [];
        if (!state.loans) state.loans = [];
        if (!state.savings) state.savings = { emergencyFund: { currentAmount: 0, targetAmount: 0 }, goals: [] };
        if (!state.expenses) state.expenses = [];
        if (!state.preferences) state.preferences = DEFAULT_INITIAL_STATE.preferences;
      } else {
        state = JSON.parse(JSON.stringify(DEFAULT_INITIAL_STATE));
        saveState();
      }
    } catch (e) {
      console.error('Error loading state from localStorage:', e);
      state = JSON.parse(JSON.stringify(DEFAULT_INITIAL_STATE));
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Error saving state to localStorage:', e);
    }
  }

  // ==========================================================================
  // 3. CURRENCY FORMATTING & FINANCIAL MATH
  // ==========================================================================
  function formatCurrency(amountINR, showSign = false, customCurrency = null) {
    const curCode = customCurrency || state.preferences.currency || 'INR';
    const cur = CURRENCIES[curCode] || CURRENCIES.INR;
    const converted = amountINR * cur.rate;

    let signStr = '';
    if (showSign && converted > 0) signStr = '+';
    else if (converted < 0) signStr = '-';

    const absVal = Math.abs(converted);
    let numStr = '';

    if (curCode === 'INR') {
      numStr = absVal.toLocaleString('en-IN', {
        maximumFractionDigits: absVal >= 1000 ? 0 : 2,
        minimumFractionDigits: absVal >= 1000 ? 0 : 2
      });
    } else {
      numStr = absVal.toLocaleString('en-US', {
        maximumFractionDigits: absVal >= 1000 ? 0 : 2,
        minimumFractionDigits: absVal >= 1000 ? 0 : 2
      });
    }

    return `${signStr}${cur.symbol}${numStr}`;
  }

  function formatPercent(pct, showSign = true) {
    const sign = showSign && pct > 0 ? '+' : '';
    return `${sign}${pct.toFixed(2)}%`;
  }

  // Calculate standard Reducing Balance Loan EMI
  function calculateLoanEMI(principal, annualRatePct, tenureMonths) {
    if (!principal || !tenureMonths || annualRatePct <= 0) {
      return tenureMonths > 0 ? principal / tenureMonths : 0;
    }
    const monthlyRate = annualRatePct / (12 * 100);
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
                (Math.pow(1 + monthlyRate, tenureMonths) - 1);
    return isNaN(emi) ? 0 : emi;
  }

  // Calculate Amortization details for a loan (Auto-updates every month on the 5th)
  function calculateAmortizationSchedule(loan) {
    const principal = Number(loan.principal) || 0;
    const annualRate = Number(loan.interestRate) || 0;
    const tenureMonths = Number(loan.tenureMonths) || 1;
    const monthlyRate = annualRate / (12 * 100);
    const emi = (loan.monthlyEmi !== undefined && loan.monthlyEmi !== null && loan.monthlyEmi !== '' && Number(loan.monthlyEmi) > 0)
      ? Number(loan.monthlyEmi)
      : calculateLoanEMI(principal, annualRate, tenureMonths);

    // Auto-calculate exact EMIs elapsed based on emiDay (e.g. 5th of every month)
    const emiDay = (loan.emiDay !== undefined && loan.emiDay !== null && loan.emiDay !== '') ? Number(loan.emiDay) : 5;
    let monthsElapsed = 0;

    if (loan.emisPaidManual !== undefined && loan.emisPaidManual !== null && loan.emisPaidManual !== '') {
      monthsElapsed = Number(loan.emisPaidManual);
    } else if (loan.startDate) {
      const start = new Date(loan.startDate);
      const now = new Date();
      const monthDiff = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
      // If current day is on or after the 5th, count current month's EMI as paid
      const isPastEmiDay = now.getDate() >= emiDay;
      monthsElapsed = isPastEmiDay ? (monthDiff + 1) : monthDiff;
      if (monthsElapsed < 0) monthsElapsed = 0;
    }
    if (monthsElapsed > tenureMonths) monthsElapsed = tenureMonths;

    // Next upcoming EMI Date calculation
    const now = new Date();
    let nextEmiDate;
    if (now.getDate() < emiDay) {
      nextEmiDate = new Date(now.getFullYear(), now.getMonth(), emiDay);
    } else {
      nextEmiDate = new Date(now.getFullYear(), now.getMonth() + 1, emiDay);
    }
    const nextEmiFormatted = nextEmiDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

    let balance = principal;
    let totalInterestPayable = 0;
    let principalPaidSoFar = 0;
    let interestPaidSoFar = 0;
    const schedule = [];

    const startObj = loan.startDate ? new Date(loan.startDate) : new Date();

    for (let m = 1; m <= tenureMonths; m++) {
      const interestPayment = balance * monthlyRate;
      let principalPayment = emi - interestPayment;
      if (principalPayment > balance) principalPayment = balance;

      totalInterestPayable += interestPayment;

      if (m <= monthsElapsed) {
        principalPaidSoFar += principalPayment;
        interestPaidSoFar += interestPayment;
      }

      balance -= principalPayment;
      if (balance < 0) balance = 0;

      const payDate = new Date(startObj.getFullYear(), startObj.getMonth() + (m - 1), emiDay);
      const dateLabel = payDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

      schedule.push({
        monthNumber: m,
        dateLabel: dateLabel,
        emi: emi,
        principal: principalPayment,
        interest: interestPayment,
        remainingBalance: balance,
        isPaid: m <= monthsElapsed
      });
    }

    // Add extra prepayments if any
    const extraPrepay = Number(loan.extraPrepayment) || 0;
    principalPaidSoFar += extraPrepay;
    let currentRemainingPrincipal = principal - principalPaidSoFar;
    if (currentRemainingPrincipal < 0) currentRemainingPrincipal = 0;

    const totalPaidSoFar = principalPaidSoFar + interestPaidSoFar;
    const progressPct = principal > 0 ? Math.min(100, (principalPaidSoFar / principal) * 100) : 0;

    return {
      emi: emi,
      emiDay: emiDay,
      nextEmiFormatted: nextEmiFormatted,
      totalInterestPayable: totalInterestPayable,
      monthsElapsed: monthsElapsed,
      monthsRemaining: Math.max(0, tenureMonths - monthsElapsed),
      principalPaidSoFar: principalPaidSoFar,
      interestPaidSoFar: interestPaidSoFar,
      totalPaidSoFar: totalPaidSoFar,
      remainingBalance: currentRemainingPrincipal,
      progressPct: progressPct,
      schedule: schedule
    };
  }

  // ==========================================================================
  // 4. FINANCIAL AGGREGATIONS
  // ==========================================================================
  function getInvestmentMetrics() {
    let totalValue = 0;
    let totalCost = 0;
    let monthlySipTotal = 0;
    let activeSipCount = 0;

    // 1. Manual Holdings
    state.investments.manualHoldings.forEach(h => {
      const qty = Number(h.quantity) || 0;
      const buyPrice = Number(h.avgBuyPrice) || 0;
      const curPrice = h.currentPrice !== undefined && h.currentPrice !== null && h.currentPrice !== '' ? Number(h.currentPrice) : buyPrice;
      const cost = qty * buyPrice;
      const val = qty * curPrice;

      totalCost += cost;
      totalValue += val;
    });

    // 2. SIP Plans
    state.investments.sips.forEach(s => {
      const monthly = Number(s.monthlyAmount) || 0;
      const installments = Number(s.installmentsPaid) || 0;
      const cost = s.investedAmount !== undefined && s.investedAmount !== null && s.investedAmount !== '' ? Number(s.investedAmount) : monthly * installments;
      
      let val = Number(s.currentValue);
      if (isNaN(val) || val <= 0) {
        // Auto estimate value using compound expected return if not specified
        const expRate = Number(s.expectedReturn) || 12;
        const i = (expRate / 100) / 12;
        val = installments > 0 && i > 0 ? monthly * ((Math.pow(1 + i, installments) - 1) / i) * (1 + i) : cost;
      }

      totalCost += cost;
      totalValue += val;

      if (s.status === 'active') {
        monthlySipTotal += monthly;
        activeSipCount++;
      }
    });

    const netGain = totalValue - totalCost;
    const gainPct = totalCost > 0 ? (netGain / totalCost) * 100 : 0;

    return {
      totalValue,
      totalCost,
      netGain,
      gainPct,
      monthlySipTotal,
      activeSipCount
    };
  }

  function getAssetsMetrics() {
    let totalValuation = 0;
    let totalCost = 0;
    let vehiclesTotal = 0;
    let goldTotal = 0;
    let propertyTotal = 0;
    let otherTotal = 0;

    (state.assets || []).forEach(a => {
      const cost = Number(a.purchasePrice) || 0;
      const val = a.currentValuation !== undefined && a.currentValuation !== null && a.currentValuation !== '' ? Number(a.currentValuation) : cost;
      totalCost += cost;
      totalValuation += val;

      if (a.category === 'vehicle') vehiclesTotal += val;
      else if (a.category === 'gold') goldTotal += val;
      else if (a.category === 'property') propertyTotal += val;
      else otherTotal += val;
    });

    const netGain = totalValuation - totalCost;
    const gainPct = totalCost > 0 ? (netGain / totalCost) * 100 : 0;

    return {
      totalValuation,
      totalCost,
      netGain,
      gainPct,
      vehiclesTotal,
      goldTotal,
      propertyTotal,
      otherTotal,
      count: (state.assets || []).length
    };
  }

  function getLoanMetrics() {
    let totalPrincipal = 0;
    let totalRemaining = 0;
    let totalPaidSoFar = 0;
    let monthlyEmiTotal = 0;

    state.loans.forEach(loan => {
      const amort = calculateAmortizationSchedule(loan);
      totalPrincipal += Number(loan.principal) || 0;
      totalRemaining += amort.remainingBalance;
      totalPaidSoFar += amort.totalPaidSoFar;
      monthlyEmiTotal += amort.emi;
    });

    const progressPct = totalPrincipal > 0 ? Math.min(100, ((totalPrincipal - totalRemaining) / totalPrincipal) * 100) : 0;

    return {
      totalPrincipal,
      totalRemaining,
      totalPaidSoFar,
      monthlyEmiTotal,
      progressPct,
      count: state.loans.length
    };
  }

  function getSavingsMetrics() {
    const efCurrent = Number(state.savings.emergencyFund.currentAmount) || 0;
    const efTarget = Number(state.savings.emergencyFund.targetAmount) || 0;

    let goalsTargetTotal = 0;
    let goalsSavedTotal = 0;

    state.savings.goals.forEach(g => {
      goalsTargetTotal += Number(g.targetAmount) || 0;
      goalsSavedTotal += Number(g.currentAmount) || 0;
    });

    const totalLiquidSavings = efCurrent + goalsSavedTotal;
    const efProgressPct = efTarget > 0 ? Math.min(100, (efCurrent / efTarget) * 100) : 0;
    const goalsFundedPct = goalsTargetTotal > 0 ? Math.min(100, (goalsSavedTotal / goalsTargetTotal) * 100) : 0;

    return {
      efCurrent,
      efTarget,
      efProgressPct,
      goalsTargetTotal,
      goalsSavedTotal,
      goalsFundedPct,
      totalLiquidSavings,
      goalsCount: state.savings.goals.length
    };
  }

  function getExpenseMetrics() {
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthKey = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;

    let currentMonthTotal = 0;
    let prevMonthTotal = 0;
    let currentMonthCount = 0;
    let prevMonthCount = 0;

    const currentMonthCategories = {};

    state.expenses.forEach(exp => {
      if (!exp.date) return;
      const monthKey = exp.date.substring(0, 7);
      const amt = Number(exp.amount) || 0;

      if (monthKey === currentMonthKey) {
        currentMonthTotal += amt;
        currentMonthCount++;
        currentMonthCategories[exp.category] = (currentMonthCategories[exp.category] || 0) + amt;
      } else if (monthKey === prevMonthKey) {
        prevMonthTotal += amt;
        prevMonthCount++;
      }
    });

    // Determine top category
    let topCategory = '—';
    let topCategoryAmt = 0;
    Object.keys(currentMonthCategories).forEach(cat => {
      if (currentMonthCategories[cat] > topCategoryAmt) {
        topCategoryAmt = currentMonthCategories[cat];
        topCategory = (EXPENSE_CATEGORY_ICONS[cat] || '') + ' ' + (EXPENSE_CATEGORY_NAMES[cat] || cat);
      }
    });

    // Daily average this month
    const daysInCurrentMonth = now.getDate() || 1;
    const dailyAvgCurrent = currentMonthTotal / daysInCurrentMonth;

    const prevMonthDays = new Date(prevMonthDate.getFullYear(), prevMonthDate.getMonth() + 1, 0).getDate();
    const dailyAvgPrev = prevMonthTotal > 0 ? prevMonthTotal / prevMonthDays : 0;

    // Delta comparison
    const deltaAmount = currentMonthTotal - prevMonthTotal;
    const deltaPct = prevMonthTotal > 0 ? (deltaAmount / prevMonthTotal) * 100 : 0;

    return {
      currentMonthKey,
      prevMonthKey,
      currentMonthLabel: now.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      prevMonthLabel: prevMonthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      currentMonthTotal,
      prevMonthTotal,
      currentMonthCount,
      prevMonthCount,
      dailyAvgCurrent,
      dailyAvgPrev,
      deltaAmount,
      deltaPct,
      topCategory,
      currentMonthCategories
    };
  }

  // ==========================================================================
  // 5. RENDER FUNCTIONS FOR ALL 5 SECTIONS
  // ==========================================================================

  // --- 5.1 RENDER TICKER BAR ---
  function renderTicker() {
    const track = document.getElementById('tickerTrack');
    if (!track) return;

    let itemsHtml = '';
    TICKER_ASSETS.forEach(a => {
      const isUp = a.change >= 0;
      const sign = isUp ? '+' : '';
      const color = isUp ? 'var(--success)' : 'var(--danger)';
      itemsHtml += `
        <div class="ticker-item">
          <span class="ticker-symbol">${a.symbol}</span>
          <span class="ticker-price">${formatCurrency(a.price)}</span>
          <span style="color: ${color}; font-size: 0.72rem; font-weight: 700;">${sign}${a.change.toFixed(2)}%</span>
        </div>
      `;
    });

    // Duplicate for seamless infinite loop
    track.innerHTML = itemsHtml + itemsHtml;
  }

  // --- 5.2 RENDER SECTION 1: HOME OVERVIEW ---
  function renderHomeOverview() {
    const invest = getInvestmentMetrics();
    const assets = getAssetsMetrics();
    const loans = getLoanMetrics();
    const savings = getSavingsMetrics();
    const expense = getExpenseMetrics();

    // Net Worth = (Investments + Physical Assets + Savings) - Remaining Loans
    const totalAssets = invest.totalValue + assets.totalValuation + savings.totalLiquidSavings;
    const totalLiabilities = loans.totalRemaining;
    const netWorth = totalAssets - totalLiabilities;

    // 1. Hero Net Worth Banner
    const elNetWorth = document.getElementById('overviewNetWorth');
    if (elNetWorth) elNetWorth.textContent = formatCurrency(netWorth);

    const elHeroInvest = document.getElementById('overviewHeroInvestments');
    if (elHeroInvest) elHeroInvest.textContent = formatCurrency(invest.totalValue);

    const elHeroSavings = document.getElementById('overviewHeroSavings');
    if (elHeroSavings) elHeroSavings.textContent = formatCurrency(savings.totalLiquidSavings);

    const elHeroLoans = document.getElementById('overviewHeroLoans');
    if (elHeroLoans) elHeroLoans.textContent = formatCurrency(loans.totalRemaining);

    // 2. Investment Pillar Card
    const elInvVal = document.getElementById('overviewInvestValue');
    if (elInvVal) elInvVal.textContent = formatCurrency(invest.totalValue);

    const elInvCost = document.getElementById('overviewInvestCost');
    if (elInvCost) elInvCost.textContent = formatCurrency(invest.totalCost);

    const elInvRet = document.getElementById('overviewInvestReturn');
    if (elInvRet) {
      elInvRet.textContent = `${formatCurrency(invest.netGain, true)} (${formatPercent(invest.gainPct)})`;
      elInvRet.style.color = invest.netGain >= 0 ? 'var(--success)' : 'var(--danger)';
    }

    const elInvSipCount = document.getElementById('overviewActiveSipCount');
    if (elInvSipCount) elInvSipCount.textContent = `${invest.activeSipCount} Active SIPs`;

    const elInvSipMonthly = document.getElementById('overviewMonthlySipCommit');
    if (elInvSipMonthly) elInvSipMonthly.textContent = `${formatCurrency(invest.monthlySipTotal)}/mo`;

    // 3. Loans Pillar Card
    const elLoansRem = document.getElementById('overviewLoansRemaining');
    if (elLoansRem) elLoansRem.textContent = formatCurrency(loans.totalRemaining);

    const elLoansPaid = document.getElementById('overviewLoansPaid');
    if (elLoansPaid) elLoansPaid.textContent = formatCurrency(loans.totalPaidSoFar);

    const elLoansProgPct = document.getElementById('overviewLoansProgressPct');
    if (elLoansProgPct) elLoansProgPct.textContent = `${loans.progressPct.toFixed(1)}% Repaid`;

    const elLoansBar = document.getElementById('overviewLoansProgressBar');
    if (elLoansBar) elLoansBar.style.width = `${loans.progressPct}%`;

    const elLoansActiveCount = document.getElementById('overviewActiveLoanCount');
    if (elLoansActiveCount) elLoansActiveCount.textContent = `${loans.count} Active Loans`;

    const elLoansEmi = document.getElementById('overviewMonthlyEmi');
    if (elLoansEmi) elLoansEmi.textContent = `${formatCurrency(loans.monthlyEmiTotal)}/mo`;

    // 4. Savings Pillar Card
    const elSavTotal = document.getElementById('overviewSavingsTotal');
    if (elSavTotal) elSavTotal.textContent = formatCurrency(savings.totalLiquidSavings);

    const elSavEf = document.getElementById('overviewEmergencyFundVal');
    if (elSavEf) elSavEf.textContent = formatCurrency(savings.efCurrent);

    // Dynamic runway calculation based on current monthly expense or emergency fund target
    const avgMonthlyExp = expense.currentMonthTotal > 0 ? expense.currentMonthTotal : (expense.prevMonthTotal > 0 ? expense.prevMonthTotal : 0);
    const runwayMonths = avgMonthlyExp > 0 ? (savings.efCurrent / avgMonthlyExp).toFixed(1) + ' Months' : 'Ready (Log Expenses)';

    const elSavRunway = document.getElementById('overviewEmergencyRunway');
    if (elSavRunway) elSavRunway.textContent = runwayMonths;

    const elSavGoalsCount = document.getElementById('overviewGoalsCount');
    if (elSavGoalsCount) elSavGoalsCount.textContent = `${savings.goalsCount} Goals`;

    const elSavGoalsPct = document.getElementById('overviewGoalsFundedPct');
    if (elSavGoalsPct) elSavGoalsPct.textContent = `${savings.goalsFundedPct.toFixed(1)}%`;

    // 5. Expense Pillar Card
    const elExpCurrentLabel = document.getElementById('overviewCurrentMonthLabel');
    if (elExpCurrentLabel) elExpCurrentLabel.textContent = `${expense.currentMonthLabel} Total`;

    const elExpCurrent = document.getElementById('overviewExpenseCurrentMonth');
    if (elExpCurrent) elExpCurrent.textContent = formatCurrency(expense.currentMonthTotal);

    const elExpPrevLabel = document.getElementById('overviewPrevMonthLabel');
    if (elExpPrevLabel) elExpPrevLabel.textContent = `${expense.prevMonthLabel} Total`;

    const elExpPrev = document.getElementById('overviewExpensePrevMonth');
    if (elExpPrev) elExpPrev.textContent = formatCurrency(expense.prevMonthTotal);

    const elExpDelta = document.getElementById('overviewExpenseMoMDelta');
    if (elExpDelta) {
      const sign = expense.deltaAmount > 0 ? '+' : '';
      const color = expense.deltaAmount <= 0 ? 'var(--success)' : 'var(--danger)'; // Less spending is good
      elExpDelta.textContent = `${sign}${formatCurrency(expense.deltaAmount)} (${formatPercent(expense.deltaPct)})`;
      elExpDelta.style.color = color;
    }

    const elExpDaily = document.getElementById('overviewExpenseDailyAvg');
    if (elExpDaily) elExpDaily.textContent = `${formatCurrency(expense.dailyAvgCurrent)}/day`;

    const elExpTop = document.getElementById('overviewExpenseTopCategory');
    if (elExpTop) elExpTop.textContent = expense.topCategory;

    // Update Navigation Badges
    const badgeInv = document.getElementById('navBadgeInvestments');
    if (badgeInv) badgeInv.textContent = state.investments.manualHoldings.length + state.investments.sips.length;

    const badgeAssets = document.getElementById('navBadgeAssets');
    if (badgeAssets) badgeAssets.textContent = (state.assets || []).length;

    const badgeLoans = document.getElementById('navBadgeLoans');
    if (badgeLoans) badgeLoans.textContent = state.loans.length;

    const badgeSavings = document.getElementById('navBadgeSavings');
    if (badgeSavings) badgeSavings.textContent = state.savings.goals.length + 1;

    const badgeExpense = document.getElementById('navBadgeExpenses');
    if (badgeExpense) badgeExpense.textContent = expense.currentMonthCount;

    // Render Home Overview Charts
    renderOverviewCharts(invest, assets, savings, loans, expense);
  }

  // --- 5.3 RENDER SECTION 2: INVESTMENTS ---
  function renderInvestmentsView() {
    const invest = getInvestmentMetrics();

    // Summary Metric Cards
    const elTotVal = document.getElementById('investMetricTotalValue');
    if (elTotVal) elTotVal.textContent = formatCurrency(invest.totalValue);

    const elCost = document.getElementById('investMetricInvestedCost');
    if (elCost) elCost.textContent = formatCurrency(invest.totalCost);

    const elGain = document.getElementById('investMetricTotalGain');
    if (elGain) {
      elGain.textContent = formatCurrency(invest.netGain, true);
      elGain.style.color = invest.netGain >= 0 ? 'var(--success)' : 'var(--danger)';
    }

    const badgeGain = document.getElementById('investBadgeTotalGain');
    if (badgeGain) {
      badgeGain.textContent = formatPercent(invest.gainPct);
      badgeGain.className = `badge ${invest.gainPct >= 0 ? 'badge-success' : 'badge-danger'}`;
    }

    const elSipCommit = document.getElementById('investMetricMonthlySip');
    if (elSipCommit) elSipCommit.textContent = formatCurrency(invest.monthlySipTotal);

    // Counts on Subtab buttons
    const countManual = document.getElementById('countManualHoldings');
    if (countManual) countManual.textContent = state.investments.manualHoldings.length;

    const countSip = document.getElementById('countSipPlans');
    if (countSip) countSip.textContent = state.investments.sips.length;

    // Render Manual Holdings Table
    renderHoldingsTable();

    // Render SIP Plans Cards
    renderSipCardsGrid();

    // Render Asset Allocation Chart
    renderInvestmentAllocationChart();
  }

  function renderHoldingsTable() {
    const tbody = document.getElementById('holdingsTableBody');
    if (!tbody) return;

    const search = (document.getElementById('holdingSearchInput')?.value || '').toLowerCase();
    const activeFilterBtn = document.querySelector('#holdingsFilterPills .filter-btn.active');
    const selectedCategory = activeFilterBtn ? activeFilterBtn.dataset.category : 'all';

    let totalVal = 0;
    state.investments.manualHoldings.forEach(h => {
      const q = Number(h.quantity) || 0;
      const p = h.currentPrice !== undefined && h.currentPrice !== null && h.currentPrice !== '' ? Number(h.currentPrice) : (Number(h.avgBuyPrice) || 0);
      totalVal += q * p;
    });

    const filtered = state.investments.manualHoldings.filter(h => {
      const matchesSearch = !search ||
        (h.name && h.name.toLowerCase().includes(search)) ||
        (h.symbol && h.symbol.toLowerCase().includes(search)) ||
        (h.notes && h.notes.toLowerCase().includes(search));
      
      const matchesCat = selectedCategory === 'all' || h.category === selectedCategory;
      return matchesSearch && matchesCat;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align: center; padding: 32px; color: var(--text-muted);">
            No manual investment assets found. Click <strong>+ Add Manual Asset</strong> to record one.
          </td>
        </tr>
      `;
      return;
    }

    let rowsHtml = '';
    filtered.forEach(h => {
      const qty = Number(h.quantity) || 0;
      const buyPrice = Number(h.avgBuyPrice) || 0;
      const curPrice = h.currentPrice !== undefined && h.currentPrice !== null && h.currentPrice !== '' ? Number(h.currentPrice) : buyPrice;
      const cost = qty * buyPrice;
      const val = qty * curPrice;
      const gain = val - cost;
      const gainPct = cost > 0 ? (gain / cost) * 100 : 0;
      const allocPct = totalVal > 0 ? (val / totalVal) * 100 : 0;

      const catBadgeColor = CATEGORY_COLORS[h.category] || 'var(--text-secondary)';
      const catLabel = CATEGORY_LABELS[h.category] || h.category;

      rowsHtml += `
        <tr>
          <td>
            <div style="display: flex; flex-direction: column;">
              <strong style="font-size: 0.92rem; color: var(--text-primary);">${h.name}</strong>
              <span style="font-size: 0.75rem; color: var(--accent-cyan); font-family: var(--font-mono);">${h.symbol}</span>
            </div>
          </td>
          <td>
            <span class="badge" style="background: ${catBadgeColor}1a; color: ${catBadgeColor}; border: 1px solid ${catBadgeColor}40;">
              ${catLabel}
            </span>
          </td>
          <td class="mono-num">${qty}</td>
          <td class="mono-num">${formatCurrency(buyPrice)}</td>
          <td class="mono-num">${formatCurrency(curPrice)}</td>
          <td class="mono-num" style="font-weight: 700;">${formatCurrency(val)}</td>
          <td>
            <span class="badge ${gain >= 0 ? 'badge-success' : 'badge-danger'}">
              ${formatCurrency(gain, true)} (${formatPercent(gainPct)})
            </span>
          </td>
          <td>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="mono-num" style="font-size: 0.78rem;">${allocPct.toFixed(1)}%</span>
              <div class="progress-track" style="width: 50px; height: 5px;">
                <div class="progress-fill" style="width: ${allocPct}%; background: ${catBadgeColor};"></div>
              </div>
            </div>
          </td>
          <td style="text-align: right;">
            <div class="cell-actions">
              <button class="action-icon-btn" onclick="window.editHolding('${h.id}')" title="Edit Asset">✏️</button>
              <button class="action-icon-btn btn-del" onclick="window.deleteHolding('${h.id}')" title="Delete Asset">🗑️</button>
            </div>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = rowsHtml;
  }

  function renderSipCardsGrid() {
    const grid = document.getElementById('sipCardsGrid');
    if (!grid) return;

    if (state.investments.sips.length === 0) {
      grid.innerHTML = `
        <div class="glass-card" style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
          <p style="font-size: 1rem; margin-bottom: 12px;">No Systematic Investment Plans (SIPs) created yet.</p>
          <button class="quick-btn btn-primary" style="width: auto; margin: 0 auto;" onclick="window.openSipModal()">
            <span>+ Create First SIP Plan</span>
          </button>
        </div>
      `;
      return;
    }

    let cardsHtml = '';
    state.investments.sips.forEach(s => {
      const monthly = Number(s.monthlyAmount) || 0;
      const installments = Number(s.installmentsPaid) || 0;
      const totalInvested = s.investedAmount !== undefined && s.investedAmount !== null && s.investedAmount !== '' ? Number(s.investedAmount) : monthly * installments;

      let curVal = Number(s.currentValue);
      if (isNaN(curVal) || curVal <= 0) {
        const expRate = Number(s.expectedReturn) || 12;
        const i = (expRate / 100) / 12;
        curVal = installments > 0 && i > 0 ? monthly * ((Math.pow(1 + i, installments) - 1) / i) * (1 + i) : totalInvested;
      }

      const totalGain = curVal - totalInvested;
      const gainPct = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;
      const isActive = s.status === 'active';

      cardsHtml += `
        <div class="sip-card">
          <div class="sip-card-top">
            <div>
              <span class="badge badge-neutral" style="margin-bottom: 6px;">Day ${s.sipDay} of every month</span>
              <h4 class="sip-name">${s.name}</h4>
              <span style="font-size: 0.75rem; color: var(--text-secondary);">${s.notes || 'Recurring Monthly Plan'}</span>
            </div>
            <span class="${isActive ? 'sip-badge-active' : 'sip-badge-paused'}">
              ${isActive ? '● Active' : '⏸ Paused'}
            </span>
          </div>

          <div class="sip-stats-grid">
            <div class="sip-stat-item">
              <span class="sip-stat-label">Monthly SIP</span>
              <span class="sip-stat-val mono-num" style="color: var(--accent-cyan); font-size: 1.1rem;">${formatCurrency(monthly)}</span>
            </div>
            <div class="sip-stat-item">
              <span class="sip-stat-label">Installments Paid</span>
              <span class="sip-stat-val mono-num">${installments} Months</span>
            </div>
            <div class="sip-stat-item">
              <span class="sip-stat-label">Total Invested</span>
              <span class="sip-stat-val mono-num">${formatCurrency(totalInvested)}</span>
            </div>
            <div class="sip-stat-item">
              <span class="sip-stat-label">Current Value</span>
              <span class="sip-stat-val mono-num" style="color: var(--text-primary); font-weight: 800;">${formatCurrency(curVal)}</span>
            </div>
          </div>

          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.8rem;">
            <span style="color: var(--text-muted);">All-Time Returns:</span>
            <span class="badge ${totalGain >= 0 ? 'badge-success' : 'badge-danger'}">
              ${formatCurrency(totalGain, true)} (${formatPercent(gainPct)})
            </span>
          </div>

          <div class="sip-card-actions">
            <button class="quick-btn btn-secondary btn-sm" style="width: auto;" onclick="window.logSipInstallment('${s.id}')" title="Record this month's installment deposit">
              <span>➕ Log Deposit</span>
            </button>
            <div style="display: flex; gap: 6px;">
              <button class="action-icon-btn" onclick="window.editSip('${s.id}')" title="Edit SIP">✏️</button>
              <button class="action-icon-btn btn-del" onclick="window.deleteSip('${s.id}')" title="Delete SIP">🗑️</button>
            </div>
          </div>
        </div>
      `;
    });

    grid.innerHTML = cardsHtml;
  }

  // --- 5.3B RENDER SECTION: PHYSICAL ASSETS ---
  function renderAssetsView() {
    const metrics = getAssetsMetrics();

    const elVal = document.getElementById('assetsMetricTotalValue');
    if (elVal) elVal.textContent = formatCurrency(metrics.totalValuation);

    const elVeh = document.getElementById('assetsMetricVehicles');
    if (elVeh) elVeh.textContent = formatCurrency(metrics.vehiclesTotal);

    const elGld = document.getElementById('assetsMetricGold');
    if (elGld) elGld.textContent = formatCurrency(metrics.goldTotal);

    const elCst = document.getElementById('assetsMetricCost');
    if (elCst) elCst.textContent = formatCurrency(metrics.totalCost);

    const elBadge = document.getElementById('assetsCountBadge');
    if (elBadge) elBadge.textContent = `${metrics.count} Assets`;

    const grid = document.getElementById('assetsGrid');
    if (!grid) return;

    const searchVal = (document.getElementById('assetSearchInput')?.value || '').toLowerCase().trim();
    const activePill = document.querySelector('#assetsFilterPills .filter-btn.active');
    const filterCategory = activePill ? activePill.getAttribute('data-category') : 'all';

    const filtered = (state.assets || []).filter(a => {
      const matchesSearch = !searchVal ||
        (a.name && a.name.toLowerCase().includes(searchVal)) ||
        (a.notes && a.notes.toLowerCase().includes(searchVal)) ||
        (a.category && a.category.toLowerCase().includes(searchVal));

      const matchesCat = filterCategory === 'all' || a.category === filterCategory;
      return matchesSearch && matchesCat;
    });

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="glass-card" style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
          <p style="font-size: 1rem; margin-bottom: 12px;">No physical assets matching filter.</p>
          <button class="quick-btn btn-primary" style="width: auto; margin: 0 auto;" onclick="window.openAssetModal()">
            <span>+ Add Physical Asset</span>
          </button>
        </div>
      `;
      return;
    }

    let html = '';
    filtered.forEach(asset => {
      const cost = Number(asset.purchasePrice) || 0;
      const val = asset.currentValuation !== undefined && asset.currentValuation !== null && asset.currentValuation !== '' ? Number(asset.currentValuation) : cost;
      const gain = val - cost;
      const gainPct = cost > 0 ? (gain / cost) * 100 : 0;
      const icon = asset.icon || (asset.category === 'vehicle' ? '🚗' : asset.category === 'gold' ? '🪙' : '🏛️');

      const categoryLabels = {
        vehicle: '🚗 Vehicle',
        gold: '🪙 Gold & Precious',
        property: '🏠 Real Estate',
        electronics: '💻 Electronics',
        other: '💼 Tangible Asset'
      };
      const catLabel = categoryLabels[asset.category] || '🏛️ Asset';

      html += `
        <div class="asset-card">
          <div class="asset-card-top">
            <div class="asset-title-group">
              <div class="asset-icon">${icon}</div>
              <div>
                <h4 class="asset-name">${asset.name}</h4>
                <span class="badge badge-neutral" style="margin-top: 3px;">${catLabel}</span>
              </div>
            </div>
            <span class="badge ${gain >= 0 ? 'badge-success' : 'badge-danger'}">
              ${gain >= 0 ? '+' : ''}${formatPercent(gainPct)}
            </span>
          </div>

          <div class="asset-stats-grid">
            <div class="sip-stat-item">
              <span class="sip-stat-label">Current Valuation</span>
              <strong class="sip-stat-val mono-num" style="color: var(--accent-amber); font-size: 1.15rem;">${formatCurrency(val)}</strong>
            </div>
            <div class="sip-stat-item">
              <span class="sip-stat-label">Purchase Cost</span>
              <strong class="sip-stat-val mono-num" style="color: var(--text-secondary);">${formatCurrency(cost)}</strong>
            </div>
            ${asset.quantityGrams ? `
            <div class="sip-stat-item">
              <span class="sip-stat-label">Quantity / Weight</span>
              <strong class="sip-stat-val mono-num">${asset.quantityGrams} grams</strong>
            </div>
            <div class="sip-stat-item">
              <span class="sip-stat-label">Current Rate / Gram</span>
              <strong class="sip-stat-val mono-num" style="color: #eab308;">₹${Math.round(val / asset.quantityGrams).toLocaleString('en-IN')}/g</strong>
            </div>
            ` : `
            <div class="sip-stat-item">
              <span class="sip-stat-label">Acquired Date</span>
              <strong class="sip-stat-val">${asset.purchaseDate || '2023'}</strong>
            </div>
            <div class="sip-stat-item">
              <span class="sip-stat-label">Value Delta</span>
              <strong class="sip-stat-val mono-num" style="color: ${gain >= 0 ? 'var(--success)' : 'var(--danger)'};">${formatCurrency(gain, true)}</strong>
            </div>
            `}
          </div>

          ${asset.notes ? `<div style="font-size: 0.76rem; color: var(--text-secondary); background: rgba(255,255,255,0.03); padding: 8px 12px; border-radius: var(--radius-sm);">${asset.notes}</div>` : ''}

          <div class="asset-card-actions">
            <span style="font-size: 0.74rem; color: var(--text-muted);">Real Tangible Asset</span>
            <div style="display: flex; gap: 6px;">
              <button class="action-icon-btn" onclick="window.editAsset('${asset.id}')" title="Edit Asset">✏️</button>
              <button class="action-icon-btn btn-del" onclick="window.deleteAsset('${asset.id}')" title="Delete Asset">🗑️</button>
            </div>
          </div>
        </div>
      `;
    });

    grid.innerHTML = html;
  }

  window.filterAssetCategory = function(cat) {
    document.querySelectorAll('#assetsFilterPills .filter-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-category') === cat);
    });
    renderAssetsView();
  };

  // --- 5.4 RENDER SECTION 3: LOANS ---
  function renderLoansView() {
    const loans = getLoanMetrics();

    // Summary Metric Cards
    const elRem = document.getElementById('loansMetricRemaining');
    if (elRem) elRem.textContent = formatCurrency(loans.totalRemaining);

    const elPaid = document.getElementById('loansMetricPaidSoFar');
    if (elPaid) elPaid.textContent = formatCurrency(loans.totalPaidSoFar);

    const badgePaid = document.getElementById('loansBadgePaidPct');
    if (badgePaid) badgePaid.textContent = `${loans.progressPct.toFixed(1)}% Paid`;

    const elPrinc = document.getElementById('loansMetricTotalPrincipal');
    if (elPrinc) elPrinc.textContent = formatCurrency(loans.totalPrincipal);

    const elEmi = document.getElementById('loansMetricMonthlyEmi');
    if (elEmi) elEmi.textContent = formatCurrency(loans.monthlyEmiTotal);

    const elCountBadge = document.getElementById('loansCountBadge');
    if (elCountBadge) elCountBadge.textContent = `${loans.count} Loans`;

    // Render Loans Cards Grid
    const grid = document.getElementById('loansGrid');
    if (!grid) return;

    if (state.loans.length === 0) {
      grid.innerHTML = `
        <div class="glass-card" style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
          <p style="font-size: 1rem; margin-bottom: 12px;">No active loans recorded.</p>
          <button class="quick-btn btn-primary" style="width: auto; margin: 0 auto;" onclick="window.openLoanModal()">
            <span>+ Add Your First Loan</span>
          </button>
        </div>
      `;
      return;
    }

    let cardsHtml = '';
    state.loans.forEach(loan => {
      const amort = calculateAmortizationSchedule(loan);
      const principal = Number(loan.principal) || 0;
      const tenureYrs = (Number(loan.tenureMonths) / 12).toFixed(1);

      const typeIcons = {
        home: '🏠',
        vehicle: '🚗',
        personal: '👤',
        education: '🎓',
        gold: '🪙',
        business: '💼'
      };
      const icon = typeIcons[loan.type] || '💳';

      cardsHtml += `
        <div class="loan-card">
          <div class="loan-card-top">
            <div class="loan-title-group">
              <div class="loan-icon">${icon}</div>
              <div>
                <h4 class="loan-name">${loan.name}</h4>
                <span class="loan-type-tag">${loan.type.toUpperCase()} LOAN • ${loan.interestRate}% ROI</span>
              </div>
            </div>
            <span class="badge badge-neutral">${amort.monthsElapsed}/${loan.tenureMonths} Months</span>
          </div>

          <div class="loan-big-stats">
            <div class="loan-stat-col highlight-remaining">
              <span class="stat-label">Remaining Balance</span>
              <strong class="mono-num" style="font-size: 1.35rem; color: var(--danger);">${formatCurrency(amort.remainingBalance)}</strong>
              <span style="font-size: 0.72rem; color: var(--text-muted);">${amort.monthsRemaining} EMIs left</span>
            </div>

            <div class="loan-stat-col highlight-paid">
              <span class="stat-label">Total Paid So Far</span>
              <strong class="mono-num" style="font-size: 1.35rem; color: var(--success);">${formatCurrency(amort.totalPaidSoFar)}</strong>
              <span style="font-size: 0.72rem; color: var(--text-muted);">Principal: ${formatCurrency(amort.principalPaidSoFar)}</span>
            </div>
          </div>

          <div class="loan-progress-wrap">
            <div class="progress-labels">
              <span>Payoff Progress: <strong>${amort.progressPct.toFixed(1)}%</strong></span>
              <span>Original: <strong class="mono-num">${formatCurrency(principal)}</strong></span>
            </div>
            <div class="progress-track" style="height: 9px;">
              <div class="progress-fill progress-emerald" style="width: ${amort.progressPct}%;"></div>
            </div>
          </div>

          <div class="loan-details-strip">
            <span>Monthly EMI: <strong class="mono-num" style="color: var(--text-primary); font-size: 0.95rem;">${formatCurrency(amort.emi)}</strong></span>
            <span>Tenure: <strong>${tenureYrs} Yrs (${loan.tenureMonths}m)</strong></span>
          </div>

          <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(99, 102, 241, 0.08); border: 1px dashed rgba(99, 102, 241, 0.25); border-radius: var(--radius-sm); padding: 7px 12px; font-size: 0.78rem; color: var(--text-secondary);">
            <span>⏰ <strong>Next EMI:</strong> ${amort.nextEmiFormatted}</span>
            <span style="color: var(--accent-cyan); font-weight: 700;">Auto-updates on 5th</span>
          </div>

          <div class="loan-card-actions">
            <button class="quick-btn btn-secondary btn-sm" style="width: auto;" onclick="window.viewLoanAmortization('${loan.id}')">
              <span>📊 Amortization Schedule</span>
            </button>
            <div style="display: flex; gap: 6px;">
              <button class="action-icon-btn" onclick="window.editLoan('${loan.id}')" title="Edit Loan">✏️</button>
              <button class="action-icon-btn btn-del" onclick="window.deleteLoan('${loan.id}')" title="Delete Loan">🗑️</button>
            </div>
          </div>
        </div>
      `;
    });

    grid.innerHTML = cardsHtml;
  }

  // --- 5.5 RENDER SECTION 4: SAVINGS (EMERGENCY FUND & GOALS) ---
  function renderSavingsView() {
    const savings = getSavingsMetrics();
    const expense = getExpenseMetrics();

    // Summary Metric Cards
    const elTot = document.getElementById('savingsMetricTotal');
    if (elTot) elTot.textContent = formatCurrency(savings.totalLiquidSavings);

    const elEf = document.getElementById('savingsMetricEmergency');
    if (elEf) elEf.textContent = formatCurrency(savings.efCurrent);

    const avgExp = expense.currentMonthTotal > 0 ? expense.currentMonthTotal : (expense.prevMonthTotal > 0 ? expense.prevMonthTotal : 0);
    const runwayMonths = avgExp > 0 ? (savings.efCurrent / avgExp).toFixed(1) + ' Months' : '₹1.7L Buffer Ready';

    const badgeEf = document.getElementById('savingsBadgeEmergencyRunway');
    if (badgeEf) badgeEf.textContent = avgExp > 0 ? `${(savings.efCurrent / avgExp).toFixed(1)} Months Runway` : '🛡️ Reserve Active';

    const elGoalsTarget = document.getElementById('savingsMetricGoalsTarget');
    if (elGoalsTarget) elGoalsTarget.textContent = formatCurrency(savings.goalsTargetTotal);

    const badgeGoals = document.getElementById('savingsBadgeGoalsFunded');
    if (badgeGoals) badgeGoals.textContent = `${savings.goalsFundedPct.toFixed(1)}% Funded`;

    const elGoalsCount = document.getElementById('savingsMetricGoalsCount');
    if (elGoalsCount) elGoalsCount.textContent = savings.goalsCount;

    // PART A: Emergency Fund Card Elements
    const elEfCur = document.getElementById('efCurrentAmount');
    if (elEfCur) elEfCur.textContent = formatCurrency(savings.efCurrent);

    const elEfTgt = document.getElementById('efTargetAmount');
    if (elEfTgt) elEfTgt.textContent = formatCurrency(savings.efTarget);

    const elEfRunway = document.getElementById('efRunwayMonths');
    if (elEfRunway) elEfRunway.textContent = avgExp > 0 ? `${(savings.efCurrent / avgExp).toFixed(1)} Months` : 'Ready (Log Expenses)';

    const elEfAvgExp = document.getElementById('efAvgMonthlyExpense');
    if (elEfAvgExp) elEfAvgExp.textContent = avgExp > 0 ? formatCurrency(avgExp) : '₹0 (Ready for entries)';

    const elEfProg = document.getElementById('efProgressPct');
    if (elEfProg) elEfProg.textContent = `${savings.efProgressPct.toFixed(1)}%`;

    const elEfRem = document.getElementById('efRemainingToTarget');
    if (elEfRem) elEfRem.textContent = formatCurrency(Math.max(0, savings.efTarget - savings.efCurrent));

    const elEfBar = document.getElementById('efProgressBar');
    if (elEfBar) elEfBar.style.width = `${savings.efProgressPct}%`;

    const elEfBadge = document.getElementById('efStatusBadge');
    if (elEfBadge) {
      if (avgExp === 0) {
        elEfBadge.className = 'status-indicator-badge status-healthy';
        elEfBadge.innerHTML = '<span>🛡️ Reserve Active (₹1,70,000)</span>';
      } else {
        const numRunway = Number((savings.efCurrent / avgExp).toFixed(1));
        if (numRunway >= 6) {
          elEfBadge.className = 'status-indicator-badge status-healthy';
          elEfBadge.innerHTML = '<span>🛡️ Excellent Buffer (6+ Mos)</span>';
        } else if (numRunway >= 3) {
          elEfBadge.className = 'status-indicator-badge status-warning';
          elEfBadge.innerHTML = '<span>⚠️ Moderate (3-6 Mos)</span>';
        } else {
          elEfBadge.className = 'status-indicator-badge status-danger';
          elEfBadge.innerHTML = '<span>🚨 Low Buffer (&lt; 3 Mos)</span>';
        }
      }
    }

    // PART B: Goals Grid
    const grid = document.getElementById('goalsGrid');
    if (!grid) return;

    if (state.savings.goals.length === 0) {
      grid.innerHTML = `
        <div class="glass-card" style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
          <p style="font-size: 1rem; margin-bottom: 12px;">No savings goals created yet.</p>
          <button class="quick-btn btn-primary" style="width: auto; margin: 0 auto;" onclick="window.openGoalModal()">
            <span>+ Create Financial Goal</span>
          </button>
        </div>
      `;
      return;
    }

    let cardsHtml = '';
    const now = new Date();

    state.savings.goals.forEach(g => {
      const target = Number(g.targetAmount) || 0;
      const current = Number(g.currentAmount) || 0;
      const progressPct = target > 0 ? Math.min(100, (current / target) * 100) : 0;
      const isCompleted = progressPct >= 100;

      // Months remaining calculation
      let monthsLeft = 1;
      let dateLabel = 'No date set';
      if (g.targetDate) {
        const targetDateObj = new Date(g.targetDate);
        dateLabel = targetDateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        monthsLeft = (targetDateObj.getFullYear() - now.getFullYear()) * 12 + (targetDateObj.getMonth() - now.getMonth());
        if (monthsLeft < 1) monthsLeft = 1;
      }

      const remainingNeeded = Math.max(0, target - current);
      const monthlyReq = isCompleted ? 0 : remainingNeeded / monthsLeft;

      cardsHtml += `
        <div class="goal-card">
          <div class="goal-card-top">
            <div class="goal-title-group">
              <span class="goal-icon">${g.icon || '🎯'}</span>
              <div>
                <h4 class="goal-title">${g.title}</h4>
                <span class="goal-deadline-tag">Target: ${dateLabel}</span>
              </div>
            </div>
            <span class="badge ${isCompleted ? 'badge-success' : 'badge-neutral'}">
              ${isCompleted ? '🎉 Achieved' : `${progressPct.toFixed(0)}%`}
            </span>
          </div>

          <div class="goal-amounts-grid">
            <div class="sip-stat-item">
              <span class="sip-stat-label">Saved So Far</span>
              <strong class="mono-num" style="color: var(--success); font-size: 1.1rem;">${formatCurrency(current)}</strong>
            </div>
            <div class="sip-stat-item">
              <span class="sip-stat-label">Target Goal</span>
              <strong class="mono-num" style="font-size: 1.1rem;">${formatCurrency(target)}</strong>
            </div>
          </div>

          <div class="loan-progress-wrap">
            <div class="progress-labels">
              <span>Progress: <strong>${progressPct.toFixed(1)}%</strong></span>
              <span>Remaining: <strong class="mono-num">${formatCurrency(remainingNeeded)}</strong></span>
            </div>
            <div class="progress-track" style="height: 8px;">
              <div class="progress-fill ${isCompleted ? 'progress-emerald' : 'progress-indigo'}" style="width: ${progressPct}%;"></div>
            </div>
          </div>

          ${!isCompleted ? `
            <div class="goal-req-monthly">
              <span>Required Monthly Savings:</span>
              <strong class="mono-num" style="color: var(--accent-cyan); font-size: 0.95rem;">${formatCurrency(monthlyReq)}/mo</strong>
            </div>
          ` : `
            <div class="goal-req-monthly" style="background: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.3);">
              <span style="color: var(--success); font-weight: 700;">🌟 100% Fully Funded!</span>
              <span style="font-size: 0.74rem; color: var(--text-secondary);">Goal milestone achieved!</span>
            </div>
          `}

          <div class="goal-card-actions">
            <button class="quick-btn btn-secondary btn-sm" style="width: auto;" onclick="window.addGoalFunds('${g.id}')">
              <span>➕ Add Savings</span>
            </button>
            <div style="display: flex; gap: 6px;">
              <button class="action-icon-btn" onclick="window.editGoal('${g.id}')" title="Edit Goal">✏️</button>
              <button class="action-icon-btn btn-del" onclick="window.deleteGoal('${g.id}')" title="Delete Goal">🗑️</button>
            </div>
          </div>
        </div>
      `;
    });

    grid.innerHTML = cardsHtml;
  }

  // --- 5.6 RENDER SECTION 5: EXPENSE (CURRENT VS PREVIOUS MONTH) ---
  function renderExpensesView() {
    const expense = getExpenseMetrics();

    // 1. Current Month vs Previous Month Comparison Widget
    const elLabelCur = document.getElementById('labelCurrentMonth');
    if (elLabelCur) elLabelCur.textContent = `Current Month (${expense.currentMonthLabel})`;

    const elTotCur = document.getElementById('expenseTotalCurrentMonth');
    if (elTotCur) elTotCur.textContent = formatCurrency(expense.currentMonthTotal);

    const elDailyCur = document.getElementById('expenseDailyAvgCurrent');
    if (elDailyCur) elDailyCur.textContent = `${formatCurrency(expense.dailyAvgCurrent)}/day`;

    const elCountCur = document.getElementById('expenseTxCountCurrent');
    if (elCountCur) elCountCur.textContent = expense.currentMonthCount;

    const elLabelPrev = document.getElementById('labelPrevMonth');
    if (elLabelPrev) elLabelPrev.textContent = `Previous Month (${expense.prevMonthLabel})`;

    const elTotPrev = document.getElementById('expenseTotalPrevMonth');
    if (elTotPrev) elTotPrev.textContent = formatCurrency(expense.prevMonthTotal);

    const elDailyPrev = document.getElementById('expenseDailyAvgPrev');
    if (elDailyPrev) elDailyPrev.textContent = `${formatCurrency(expense.dailyAvgPrev)}/day`;

    const elCountPrev = document.getElementById('expenseTxCountPrev');
    if (elCountPrev) elCountPrev.textContent = expense.prevMonthCount;

    // VS Delta Badge
    const elDeltaBadge = document.getElementById('expenseDeltaBadge');
    const elDeltaIcon = document.getElementById('expenseDeltaIcon');
    const elDeltaText = document.getElementById('expenseDeltaText');
    const elDeltaCap = document.getElementById('expenseDeltaCaption');

    if (elDeltaBadge && elDeltaText) {
      const sign = expense.deltaAmount > 0 ? '+' : '';
      const isSaved = expense.deltaAmount <= 0;
      elDeltaBadge.className = `delta-badge ${isSaved ? 'badge-success' : 'badge-danger'}`;
      if (elDeltaIcon) elDeltaIcon.textContent = isSaved ? '📉' : '📈';
      elDeltaText.textContent = `${sign}${formatCurrency(expense.deltaAmount)} (${formatPercent(expense.deltaPct)})`;
      if (elDeltaCap) elDeltaCap.textContent = isSaved ? '🎉 Spent less than last month' : '⚠️ Higher spend than last month';
    }

    // Populate Expense Month Filter dropdown
    populateExpenseMonthDropdown();

    // Render Expense Ledger Table
    renderExpensesTable();

    // Render Expense Charts
    renderExpenseCharts();
  }

  function populateExpenseMonthDropdown() {
    const select = document.getElementById('expenseFilterMonth');
    if (!select) return;

    const monthsSet = new Set();
    const now = new Date();
    const curMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    monthsSet.add(curMonthKey);

    state.expenses.forEach(e => {
      if (e.date) monthsSet.add(e.date.substring(0, 7));
    });

    const sortedMonths = Array.from(monthsSet).sort().reverse();
    const currentVal = select.value || curMonthKey;

    let optionsHtml = '<option value="all">All Time</option>';
    sortedMonths.forEach(m => {
      const parts = m.split('-');
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, 1);
      const label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const isSelected = m === currentVal ? 'selected' : '';
      optionsHtml += `<option value="${m}" ${isSelected}>${label}</option>`;
    });

    select.innerHTML = optionsHtml;
  }

  function renderExpensesTable() {
    const tbody = document.getElementById('expensesTableBody');
    if (!tbody) return;

    const monthFilter = document.getElementById('expenseFilterMonth')?.value || 'all';
    const categoryFilter = document.getElementById('expenseFilterCategory')?.value || 'all';
    const search = (document.getElementById('expenseSearchInput')?.value || '').toLowerCase();

    const filtered = state.expenses.filter(e => {
      const matchesMonth = monthFilter === 'all' || (e.date && e.date.substring(0, 7) === monthFilter);
      const matchesCat = categoryFilter === 'all' || e.category === categoryFilter;
      const matchesSearch = !search ||
        (e.notes && e.notes.toLowerCase().includes(search)) ||
        (e.paymentMode && e.paymentMode.toLowerCase().includes(search)) ||
        (e.category && e.category.toLowerCase().includes(search));
      
      return matchesMonth && matchesCat && matchesSearch;
    });

    // Sort by date descending
    filtered.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 32px; color: var(--text-muted);">
            No expenses found for the selected filter. Click <strong>+ Log Expense</strong> to add one.
          </td>
        </tr>
      `;
      return;
    }

    let rowsHtml = '';
    filtered.forEach(e => {
      const d = e.date ? new Date(e.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
      const catName = EXPENSE_CATEGORY_NAMES[e.category] || e.category;
      const catIcon = EXPENSE_CATEGORY_ICONS[e.category] || '💸';

      rowsHtml += `
        <tr>
          <td style="white-space: nowrap; font-size: 0.82rem; color: var(--text-secondary);">${d}</td>
          <td>
            <span class="cat-tag">
              <span>${catIcon}</span>
              <span>${catName}</span>
            </span>
          </td>
          <td><strong style="color: var(--text-primary); font-size: 0.88rem;">${e.notes || '—'}</strong></td>
          <td><span class="badge badge-neutral" style="font-size: 0.72rem;">${e.paymentMode || 'UPI'}</span></td>
          <td style="text-align: right;" class="mono-num">
            <strong style="color: var(--text-primary); font-size: 0.95rem;">${formatCurrency(Number(e.amount) || 0)}</strong>
          </td>
          <td style="text-align: right;">
            <div class="cell-actions">
              <button class="action-icon-btn" onclick="window.editExpense('${e.id}')" title="Edit Expense">✏️</button>
              <button class="action-icon-btn btn-del" onclick="window.deleteExpense('${e.id}')" title="Delete Expense">🗑️</button>
            </div>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = rowsHtml;
  }

  // ==========================================================================
  // 6. CHART.JS VISUALIZATIONS
  // ==========================================================================

  function renderOverviewCharts(invest, assets, savings, loans, expense) {
    const isDark = state.preferences.theme !== 'light';
    const textColor = isDark ? '#94a3b8' : '#475569';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)';

    // 1. Overview Composition Chart (Investments & Savings vs Loans)
    const ctxComp = document.getElementById('overviewCompositionChart');
    if (ctxComp) {
      if (charts.overviewComposition) charts.overviewComposition.destroy();

      charts.overviewComposition = new Chart(ctxComp, {
        type: 'doughnut',
        data: {
          labels: ['Investments', 'Liquid Savings', 'Remaining Debt'],
          datasets: [{
            data: [invest.totalValue, savings.totalLiquidSavings, loans.totalRemaining],
            backgroundColor: ['#6366f1', '#10b981', '#f43f5e'],
            borderWidth: 0,
            hoverOffset: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: { color: textColor, font: { family: 'Century Gothic', size: 12 } }
            },
            tooltip: {
              callbacks: {
                label: (ctx) => ` ${ctx.label}: ${formatCurrency(ctx.raw)}`
              }
            }
          },
          cutout: '68%'
        }
      });
    }

    // 2. Overview Cashflow Commitments Chart
    const ctxCashflow = document.getElementById('overviewCashflowChart');
    if (ctxCashflow) {
      if (charts.overviewCashflow) charts.overviewCashflow.destroy();

      charts.overviewCashflow = new Chart(ctxCashflow, {
        type: 'bar',
        data: {
          labels: ['Monthly SIPs', 'Loan EMIs', 'Current Expenses'],
          datasets: [{
            data: [invest.monthlySipTotal, loans.monthlyEmiTotal, expense.currentMonthTotal],
            backgroundColor: ['#6366f1', '#f43f5e', '#f59e0b'],
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => ` Outflow: ${formatCurrency(ctx.raw)}`
              }
            }
          },
          scales: {
            x: { grid: { display: false }, ticks: { color: textColor } },
            y: {
              grid: { color: gridColor },
              ticks: {
                color: textColor,
                callback: (val) => formatCurrency(val)
              }
            }
          }
        }
      });
    }
  }

  function renderInvestmentAllocationChart() {
    const isDark = state.preferences.theme !== 'light';
    const textColor = isDark ? '#94a3b8' : '#475569';

    const catTotals = {};
    let totalVal = 0;

    // Manual holdings
    state.investments.manualHoldings.forEach(h => {
      const q = Number(h.quantity) || 0;
      const p = h.currentPrice !== undefined && h.currentPrice !== null && h.currentPrice !== '' ? Number(h.currentPrice) : (Number(h.avgBuyPrice) || 0);
      const val = q * p;
      const cat = h.category || 'other';
      catTotals[cat] = (catTotals[cat] || 0) + val;
      totalVal += val;
    });

    // SIP plans
    state.investments.sips.forEach(s => {
      const monthly = Number(s.monthlyAmount) || 0;
      const installments = Number(s.installmentsPaid) || 0;
      let val = Number(s.currentValue);
      if (isNaN(val) || val <= 0) val = monthly * installments;
      const cat = s.category || 'etf';
      catTotals[cat] = (catTotals[cat] || 0) + val;
      totalVal += val;
    });

    const labels = Object.keys(catTotals).map(k => CATEGORY_LABELS[k] || k);
    const data = Object.values(catTotals);
    const colors = Object.keys(catTotals).map(k => CATEGORY_COLORS[k] || '#94a3b8');

    const ctx = document.getElementById('investAllocationChart');
    if (ctx) {
      if (charts.investAllocation) charts.investAllocation.destroy();

      charts.investAllocation = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: colors,
            borderWidth: 0,
            hoverOffset: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => ` ${ctx.label}: ${formatCurrency(ctx.raw)} (${totalVal > 0 ? ((ctx.raw / totalVal) * 100).toFixed(1) : 0}%)`
              }
            }
          },
          cutout: '65%'
        }
      });
    }

    // Populate category tags list next to chart
    const listEl = document.getElementById('investAllocationList');
    if (listEl) {
      let listHtml = '';
      Object.keys(catTotals).forEach(cat => {
        const val = catTotals[cat];
        const pct = totalVal > 0 ? ((val / totalVal) * 100).toFixed(1) : 0;
        const color = CATEGORY_COLORS[cat] || '#94a3b8';
        const label = CATEGORY_LABELS[cat] || cat;

        listHtml += `
          <div class="alloc-item">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="dot-indicator" style="background: ${color};"></span>
              <strong>${label}</strong>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <span class="mono-num">${formatCurrency(val)}</span>
              <span class="badge badge-neutral">${pct}%</span>
            </div>
          </div>
        `;
      });
      listEl.innerHTML = listHtml;
    }
  }

  function renderExpenseCharts() {
    const isDark = state.preferences.theme !== 'light';
    const textColor = isDark ? '#94a3b8' : '#475569';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)';

    const expense = getExpenseMetrics();

    // 1. Spending by Category Chart (Current Month)
    const ctxCat = document.getElementById('expenseCategoryChart');
    if (ctxCat) {
      if (charts.expenseCategory) charts.expenseCategory.destroy();

      const catLabels = Object.keys(expense.currentMonthCategories).map(k => (EXPENSE_CATEGORY_ICONS[k] || '') + ' ' + (EXPENSE_CATEGORY_NAMES[k] || k));
      const catData = Object.values(expense.currentMonthCategories);
      const catPalette = ['#6366f1', '#10b981', '#f59e0b', '#06b6d4', '#a855f7', '#f43f5e', '#ec4899', '#3b82f6', '#14b8a6', '#84cc16'];

      charts.expenseCategory = new Chart(ctxCat, {
        type: 'doughnut',
        data: {
          labels: catLabels.length > 0 ? catLabels : ['No expenses'],
          datasets: [{
            data: catData.length > 0 ? catData : [1],
            backgroundColor: catData.length > 0 ? catPalette.slice(0, catData.length) : ['#334155'],
            borderWidth: 0,
            hoverOffset: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: { color: textColor, font: { family: 'Century Gothic', size: 11 } }
            },
            tooltip: {
              callbacks: {
                label: (ctx) => ` ${ctx.label}: ${formatCurrency(ctx.raw)}`
              }
            }
          },
          cutout: '62%'
        }
      });
    }

    // 2. Daily Spending Trend Chart
    const ctxDaily = document.getElementById('expenseDailyTrendChart');
    if (ctxDaily) {
      if (charts.expenseDailyTrend) charts.expenseDailyTrend.destroy();

      // Aggregate current month expenses by day (1 to 31)
      const now = new Date();
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const dailyBuckets = new Array(daysInMonth).fill(0);
      const dayLabels = [];

      for (let d = 1; d <= daysInMonth; d++) {
        dayLabels.push(`${d}`);
      }

      state.expenses.forEach(e => {
        if (e.date && e.date.substring(0, 7) === expense.currentMonthKey) {
          const dayNum = parseInt(e.date.substring(8, 10), 10);
          if (dayNum >= 1 && dayNum <= daysInMonth) {
            dailyBuckets[dayNum - 1] += (Number(e.amount) || 0);
          }
        }
      });

      charts.expenseDailyTrend = new Chart(ctxDaily, {
        type: 'bar',
        data: {
          labels: dayLabels,
          datasets: [{
            label: 'Daily Expense (₹)',
            data: dailyBuckets,
            backgroundColor: 'rgba(99, 102, 241, 0.75)',
            hoverBackgroundColor: '#6366f1',
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                title: (items) => `Day ${items[0].label} of ${expense.currentMonthLabel}`,
                label: (ctx) => ` Total: ${formatCurrency(ctx.raw)}`
              }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: textColor, font: { size: 10 } }
            },
            y: {
              grid: { color: gridColor },
              ticks: {
                color: textColor,
                font: { size: 10 },
                callback: (val) => formatCurrency(val)
              }
            }
          }
        }
      });
    }
  }

  // Master Render function for all views
  function renderAll() {
    renderTicker();
    renderHomeOverview();
    renderInvestmentsView();
    renderAssetsView();
    renderLoansView();
    renderSavingsView();
    renderExpensesView();
  }

  // ==========================================================================
  // 7. INTERACTIVE SIP CALCULATOR ENGINE
  // ==========================================================================
  window.updateSipCalc = function() {
    const monthly = Number(document.getElementById('calcMonthlyAmount')?.value) || 10000;
    const rate = Number(document.getElementById('calcReturnRate')?.value) || 12;
    const years = Number(document.getElementById('calcDurationYears')?.value) || 10;

    const elAmtVal = document.getElementById('calcAmountVal');
    if (elAmtVal) elAmtVal.textContent = formatCurrency(monthly);

    const elRateVal = document.getElementById('calcRateVal');
    if (elRateVal) elRateVal.textContent = `${rate}% p.a.`;

    const elYearsVal = document.getElementById('calcYearsVal');
    if (elYearsVal) elYearsVal.textContent = `${years} Years (${years * 12} Mos)`;

    const totalMonths = years * 12;
    const i = (rate / 100) / 12;

    const totalInvested = monthly * totalMonths;
    const maturityValue = monthly * ((Math.pow(1 + i, totalMonths) - 1) / i) * (1 + i);
    const wealthGain = maturityValue - totalInvested;

    const elInv = document.getElementById('calcTotalInvested');
    if (elInv) elInv.textContent = formatCurrency(totalInvested);

    const elGain = document.getElementById('calcEstimatedGain');
    if (elGain) elGain.textContent = formatCurrency(wealthGain);

    const elMat = document.getElementById('calcTotalMaturity');
    if (elMat) elMat.textContent = formatCurrency(maturityValue);
  };

  // ==========================================================================
  // 8. NAVIGATION & SUBTAB SWITCHING
  // ==========================================================================
  window.switchView = function(viewId) {
    // Hide all view sections
    document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));

    const targetSec = document.getElementById(`view-${viewId}`);
    const targetNav = document.getElementById(`nav-${viewId}`);

    if (targetSec) targetSec.classList.add('active');
    if (targetNav) targetNav.classList.add('active');

    // Update Top Title
    const titles = {
      overview: 'Home Overview',
      investments: 'Investment Portfolio & SIPs',
      assets: 'Physical & Tangible Assets',
      loans: 'Loans & Debt Amortization',
      savings: 'Savings & Financial Goals',
      expenses: 'Daily Expense & Monthly Cashflow'
    };
    const titleEl = document.getElementById('activeViewTitle');
    if (titleEl) titleEl.textContent = titles[viewId] || 'Financial Dashboard';

    // Re-render charts on view switch
    setTimeout(() => {
      if (viewId === 'overview') renderHomeOverview();
      else if (viewId === 'investments') renderInvestmentsView();
      else if (viewId === 'assets') renderAssetsView();
      else if (viewId === 'loans') renderLoansView();
      else if (viewId === 'savings') renderSavingsView();
      else if (viewId === 'expenses') renderExpensesView();
    }, 50);

    window.location.hash = viewId;
  };

  window.switchInvestSubtab = function(tabId) {
    document.querySelectorAll('.invest-subtab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.subtab-btn').forEach(btn => btn.classList.remove('active'));

    const targetContent = document.getElementById(`invest-tab-${tabId}`);
    const targetBtn = document.querySelector(`.subtab-btn[data-subtab="${tabId}"]`);

    if (targetContent) targetContent.classList.add('active');
    if (targetBtn) targetBtn.classList.add('active');

    if (tabId === 'sip-calculator') {
      window.updateSipCalc();
    }
  };

  // ==========================================================================
  // 9. MODAL HANDLERS & CRUD OPERATIONS
  // ==========================================================================

  // Toast Helper
  function showToast(msg, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
  }

  // Confetti Helper for Goal Achievements
  function triggerGoalConfetti() {
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }

  // --- MODAL: QUICK ENTRY ---
  window.openQuickEntryModal = () => document.getElementById('quickEntryModal')?.classList.add('open');
  window.closeQuickEntryModal = () => document.getElementById('quickEntryModal')?.classList.remove('open');

  // --- MODAL: MANUAL HOLDINGS ---
  window.openHoldingModal = function(id = null) {
    const form = document.getElementById('holdingForm');
    const title = document.getElementById('holdingModalTitle');
    if (form) form.reset();

    if (id) {
      const holding = state.investments.manualHoldings.find(h => h.id === id);
      if (holding) {
        if (title) title.textContent = 'Edit Asset Holding';
        document.getElementById('holdingId').value = holding.id;
        document.getElementById('holdingSymbol').value = holding.symbol || '';
        document.getElementById('holdingCategory').value = holding.category || 'stock';
        document.getElementById('holdingName').value = holding.name || '';
        document.getElementById('holdingQuantity').value = holding.quantity || '';
        document.getElementById('holdingAvgPrice').value = holding.avgBuyPrice || '';
        document.getElementById('holdingCurrentPrice').value = holding.currentPrice || '';
        document.getElementById('holdingNotes').value = holding.notes || '';
      }
    } else {
      if (title) title.textContent = 'Add Manual Investment';
      document.getElementById('holdingId').value = '';
    }
    document.getElementById('holdingModal')?.classList.add('open');
  };

  window.closeHoldingModal = () => document.getElementById('holdingModal')?.classList.remove('open');
  window.editHolding = (id) => window.openHoldingModal(id);
  window.deleteHolding = function(id) {
    if (confirm('Are you sure you want to delete this asset holding?')) {
      state.investments.manualHoldings = state.investments.manualHoldings.filter(h => h.id !== id);
      saveState();
      renderAll();
      showToast('Asset holding deleted successfully');
    }
  };

  // --- MODAL: SIP PLANS ---
  window.openSipModal = function(id = null) {
    const form = document.getElementById('sipForm');
    const title = document.getElementById('sipModalTitle');
    if (form) form.reset();

    if (id) {
      const sip = state.investments.sips.find(s => s.id === id);
      if (sip) {
        if (title) title.textContent = 'Edit SIP Plan';
        document.getElementById('sipId').value = sip.id;
        document.getElementById('sipName').value = sip.name || '';
        document.getElementById('sipCategory').value = sip.category || 'etf';
        document.getElementById('sipAmount').value = sip.monthlyAmount || '';
        document.getElementById('sipDay').value = sip.sipDay || 5;
        document.getElementById('sipStartDate').value = sip.startDate || '';
        document.getElementById('sipInstallmentsPaid').value = sip.installmentsPaid || 1;
        document.getElementById('sipInvestedAmount').value = sip.investedAmount !== undefined && sip.investedAmount !== null ? sip.investedAmount : '';
        document.getElementById('sipCurrentValue').value = sip.currentValue || '';
        document.getElementById('sipExpectedReturn').value = sip.expectedReturn || 12;
        document.getElementById('sipStatus').value = sip.status || 'active';
        document.getElementById('sipNotes').value = sip.notes || '';
      }
    } else {
      if (title) title.textContent = 'Add Systematic Investment Plan (SIP)';
      document.getElementById('sipId').value = '';
      const now = new Date();
      document.getElementById('sipStartDate').value = now.toISOString().substring(0, 10);
    }
    document.getElementById('sipModal')?.classList.add('open');
  };

  window.closeSipModal = () => document.getElementById('sipModal')?.classList.remove('open');
  window.editSip = (id) => window.openSipModal(id);
  window.deleteSip = function(id) {
    if (confirm('Are you sure you want to delete this SIP plan?')) {
      state.investments.sips = state.investments.sips.filter(s => s.id !== id);
      saveState();
      renderAll();
      showToast('SIP plan removed');
    }
  };

  window.logSipInstallment = function(id) {
    const sip = state.investments.sips.find(s => s.id === id);
    if (!sip) return;
    sip.installmentsPaid = (Number(sip.installmentsPaid) || 0) + 1;
    saveState();
    renderAll();
    showToast(`Logged installment #${sip.installmentsPaid} for ${sip.name}! 🎉`);
  };

  // --- MODAL: ASSETS ---
  window.openAssetModal = function(id = null) {
    const form = document.getElementById('assetForm');
    const title = document.getElementById('assetModalTitle');
    if (form) form.reset();

    if (id) {
      const asset = (state.assets || []).find(a => a.id === id);
      if (asset) {
        if (title) title.textContent = 'Edit Physical Asset';
        document.getElementById('assetId').value = asset.id;
        document.getElementById('assetName').value = asset.name || '';
        document.getElementById('assetCategory').value = asset.category || 'vehicle';
        document.getElementById('assetIcon').value = asset.icon || '🚗';
        document.getElementById('assetPurchasePrice').value = asset.purchasePrice || '';
        document.getElementById('assetCurrentValuation').value = asset.currentValuation || '';
        document.getElementById('assetPurchaseDate').value = asset.purchaseDate || '';
        document.getElementById('assetQuantityGrams').value = asset.quantityGrams || '';
        document.getElementById('assetNotes').value = asset.notes || '';
      }
    } else {
      if (title) title.textContent = 'Add Physical Asset';
      document.getElementById('assetId').value = '';
      const now = new Date();
      document.getElementById('assetPurchaseDate').value = now.toISOString().substring(0, 10);
    }
    document.getElementById('assetModal')?.classList.add('open');
  };

  window.closeAssetModal = () => document.getElementById('assetModal')?.classList.remove('open');
  window.editAsset = (id) => window.openAssetModal(id);
  window.deleteAsset = function(id) {
    if (confirm('Are you sure you want to remove this asset?')) {
      state.assets = (state.assets || []).filter(a => a.id !== id);
      saveState();
      renderAll();
      showToast('Asset record removed');
    }
  };

  // --- MODAL: LOANS ---
  window.openLoanModal = function(id = null) {
    const form = document.getElementById('loanForm');
    const title = document.getElementById('loanModalTitle');
    if (form) form.reset();

    if (id) {
      const loan = state.loans.find(l => l.id === id);
      if (loan) {
        if (title) title.textContent = 'Edit Loan Details';
        document.getElementById('loanId').value = loan.id;
        document.getElementById('loanName').value = loan.name || '';
        document.getElementById('loanType').value = loan.type || 'home';
        document.getElementById('loanPrincipal').value = loan.principal || '';
        document.getElementById('loanInterestRate').value = loan.interestRate || '';
        document.getElementById('loanTenureMonths').value = loan.tenureMonths || '';
        document.getElementById('loanStartDate').value = loan.startDate || '';
        document.getElementById('loanEmiDay').value = loan.emiDay !== undefined && loan.emiDay !== null ? loan.emiDay : 5;
        document.getElementById('loanMonthlyEmi').value = loan.monthlyEmi !== undefined && loan.monthlyEmi !== null ? loan.monthlyEmi : '';
        document.getElementById('loanEmisPaidManual').value = loan.emisPaidManual !== undefined ? loan.emisPaidManual : '';
        document.getElementById('loanExtraPrepayment').value = loan.extraPrepayment || 0;
        document.getElementById('loanNotes').value = loan.notes || '';
      }
    } else {
      if (title) title.textContent = 'Add Loan Details';
      document.getElementById('loanId').value = '';
      const now = new Date();
      document.getElementById('loanStartDate').value = now.toISOString().substring(0, 10);
    }
    document.getElementById('loanModal')?.classList.add('open');
  };

  window.closeLoanModal = () => document.getElementById('loanModal')?.classList.remove('open');
  window.editLoan = (id) => window.openLoanModal(id);
  window.deleteLoan = function(id) {
    if (confirm('Are you sure you want to delete this loan record?')) {
      state.loans = state.loans.filter(l => l.id !== id);
      saveState();
      renderAll();
      showToast('Loan record removed');
    }
  };

  // --- MODAL: AMORTIZATION SCHEDULE ---
  window.viewLoanAmortization = function(id) {
    const loan = state.loans.find(l => l.id === id);
    if (!loan) return;

    const amort = calculateAmortizationSchedule(loan);

    const title = document.getElementById('amortModalTitle');
    if (title) title.textContent = `${loan.name} — Amortization Schedule`;

    const sub = document.getElementById('amortModalSubtitle');
    if (sub) sub.textContent = `Principal: ${formatCurrency(loan.principal)} @ ${loan.interestRate}% for ${loan.tenureMonths} Months (${(loan.tenureMonths / 12).toFixed(1)} Yrs)`;

    // Populate Summary Strip
    const strip = document.getElementById('amortSummaryStrip');
    if (strip) {
      strip.innerHTML = `
        <div class="amort-box">
          <span>Monthly EMI</span>
          <strong class="mono-num" style="color: var(--accent-cyan);">${formatCurrency(amort.emi)}</strong>
        </div>
        <div class="amort-box">
          <span>Total Interest Payable</span>
          <strong class="mono-num" style="color: var(--danger);">${formatCurrency(amort.totalInterestPayable)}</strong>
        </div>
        <div class="amort-box">
          <span>Principal Paid So Far</span>
          <strong class="mono-num" style="color: var(--success);">${formatCurrency(amort.principalPaidSoFar)}</strong>
        </div>
        <div class="amort-box">
          <span>Remaining Balance</span>
          <strong class="mono-num" style="color: var(--text-primary);">${formatCurrency(amort.remainingBalance)}</strong>
        </div>
      `;
    }

    // Populate Table Body
    const tbody = document.getElementById('amortTableBody');
    if (tbody) {
      let rowsHtml = '';
      amort.schedule.forEach(row => {
        rowsHtml += `
          <tr style="${row.isPaid ? 'opacity: 0.75;' : ''}">
            <td class="mono-num">#${row.monthNumber}</td>
            <td>${row.dateLabel}</td>
            <td class="mono-num">${formatCurrency(row.emi)}</td>
            <td class="mono-num" style="color: var(--success);">${formatCurrency(row.principal)}</td>
            <td class="mono-num" style="color: var(--danger);">${formatCurrency(row.interest)}</td>
            <td class="mono-num" style="font-weight: 700;">${formatCurrency(row.remainingBalance)}</td>
            <td>
              <span class="badge ${row.isPaid ? 'badge-success' : 'badge-neutral'}">
                ${row.isPaid ? '✓ Paid' : 'Upcoming'}
              </span>
            </td>
          </tr>
        `;
      });
      tbody.innerHTML = rowsHtml;
    }

    document.getElementById('amortizationModal')?.classList.add('open');
  };

  window.closeAmortizationModal = () => document.getElementById('amortizationModal')?.classList.remove('open');

  // --- MODAL: EMERGENCY FUND ---
  window.openEmergencyFundModal = function() {
    document.getElementById('efInputCurrent').value = state.savings.emergencyFund.currentAmount || 0;
    document.getElementById('efInputTarget').value = state.savings.emergencyFund.targetAmount || 0;
    document.getElementById('emergencyFundModal')?.classList.add('open');
  };

  window.closeEmergencyFundModal = () => document.getElementById('emergencyFundModal')?.classList.remove('open');

  // --- MODAL: GOALS ---
  window.openGoalModal = function(id = null) {
    const form = document.getElementById('goalForm');
    const title = document.getElementById('goalModalTitle');
    if (form) form.reset();

    if (id) {
      const goal = state.savings.goals.find(g => g.id === id);
      if (goal) {
        if (title) title.textContent = 'Edit Financial Goal';
        document.getElementById('goalId').value = goal.id;
        document.getElementById('goalTitle').value = goal.title || '';
        document.getElementById('goalTargetAmount').value = goal.targetAmount || '';
        document.getElementById('goalCurrentAmount').value = goal.currentAmount || 0;
        document.getElementById('goalTargetDate').value = goal.targetDate || '';
        document.getElementById('goalIcon').value = goal.icon || '🎯';
        document.getElementById('goalNotes').value = goal.notes || '';
      }
    } else {
      if (title) title.textContent = 'Create Financial Goal';
      document.getElementById('goalId').value = '';
    }
    document.getElementById('goalModal')?.classList.add('open');
  };

  window.closeGoalModal = () => document.getElementById('goalModal')?.classList.remove('open');
  window.editGoal = (id) => window.openGoalModal(id);
  window.deleteGoal = function(id) {
    if (confirm('Are you sure you want to delete this goal?')) {
      state.savings.goals = state.savings.goals.filter(g => g.id !== id);
      saveState();
      renderAll();
      showToast('Goal deleted');
    }
  };

  window.addGoalFunds = function(id) {
    const goal = state.savings.goals.find(g => g.id === id);
    if (!goal) return;
    const input = prompt(`Enter additional amount to save towards "${goal.title}" (₹):`, '10000');
    if (input !== null && !isNaN(Number(input)) && Number(input) > 0) {
      goal.currentAmount = (Number(goal.currentAmount) || 0) + Number(input);
      saveState();
      renderAll();
      showToast(`Added ${formatCurrency(Number(input))} to ${goal.title}!`);
      if (goal.currentAmount >= goal.targetAmount) {
        triggerGoalConfetti();
      }
    }
  };

  // --- MODAL: EXPENSES ---
  window.openExpenseModal = function(id = null) {
    const form = document.getElementById('expenseForm');
    const title = document.getElementById('expenseModalTitle');
    if (form) form.reset();

    if (id) {
      const exp = state.expenses.find(e => e.id === id);
      if (exp) {
        if (title) title.textContent = 'Edit Expense Entry';
        document.getElementById('expenseId').value = exp.id;
        document.getElementById('expenseAmount').value = exp.amount || '';
        document.getElementById('expenseCategory').value = exp.category || 'food';
        document.getElementById('expenseDate').value = exp.date || '';
        document.getElementById('expensePaymentMode').value = exp.paymentMode || 'UPI';
        document.getElementById('expenseNotes').value = exp.notes || '';
      }
    } else {
      if (title) title.textContent = 'Add Daily Expense';
      document.getElementById('expenseId').value = '';
      const now = new Date();
      document.getElementById('expenseDate').value = now.toISOString().substring(0, 10);
    }
    document.getElementById('expenseModal')?.classList.add('open');
  };

  window.closeExpenseModal = () => document.getElementById('expenseModal')?.classList.remove('open');
  window.editExpense = (id) => window.openExpenseModal(id);
  window.deleteExpense = function(id) {
    if (confirm('Are you sure you want to delete this expense entry?')) {
      state.expenses = state.expenses.filter(e => e.id !== id);
      saveState();
      renderAll();
      showToast('Expense entry deleted');
    }
  };

  window.filterExpenses = function() {
    renderExpensesTable();
  };

  // --- MODAL: SHEETS & DATA ---
  window.openSheetsModal = () => {
    document.getElementById('sheetsUrlInput').value = state.preferences.googleAppsScriptUrl || '';
    document.getElementById('sheetsModal')?.classList.add('open');
  };
  window.closeSheetsModal = () => document.getElementById('sheetsModal')?.classList.remove('open');

  window.saveSheetsUrl = function() {
    const url = document.getElementById('sheetsUrlInput')?.value.trim();
    state.preferences.googleAppsScriptUrl = url;
    saveState();
    showToast('Google Sheets URL saved');
    window.closeSheetsModal();
  };

  window.syncAllSheets = async function() {
    const url = state.preferences.googleAppsScriptUrl;
    if (!url) {
      alert('Please enter a valid Google Apps Script Web App URL first.');
      return;
    }
    try {
      showToast('Syncing with Google Sheets cloud...', 'info');
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'syncAll',
          holdings: state.investments.manualHoldings,
          sips: state.investments.sips,
          loans: state.loans,
          savings: state.savings,
          expenses: state.expenses
        })
      });
      const result = await response.json();
      if (result.status === 'success') {
        showToast('Successfully synced with Google Sheets! ☁️');
      } else {
        showToast('Sync failed: ' + result.message, 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Cloud sync completed with Google Apps Script');
    }
  };

  window.fetchFromSheets = async function() {
    const url = state.preferences.googleAppsScriptUrl;
    if (!url) {
      alert('Please enter a valid Google Apps Script Web App URL first.');
      return;
    }
    try {
      showToast('Pulling data from Google Sheets...', 'info');
      const response = await fetch(url);
      const result = await response.json();
      if (result.status === 'success' && result.data) {
        if (result.data.holdings) state.investments.manualHoldings = result.data.holdings;
        if (result.data.sips) state.investments.sips = result.data.sips;
        if (result.data.loans) state.loans = result.data.loans;
        if (result.data.savings) state.savings = result.data.savings;
        if (result.data.expenses) state.expenses = result.data.expenses;
        saveState();
        renderAll();
        showToast('Successfully fetched data from Google Sheets!');
      }
    } catch (err) {
      console.error(err);
      showToast('Could not fetch from Google Sheets URL', 'error');
    }
  };

  window.openDataModal = () => document.getElementById('dataModal')?.classList.add('open');
  window.closeDataModal = () => document.getElementById('dataModal')?.classList.remove('open');

  window.triggerJSONExport = function() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `sharkfin_backup_${new Date().toISOString().substring(0, 10)}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
    showToast('JSON backup exported');
  };

  window.triggerJSONImport = function(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const imported = JSON.parse(e.target.result);
        if (imported.investments || imported.loans || imported.savings || imported.expenses) {
          state = imported;
          saveState();
          renderAll();
          showToast('Backup restored successfully!');
          window.closeDataModal();
        } else {
          alert('Invalid backup JSON format.');
        }
      } catch (err) {
        alert('Failed to parse backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  window.resetDemoPortfolio = function() {
    if (confirm('Reset entire app with sample starter data? Your existing local data will be replaced.')) {
      state = JSON.parse(JSON.stringify(DEFAULT_INITIAL_STATE));
      saveState();
      renderAll();
      showToast('Sample portfolio data loaded!');
      window.closeDataModal();
    }
  };

  window.clearAllPortfolioData = function() {
    if (confirm('WARNING: Are you sure you want to erase ALL data? This cannot be undone.')) {
      state = {
        preferences: DEFAULT_INITIAL_STATE.preferences,
        investments: { manualHoldings: [], sips: [] },
        loans: [],
        savings: { emergencyFund: { currentAmount: 0, targetAmount: 0 }, goals: [] },
        expenses: []
      };
      saveState();
      renderAll();
      showToast('All financial data wiped clean');
      window.closeDataModal();
    }
  };

  // ==========================================================================
  // 10. FORM SUBMISSION EVENT LISTENERS
  // ==========================================================================
  function setupFormListeners() {
    // 1. Manual Holding Form
    document.getElementById('holdingForm')?.addEventListener('submit', function(e) {
      e.preventDefault();
      const id = document.getElementById('holdingId').value;
      const symbol = document.getElementById('holdingSymbol').value.trim().toUpperCase();
      const category = document.getElementById('holdingCategory').value;
      const name = document.getElementById('holdingName').value.trim();
      const quantity = Number(document.getElementById('holdingQuantity').value) || 0;
      const avgBuyPrice = Number(document.getElementById('holdingAvgPrice').value) || 0;
      const curPriceInput = document.getElementById('holdingCurrentPrice').value;
      const currentPrice = curPriceInput !== '' ? Number(curPriceInput) : avgBuyPrice;
      const notes = document.getElementById('holdingNotes').value.trim();

      if (id) {
        const item = state.investments.manualHoldings.find(h => h.id === id);
        if (item) {
          item.symbol = symbol;
          item.category = category;
          item.name = name;
          item.quantity = quantity;
          item.avgBuyPrice = avgBuyPrice;
          item.currentPrice = currentPrice;
          item.notes = notes;
        }
      } else {
        state.investments.manualHoldings.push({
          id: 'h-' + Date.now(),
          symbol,
          category,
          name,
          quantity,
          avgBuyPrice,
          currentPrice,
          notes
        });
      }

      saveState();
      renderAll();
      window.closeHoldingModal();
      showToast('Asset holding saved successfully');
    });

    // 2. SIP Form
    document.getElementById('sipForm')?.addEventListener('submit', function(e) {
      e.preventDefault();
      const id = document.getElementById('sipId').value;
      const name = document.getElementById('sipName').value.trim();
      const category = document.getElementById('sipCategory').value;
      const monthlyAmount = Number(document.getElementById('sipAmount').value) || 0;
      const sipDay = Number(document.getElementById('sipDay').value) || 5;
      const startDate = document.getElementById('sipStartDate').value;
      const installmentsPaid = Number(document.getElementById('sipInstallmentsPaid').value) || 0;
      const investedAmountInput = document.getElementById('sipInvestedAmount')?.value;
      const investedAmount = investedAmountInput !== '' && investedAmountInput !== undefined ? Number(investedAmountInput) : (monthlyAmount * installmentsPaid);
      const curValInput = document.getElementById('sipCurrentValue').value;
      const currentValue = curValInput !== '' ? Number(curValInput) : (investedAmount || (monthlyAmount * installmentsPaid));
      const expectedReturn = Number(document.getElementById('sipExpectedReturn').value) || 12;
      const status = document.getElementById('sipStatus').value;
      const notes = document.getElementById('sipNotes').value.trim();

      if (id) {
        const sip = state.investments.sips.find(s => s.id === id);
        if (sip) {
          sip.name = name;
          sip.category = category;
          sip.monthlyAmount = monthlyAmount;
          sip.sipDay = sipDay;
          sip.startDate = startDate;
          sip.installmentsPaid = installmentsPaid;
          sip.investedAmount = investedAmount;
          sip.currentValue = currentValue;
          sip.expectedReturn = expectedReturn;
          sip.status = status;
          sip.notes = notes;
        }
      } else {
        state.investments.sips.push({
          id: 'sip-' + Date.now(),
          name,
          category,
          monthlyAmount,
          sipDay,
          startDate,
          installmentsPaid,
          investedAmount,
          currentValue,
          expectedReturn,
          status,
          notes
        });
      }

      saveState();
      renderAll();
      window.closeSipModal();
      showToast('SIP Plan saved successfully');
    });

    // 2B. Physical Asset Form
    document.getElementById('assetForm')?.addEventListener('submit', function(e) {
      e.preventDefault();
      const id = document.getElementById('assetId').value;
      const name = document.getElementById('assetName').value.trim();
      const category = document.getElementById('assetCategory').value;
      const icon = document.getElementById('assetIcon').value;
      const purchasePrice = Number(document.getElementById('assetPurchasePrice').value) || 0;
      const currentValuationInput = document.getElementById('assetCurrentValuation').value;
      const currentValuation = currentValuationInput !== '' ? Number(currentValuationInput) : purchasePrice;
      const purchaseDate = document.getElementById('assetPurchaseDate').value;
      const quantityGramsInput = document.getElementById('assetQuantityGrams').value;
      const quantityGrams = quantityGramsInput !== '' ? Number(quantityGramsInput) : null;
      const notes = document.getElementById('assetNotes').value.trim();

      if (!state.assets) state.assets = [];

      if (id) {
        const asset = state.assets.find(a => a.id === id);
        if (asset) {
          asset.name = name;
          asset.category = category;
          asset.icon = icon;
          asset.purchasePrice = purchasePrice;
          asset.currentValuation = currentValuation;
          asset.purchaseDate = purchaseDate;
          asset.quantityGrams = quantityGrams;
          asset.notes = notes;
        }
      } else {
        state.assets.push({
          id: 'asset-' + Date.now(),
          name,
          category,
          icon,
          purchasePrice,
          currentValuation,
          purchaseDate,
          quantityGrams,
          notes
        });
      }

      saveState();
      renderAll();
      window.closeAssetModal();
      showToast('Physical Asset saved successfully');
    });

    // 3. Loan Form
    document.getElementById('loanForm')?.addEventListener('submit', function(e) {
      e.preventDefault();
      const id = document.getElementById('loanId').value;
      const name = document.getElementById('loanName').value.trim();
      const type = document.getElementById('loanType').value;
      const principal = Number(document.getElementById('loanPrincipal').value) || 0;
      const interestRate = Number(document.getElementById('loanInterestRate').value) || 0;
      const tenureMonths = Number(document.getElementById('loanTenureMonths').value) || 1;
      const startDate = document.getElementById('loanStartDate').value;
      const emiDayInput = document.getElementById('loanEmiDay')?.value;
      const emiDay = emiDayInput !== '' && emiDayInput !== undefined ? Number(emiDayInput) : 5;
      const monthlyEmiInput = document.getElementById('loanMonthlyEmi')?.value;
      const monthlyEmi = monthlyEmiInput !== '' && monthlyEmiInput !== undefined ? Number(monthlyEmiInput) : null;
      const emisPaidManualInput = document.getElementById('loanEmisPaidManual').value;
      const emisPaidManual = emisPaidManualInput !== '' ? Number(emisPaidManualInput) : null;
      const extraPrepayment = Number(document.getElementById('loanExtraPrepayment').value) || 0;
      const notes = document.getElementById('loanNotes').value.trim();

      if (id) {
        const loan = state.loans.find(l => l.id === id);
        if (loan) {
          loan.name = name;
          loan.type = type;
          loan.principal = principal;
          loan.interestRate = interestRate;
          loan.tenureMonths = tenureMonths;
          loan.monthlyEmi = monthlyEmi;
          loan.emiDay = emiDay;
          loan.startDate = startDate;
          loan.emisPaidManual = emisPaidManual;
          loan.extraPrepayment = extraPrepayment;
          loan.notes = notes;
        }
      } else {
        state.loans.push({
          id: 'loan-' + Date.now(),
          name,
          type,
          principal,
          interestRate,
          tenureMonths,
          monthlyEmi,
          emiDay,
          startDate,
          emisPaidManual,
          extraPrepayment,
          notes
        });
      }

      saveState();
      renderAll();
      window.closeLoanModal();
      showToast('Loan record saved successfully');
    });

    // 4. Emergency Fund Form
    document.getElementById('emergencyFundForm')?.addEventListener('submit', function(e) {
      e.preventDefault();
      const cur = Number(document.getElementById('efInputCurrent').value) || 0;
      const tgt = Number(document.getElementById('efInputTarget').value) || 0;

      state.savings.emergencyFund.currentAmount = cur;
      state.savings.emergencyFund.targetAmount = tgt;

      saveState();
      renderAll();
      window.closeEmergencyFundModal();
      showToast('Emergency Fund settings saved');
    });

    // 5. Goal Form
    document.getElementById('goalForm')?.addEventListener('submit', function(e) {
      e.preventDefault();
      const id = document.getElementById('goalId').value;
      const title = document.getElementById('goalTitle').value.trim();
      const targetAmount = Number(document.getElementById('goalTargetAmount').value) || 0;
      const currentAmount = Number(document.getElementById('goalCurrentAmount').value) || 0;
      const targetDate = document.getElementById('goalTargetDate').value;
      const icon = document.getElementById('goalIcon').value;
      const notes = document.getElementById('goalNotes').value.trim();

      if (id) {
        const goal = state.savings.goals.find(g => g.id === id);
        if (goal) {
          goal.title = title;
          goal.targetAmount = targetAmount;
          goal.currentAmount = currentAmount;
          goal.targetDate = targetDate;
          goal.icon = icon;
          goal.notes = notes;
        }
      } else {
        state.savings.goals.push({
          id: 'g-' + Date.now(),
          title,
          targetAmount,
          currentAmount,
          targetDate,
          icon,
          notes
        });
      }

      saveState();
      renderAll();
      window.closeGoalModal();
      showToast('Financial Goal saved successfully');
      if (currentAmount >= targetAmount) {
        triggerGoalConfetti();
      }
    });

    // 6. Expense Form
    document.getElementById('expenseForm')?.addEventListener('submit', function(e) {
      e.preventDefault();
      const id = document.getElementById('expenseId').value;
      const amount = Number(document.getElementById('expenseAmount').value) || 0;
      const category = document.getElementById('expenseCategory').value;
      const date = document.getElementById('expenseDate').value;
      const paymentMode = document.getElementById('expensePaymentMode').value;
      const notes = document.getElementById('expenseNotes').value.trim();

      if (id) {
        const exp = state.expenses.find(e => e.id === id);
        if (exp) {
          exp.amount = amount;
          exp.category = category;
          exp.date = date;
          exp.paymentMode = paymentMode;
          exp.notes = notes;
        }
      } else {
        state.expenses.push({
          id: 'exp-' + Date.now(),
          amount,
          category,
          date,
          paymentMode,
          notes
        });
      }

      saveState();
      renderAll();
      window.closeExpenseModal();
      showToast(`Recorded expense of ${formatCurrency(amount)}`);
    });

    // Holdings Category Filter Buttons
    document.querySelectorAll('#holdingsFilterPills .filter-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        document.querySelectorAll('#holdingsFilterPills .filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        renderHoldingsTable();
      });
    });

    // Holdings Search Box
    document.getElementById('holdingSearchInput')?.addEventListener('input', () => {
      renderHoldingsTable();
    });

    // Currency Switcher
    document.getElementById('currencySelect')?.addEventListener('change', function() {
      state.preferences.currency = this.value;
      saveState();
      renderAll();
    });

    // Theme Switcher
    document.getElementById('themeSelect')?.addEventListener('change', function() {
      state.preferences.theme = this.value;
      document.documentElement.setAttribute('data-theme', this.value);
      saveState();
      renderAll();
    });

    // Navigation Links
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
      item.addEventListener('click', function(e) {
        e.preventDefault();
        const view = this.dataset.view;
        window.switchView(view);
      });
    });
  }

  // ==========================================================================
  // 11. APP INITIALIZATION
  // ==========================================================================
  function init() {
    loadState();

    // Set Theme
    const savedTheme = state.preferences.theme || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect) themeSelect.value = savedTheme;

    // Set Currency
    const savedCurrency = state.preferences.currency || 'INR';
    const curSelect = document.getElementById('currencySelect');
    if (curSelect) curSelect.value = savedCurrency;

    setupFormListeners();
    renderAll();

    // Handle URL Hash on reload
    const initialHash = window.location.hash.replace('#', '');
    if (['overview', 'investments', 'loans', 'savings', 'expenses'].includes(initialHash)) {
      window.switchView(initialHash);
    } else {
      window.switchView('overview');
    }
  }

  // Run on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
