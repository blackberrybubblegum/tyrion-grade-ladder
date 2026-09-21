/**
 * Grade Ladder – report form → Google Sheet
 *
 * Setup:
 * 1. Create a Google Sheet. Extensions > Apps Script. Paste this file in.
 * 2. Deploy > New deployment > Web app.
 *      Execute as: Me
 *      Who has access: Anyone
 * 3. Copy the web app URL into CONFIG.FORM_ENDPOINT in index.html.
 * Re-deploy (Manage deployments > Edit > New version) after any change here.
 */

const SHEET_NAME = 'Reports';
const HEADERS = ['Received', 'Type', 'Message', 'Email', 'Context', 'Page'];
const MAX_LEN = 2000;

function doPost(e) {
  const p = (e && e.parameter) || {};

  // Honeypot: real visitors never fill this hidden field.
  if (p.website) return json({ ok: true });

  const message = clean(p.message);
  if (!message) return json({ ok: false, error: 'empty message' });

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = getSheet();
    sheet.appendRow([
      new Date(),
      clean(p.type),
      message,
      clean(p.email),
      clean(p.context),
      clean(p.page)
    ]);
  } finally {
    lock.releaseLock();
  }
  return json({ ok: true });
}

function doGet() {
  return json({ ok: true, service: 'grade-ladder-reports' });
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
  return sheet;
}

// Prefixing with an apostrophe stops submitted text starting with =, +, - or @ being run as a formula.
function clean(v) {
  const s = String(v == null ? '' : v).slice(0, MAX_LEN).trim();
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
