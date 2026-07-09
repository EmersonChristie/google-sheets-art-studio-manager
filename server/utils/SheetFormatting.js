const DEFAULT_FORMAT_ROW_COUNT = 1000;

/**
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @returns {number}
 */
function getSheetFormatRowCount_(sheet) {
  return Math.max(sheet.getLastRow() - 1, DEFAULT_FORMAT_ROW_COUNT);
}

/**
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {number} columnIndex
 * @param {number} numRows
 * @param {object} config
 */
function applyColumnFormat_(sheet, columnIndex, numRows, config) {
  const range = sheet.getRange(2, columnIndex, numRows, 1);

  range.clearDataValidations();

  switch (config.type) {
    case 'checkbox':
      range.insertCheckboxes();
      return;

    case 'dropdown':
      range.setNumberFormat('@');
      range.setDataValidation(
        SpreadsheetApp.newDataValidation()
          .requireValueInList(config.options, true)
          .setAllowInvalid(false)
          .build()
      );
      return;

    case 'integer':
      range.setNumberFormat('0');
      return;

    case 'number':
      range.setNumberFormat('0.##########');
      return;

    case 'text':
    default:
      range.setNumberFormat('@');
  }
}

/**
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {string} sheetName
 */
function applySheetColumnFormats_(sheet, sheetName) {
  const headers = getSheetHeaderRow_(sheet);
  const columnTypes = getSheetColumnTypes(sheetName);

  if (!headers.some((header) => header) || !Object.keys(columnTypes).length) {
    return;
  }

  const numRows = getSheetFormatRowCount_(sheet);

  headers.forEach((header, index) => {
    const config = columnTypes[header];

    if (!config) {
      return;
    }

    try {
      applyColumnFormat_(sheet, index + 1, numRows, config);
    } catch (error) {
      console.warn(
        'Skipped column format for ' + sheetName + ' / ' + header + ': ' + error.message
      );
    }
  });
}
