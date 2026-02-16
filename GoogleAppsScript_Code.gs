/**
 * GoodHello - Google Apps Script Web App
 * 4 cột: host | guestName | message | timestamp
 */

const SHEET_NAME = 'Sheet1'; // Đổi nếu tab sheet của bạn không tên Sheet1

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) {
      return buildResponse(false, 'Sheet not found');
    }
    const data = JSON.parse(e.postData.contents);
    if (data.action === 'recordVisit') {
      return recordVisit(sheet, data);
    }
    if (data.action === 'addWish') {
      return addWish(sheet, data);
    }
    return buildResponse(false, 'Invalid action');
  } catch (err) {
    return buildResponse(false, err.toString());
  }
}

function doGet(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) {
      return buildResponse(false, 'Sheet not found');
    }
    const action = e.parameter.action;
    if (action === 'getWishes') {
      const host = e.parameter.host;
      return getWishes(sheet, host);
    }
    if (action === 'addWish') {
      let msg = e.parameter.message || '';
      try {
        if (msg && msg.indexOf('%') !== -1) msg = decodeURIComponent(msg);
      } catch (err) { /* giữ nguyên msg */ }
      const data = {
        host: e.parameter.host,
        guestName: e.parameter.guestName || 'Guest',
        message: msg
      };
      return addWish(sheet, data);
    }
    return buildResponse(false, 'Invalid action');
  } catch (err) {
    return buildResponse(false, err.toString());
  }
}

function recordVisit(sheet, data) {
  const host = data.host;
  const guestName = data.guestName;
  const timestamp = new Date().toISOString();
  if (!host || !guestName) {
    return buildResponse(false, 'Missing host or guestName');
  }
  const existingRow = findExistingVisit(sheet, host, guestName);
  if (existingRow > 0) {
    sheet.getRange(existingRow, 4).setValue(timestamp);
    return buildResponse(true, 'Visit updated', { rowId: existingRow });
  }
  sheet.appendRow([host, guestName, '', timestamp]);
  const lastRow = sheet.getLastRow();
  return buildResponse(true, 'Visit recorded', { rowId: lastRow });
}

function addWish(sheet, data) {
  const host = data.host;
  let guestName = data.guestName || 'Guest';
  const message = (data.message || '').trim();
  const timestamp = new Date().toISOString();
  if (!host || !message) {
    return buildResponse(false, 'Missing host or message');
  }
  const existingRow = findExistingVisit(sheet, host, guestName);
  if (existingRow > 0) {
    sheet.getRange(existingRow, 3).setValue(message);
    sheet.getRange(existingRow, 4).setValue(timestamp);
    return buildResponse(true, 'Wish updated', { rowId: existingRow });
  }
  sheet.appendRow([host, guestName, message, timestamp]);
  const lastRow = sheet.getLastRow();
  return buildResponse(true, 'Wish added', { rowId: lastRow });
}

function getWishes(sheet, host) {
  if (!host) {
    return buildResponse(false, 'Host is required');
  }
  const data = sheet.getDataRange().getValues();
  const wishes = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const rowHost = row[0];
    const guestName = row[1];
    const message = row[2];
    const timestamp = row[3];
    if (rowHost === host && message && String(message).trim() !== '') {
      wishes.push({ guestName: guestName, message: message, timestamp: timestamp });
    }
  }
  return buildResponse(true, 'OK', { wishes: wishes });
}

function findExistingVisit(sheet, host, guestName) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === host && data[i][1] === guestName) {
      return i + 1;
    }
  }
  return -1;
}

function buildResponse(success, message, extra) {
  const body = { success: success, message: message, timestamp: new Date().toISOString(), ...(extra || {}) };
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);
}
