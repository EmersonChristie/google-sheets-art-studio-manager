const TRUTHY_SELECT_VALUES = new Set(['true', 'yes', 'x', '1']);

/**
 * @param {*} value
 * @returns {boolean}
 */
function isSelectedCellValue_(value) {
  if (value === true || value === 1) {
    return true;
  }

  return TRUTHY_SELECT_VALUES.has(String(value || '').trim().toLowerCase());
}

/**
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @returns {string[]}
 */
function getSheetHeaderRow_(sheet) {
  const lastColumn = Math.max(sheet.getLastColumn(), 1);

  return sheet
    .getRange(1, 1, 1, lastColumn)
    .getValues()[0]
    .map((header) => String(header || '').trim());
}

/**
 * @param {string[]} headers
 * @returns {Object<string, number>}
 */
function getHeaderIndexMap_(headers) {
  return headers.reduce((map, header, index) => {
    if (header) {
      map[header] = index;
    }

    return map;
  }, {});
}

/**
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {string} columnName
 * @returns {number[]}
 */
function getSelectedRowNumbers_(sheet, columnName) {
  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    return [];
  }

  const headers = getSheetHeaderRow_(sheet);
  const headerMap = getHeaderIndexMap_(headers);
  const selectIndex = headerMap[columnName];

  if (selectIndex === undefined) {
    return [];
  }

  const values = sheet
    .getRange(2, selectIndex + 1, lastRow - 1, 1)
    .getValues()
    .map((row) => row[0]);

  const selectedRows = [];

  values.forEach((value, index) => {
    if (isSelectedCellValue_(value)) {
      selectedRows.push(index + 2);
    }
  });

  return selectedRows;
}

/**
 * Returns the active spreadsheet row if it is a data row on the given sheet.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @returns {number|null}
 */
function getActiveSheetRow_(sheet) {
  const range = sheet.getActiveRange();

  if (!range) {
    return null;
  }

  const rowNumber = range.getRow();

  if (rowNumber < 2 || rowNumber > sheet.getLastRow()) {
    return null;
  }

  return rowNumber;
}
