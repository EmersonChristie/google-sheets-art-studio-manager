/**
 * @returns {string}
 */
function getActiveSheetName() {
  return SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getName();
}

/**
 * Writes the header row for a sheet.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {string[]} headers
 */
function writeSheetHeaderRow_(sheet, headers) {
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.setFrozenRows(1);
}

/**
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @returns {boolean}
 */
function sheetHasHeaderRow_(sheet) {
  const lastColumn = Math.max(sheet.getLastColumn(), 1);
  const firstRow = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];

  return firstRow.some((cell) => String(cell).trim().length > 0);
}

/**
 * Creates a sheet with headers when missing, or adds headers to a blank sheet.
 * @param {string} sheetName
 * @param {string[]} headers
 * @param {{ applyFormats?: boolean }=} options
 * @returns {GoogleAppsScript.Spreadsheet.Sheet}
 */
function ensureSheetWithHeaders_(sheetName, headers, options) {
  const opts = options || {};
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(sheetName);
  let provisioned = false;

  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
    writeSheetHeaderRow_(sheet, headers);
    provisioned = true;
  } else if (!sheetHasHeaderRow_(sheet)) {
    writeSheetHeaderRow_(sheet, headers);
    provisioned = true;
  }

  if (provisioned && opts.applyFormats) {
    applySheetColumnFormats_(sheet, sheetName);
  }

  return sheet;
}

/**
 * Lightweight check used when opening the sidebar.
 */
function ensureWorkspaceSheets() {
  const sheetNames = getSheetNames();

  Object.keys(sheetNames).forEach((key) => {
    const sheetName = sheetNames[key];
    ensureSheetWithHeaders_(sheetName, getSheetHeaders(sheetName));
  });
}

/**
 * Full workspace provisioning during setup only.
 */
function provisionWorkspaceOnSetup_() {
  const sheetNames = getSheetNames();

  Object.keys(sheetNames).forEach((key) => {
    const sheetName = sheetNames[key];
    ensureSheetWithHeaders_(sheetName, getSheetHeaders(sheetName), {
      applyFormats: true
    });
  });
}
