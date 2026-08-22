/**
 * AuraInvest — Google Apps Script Backend
 * 
 * Instructions:
 * 1. Open Google Sheets (https://sheets.new) and create a new sheet named "AuraInvest Portfolio".
 * 2. In Google Sheets, go to Extensions > Apps Script.
 * 3. Delete any code in the editor and paste this entire Code.gs file.
 * 4. Click "Deploy" > "New deployment".
 * 5. Select type "Web app".
 * 6. Set "Execute as": "Me".
 * 7. Set "Who has access": "Anyone" (allows your web app to fetch/send data).
 * 8. Click "Deploy", authorize permissions, and copy the "Web app URL".
 * 9. In your AuraInvest web app, open "Google Sheets Sync", paste the Web App URL, and click "Connect & Sync".
 */

// Handle GET requests (Fetch portfolio data)
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    initSheetsIfMissing(ss);

    var holdings = getHoldingsData(ss);
    var monthlyUpdates = getMonthlyUpdatesData(ss);
    var goals = getGoalsData(ss);

    var payload = {
      status: 'success',
      data: {
        holdings: holdings,
        monthlyUpdates: monthlyUpdates,
        goals: goals,
        lastSynced: new Date().toISOString()
      }
    };

    return ContentService.createTextOutput(JSON.stringify(payload))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle POST requests (Save monthly updates or full sync)
function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    initSheetsIfMissing(ss);

    var contents = {};
    if (e.postData && e.postData.contents) {
      try {
        contents = JSON.parse(e.postData.contents);
      } catch (ex) {
        contents = e.postData.contents;
      }
    } else if (e.parameter) {
      contents = e.parameter;
    }

    var action = contents.action || 'saveMonthlyUpdate';

    if (action === 'saveMonthlyUpdate') {
      var updateData = contents.updateData; // { monthYear, totalNetWorth, contributions, marketGain, notes, holdings }
      
      // 1. Record in MonthlyUpdates Sheet
      saveMonthlySnapshotRow(ss, updateData);

      // 2. Update Current Holdings Sheet if provided
      if (updateData.holdings && Array.isArray(updateData.holdings)) {
        saveHoldingsData(ss, updateData.holdings);
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Monthly snapshot and holdings updated successfully in Google Sheets!',
        timestamp: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    } 
    else if (action === 'syncAll') {
      // Full sync of holdings, monthly updates, and goals
      if (contents.holdings) saveHoldingsData(ss, contents.holdings);
      if (contents.monthlyUpdates) saveAllMonthlyUpdates(ss, contents.monthlyUpdates);
      if (contents.goals) saveGoalsData(ss, contents.goals);

      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'All data synced with Google Sheets successfully!',
        timestamp: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'Unknown action: ' + action
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================================================
// SHEET HELPERS
// ============================================================================

function initSheetsIfMissing(ss) {
  // 1. Holdings Sheet
  var hSheet = ss.getSheetByName('Holdings');
  if (!hSheet) {
    hSheet = ss.insertSheet('Holdings');
    hSheet.appendRow(['ID', 'Symbol', 'Name', 'Category', 'Quantity', 'Avg Buy Price (INR)', 'Current Price (INR)', 'Total Value (INR)', 'Gain/Loss (INR)', 'Notes']);
    hSheet.getRange(1, 1, 1, 10).setFontWeight('bold').setBackground('#1e293b').setFontColor('#f8fafc');
  }

  // 2. Monthly Updates Sheet
  var mSheet = ss.getSheetByName('MonthlyUpdates');
  if (!mSheet) {
    mSheet = ss.insertSheet('MonthlyUpdates');
    mSheet.appendRow(['ID', 'Month-Year', 'Ending Net Worth (INR)', 'New Capital Added (INR)', 'Market Gain/Loss (INR)', 'Notes', 'Recorded Date']);
    mSheet.getRange(1, 1, 1, 7).setFontWeight('bold').setBackground('#1e293b').setFontColor('#f8fafc');
  }

  // 3. Goals Sheet
  var gSheet = ss.getSheetByName('Goals');
  if (!gSheet) {
    gSheet = ss.insertSheet('Goals');
    gSheet.appendRow(['ID', 'Title', 'Target Amount (INR)', 'Target Date', 'Category', 'Icon', 'Notes']);
    gSheet.getRange(1, 1, 1, 7).setFontWeight('bold').setBackground('#1e293b').setFontColor('#f8fafc');
  }
}

function getHoldingsData(ss) {
  var sheet = ss.getSheetByName('Holdings');
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  var holdings = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (!row[1] && !row[2]) continue;
    holdings.push({
      id: String(row[0] || 'h-' + i),
      symbol: String(row[1] || ''),
      name: String(row[2] || ''),
      category: String(row[3] || 'stock'),
      quantity: Number(row[4] || 0),
      avgBuyPrice: Number(row[5] || 0),
      currentPrice: Number(row[6] || 0),
      notes: String(row[9] || '')
    });
  }
  return holdings;
}

function saveHoldingsData(ss, holdings) {
  var sheet = ss.getSheetByName('Holdings');
  if (!sheet) return;

  sheet.clearContents();
  sheet.appendRow(['ID', 'Symbol', 'Name', 'Category', 'Quantity', 'Avg Buy Price (INR)', 'Current Price (INR)', 'Total Value (INR)', 'Gain/Loss (INR)', 'Notes']);
  sheet.getRange(1, 1, 1, 10).setFontWeight('bold').setBackground('#1e293b').setFontColor('#f8fafc');

  var rows = holdings.map(function(h) {
    var totalVal = (h.quantity || 0) * (h.currentPrice || 0);
    var cost = (h.quantity || 0) * (h.avgBuyPrice || 0);
    return [
      h.id || 'h-' + Date.now(),
      h.symbol || '',
      h.name || '',
      h.category || 'stock',
      h.quantity || 0,
      h.avgBuyPrice || 0,
      h.currentPrice || 0,
      totalVal,
      totalVal - cost,
      h.notes || ''
    ];
  });

  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, 10).setValues(rows);
  }
}

function getMonthlyUpdatesData(ss) {
  var sheet = ss.getSheetByName('MonthlyUpdates');
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  var updates = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (!row[1]) continue;
    updates.push({
      id: String(row[0] || 'm-' + i),
      monthYear: String(row[1] || ''),
      totalNetWorth: Number(row[2] || 0),
      contributions: Number(row[3] || 0),
      marketGain: Number(row[4] || 0),
      notes: String(row[5] || '')
    });
  }
  return updates;
}

function saveMonthlySnapshotRow(ss, u) {
  var sheet = ss.getSheetByName('MonthlyUpdates');
  if (!sheet) return;

  // Check if month already exists, update row instead of duplicating
  var data = sheet.getDataRange().getValues();
  var foundRow = -1;
  for (var i = 1; i < data.length; i++) {
    if (data[i][1] === u.monthYear) {
      foundRow = i + 1;
      break;
    }
  }

  var rowData = [
    u.id || 'm-' + Date.now(),
    u.monthYear,
    Number(u.totalNetWorth || 0),
    Number(u.contributions || 0),
    Number(u.marketGain || 0),
    u.notes || '',
    new Date()
  ];

  if (foundRow !== -1) {
    sheet.getRange(foundRow, 1, 1, 7).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }
}

function saveAllMonthlyUpdates(ss, updates) {
  var sheet = ss.getSheetByName('MonthlyUpdates');
  if (!sheet) return;

  sheet.clearContents();
  sheet.appendRow(['ID', 'Month-Year', 'Ending Net Worth (INR)', 'New Capital Added (INR)', 'Market Gain/Loss (INR)', 'Notes', 'Recorded Date']);
  sheet.getRange(1, 1, 1, 7).setFontWeight('bold').setBackground('#1e293b').setFontColor('#f8fafc');

  var rows = updates.map(function(u) {
    return [
      u.id || 'm-' + Date.now(),
      u.monthYear,
      Number(u.totalNetWorth || 0),
      Number(u.contributions || 0),
      Number(u.marketGain || 0),
      u.notes || '',
      new Date()
    ];
  });

  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, 7).setValues(rows);
  }
}

function getGoalsData(ss) {
  var sheet = ss.getSheetByName('Goals');
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  var goals = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (!row[1]) continue;
    goals.push({
      id: String(row[0] || 'g-' + i),
      title: String(row[1] || ''),
      targetAmount: Number(row[2] || 0),
      targetDate: String(row[3] || ''),
      category: String(row[4] || 'networth'),
      icon: String(row[5] || '🎯'),
      notes: String(row[6] || '')
    });
  }
  return goals;
}

function saveGoalsData(ss, goals) {
  var sheet = ss.getSheetByName('Goals');
  if (!sheet) return;

  sheet.clearContents();
  sheet.appendRow(['ID', 'Title', 'Target Amount (INR)', 'Target Date', 'Category', 'Icon', 'Notes']);
  sheet.getRange(1, 1, 1, 7).setFontWeight('bold').setBackground('#1e293b').setFontColor('#f8fafc');

  var rows = goals.map(function(g) {
    return [
      g.id || 'g-' + Date.now(),
      g.title || '',
      Number(g.targetAmount || 0),
      g.targetDate || '',
      g.category || 'networth',
      g.icon || '🎯',
      g.notes || ''
    ];
  });

  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, 7).setValues(rows);
  }
}
