# AuraInvest — Personal Portfolio & Investment Tracker

A modern, responsive investment tracking web application built with **pure HTML5, CSS3, and JavaScript** (zero Node.js dependencies, zero build step). Features live Google Sheets sync via Google Apps Script.

---

## 🌟 Key Features

- **📊 Portfolio Overview**: Real-time Net Worth in INR (₹), Total Invested, All-Time Return ($/₹ and %), and 24h Day Change.
- **📈 Interactive Performance Charts**: Interactive Chart.js Area Growth Chart with timeframes (`1W`, `1M`, `3M`, `1Y`, `ALL`) and Asset Allocation Doughnut Chart.
- **💼 Holdings Ledger**: Multi-asset support (Stocks, Mutual Funds, ETFs, Gold/Silver, Post Office Schemes, NPS, Emergency Fund, Goals Savings).
- **➕ Dedicated "Add Monthly Update" Tab**: Monthly entry form allowing quick updates across all asset categories with live running totals before saving.
- **🎯 Goals & Milestones Tracker**: Track wealth targets and emergency funds with animated progress bars and celebration confetti.
- **📅 Monthly Review**: Month-by-month net worth ledger with historical contributions vs. market appreciation chart.
- **☁️ Google Sheets Cloud Backend**: Two-way sync with Google Sheets via Google Apps Script.
- **🎨 Luxury Themes**: Dark Luxury, Midnight OLED, and Crisp Light modes.
- **💱 Multi-Currency Converter**: Support for INR (₹), USD ($), EUR (€), GBP (£), CAD ($), AUD ($), and JPY (¥).

---

## 📁 Project Structure

```
Invest App/
├── index.html                  # Main single-page application
├── css/
│   └── styles.css              # Custom design system & animations
├── js/
│   └── app.js                  # State engine, charts, and Google Sheets sync
├── google-apps-script/
│   ├── Code.gs                 # Google Apps Script backend code
│   └── README.md               # Google Sheets setup instructions
├── .gitignore
└── README.md
```

---

## 🚀 Deploying to GitHub Pages

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - AuraInvest Portfolio Tracker"
   git branch -M main
   git remote add origin https://github.com/<YOUR-GITHUB-USERNAME>/<REPO-NAME>.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**:
   - Go to your repository on GitHub.
   - Navigate to **Settings** > **Pages** (left sidebar).
   - Under **Build and deployment** > **Source**, select **Deploy from a branch**.
   - Under **Branch**, select `main` and folder `/ (root)`.
   - Click **Save**.

3. **Live App URL**:
   Your app will be live at:
   `https://<YOUR-GITHUB-USERNAME>.github.io/<REPO-NAME>/`
