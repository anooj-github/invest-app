# Google Apps Script Setup Guide for AuraInvest

Connect your AuraInvest Web App to Google Sheets for automated cloud backup and monthly data logging.

---

## Step 1: Create a Google Sheet
1. Open Google Sheets at [sheets.new](https://sheets.new).
2. Name your spreadsheet: **`AuraInvest Portfolio`**.

---

## Step 2: Add the Apps Script Code
1. In Google Sheets top menu, click **Extensions > Apps Script**.
2. Clear any default code in the editor.
3. Open the [Code.gs](file:///Users/anooj/Documents/Invest%20App/google-apps-script/Code.gs) file in this folder, copy all code, and paste it into the Apps Script editor.
4. Click the **Save** icon (💾) or press `Cmd + S`.

---

## Step 3: Deploy as Web App
1. At the top right of the Apps Script window, click the blue **Deploy** button > **New deployment**.
2. Click the **Gear icon (⚙️)** next to "Select type" and choose **Web app**.
3. Fill in the deployment details:
   - **Description**: `AuraInvest Backend API`
   - **Execute as**: `Me (your_email@gmail.com)`
   - **Who has access**: `Anyone` *(Crucial so your local AuraInvest app can send/fetch data)*
4. Click **Deploy**.
5. When prompted, click **Authorize access**, select your Google account, click **Advanced**, and click **Go to Untitled project (unsafe)** to grant permissions.
6. Copy the **Web app URL** (it looks like `https://script.google.com/macros/s/.../exec`).

---

## Step 4: Connect to AuraInvest App
1. Open your AuraInvest app in your browser ([index.html](file:///Users/anooj/Documents/Invest%20App/index.html)).
2. Click **Google Sheets Sync** (or the Cloud icon ☁️ in the header / sidebar).
3. Paste your **Web app URL** into the input box.
4. Click **Connect & Sync Now**.
5. You're all set! Your holdings, monthly snapshots, and goals are now connected to your Google Sheet.
