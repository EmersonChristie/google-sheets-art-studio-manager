const RECORD_HEADER_FIELDS = {
  artworks: {
    ID: 'id',
    'Main Image': 'mainImage',
    Title: 'title',
    Year: 'year',
    Medium: 'medium',
    Width: 'width',
    Height: 'height',
    Dimensions: 'dimensions',
    Status: 'status',
    Price: 'price',
    Description: 'description',
    Notes: 'notes',
    'Secondary Images': 'secondaryImages',
    Select: 'select'
  },
  contacts: {
    ID: 'id',
    Name: 'name',
    Email: 'email',
    Phone: 'phone',
    'Contact Type': 'type',
    Notes: 'notes',
    Select: 'select'
  },
  collections: {
    ID: 'id',
    Name: 'name',
    Slug: 'slug',
    Description: 'description',
    Visibility: 'visibility',
    Select: 'select'
  }
};

/**
 * @param {string} moduleId
 * @returns {Object<string, string>}
 */
function getRecordHeaderFields_(moduleId) {
  return RECORD_HEADER_FIELDS[moduleId] || {};
}

/**
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {number} rowNumber
 * @param {string} moduleId
 * @returns {object}
 */
function getRecordFromRow_(sheet, rowNumber, moduleId) {
  const headers = getSheetHeaderRow_(sheet);
  const values = sheet.getRange(rowNumber, 1, 1, headers.length).getValues()[0];
  const fieldMap = getRecordHeaderFields_(moduleId);
  const record = { rowNumber: rowNumber };

  headers.forEach((header, index) => {
    const field = fieldMap[header];

    if (field && field !== 'select') {
      record[field] = values[index];
    }
  });

  return record;
}

/**
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {number} rowNumber
 * @param {string} moduleId
 * @param {object} record
 */
function updateRecordRow_(sheet, rowNumber, moduleId, record) {
  const headers = getSheetHeaderRow_(sheet);
  const fieldMap = getRecordHeaderFields_(moduleId);

  headers.forEach((header, index) => {
    const field = fieldMap[header];

    if (!field || field === 'id' || field === 'select') {
      return;
    }

    if (!Object.prototype.hasOwnProperty.call(record, field)) {
      return;
    }

    sheet.getRange(rowNumber, index + 1).setValue(formatRecordFieldValue_(field, record[field]));
  });
}

/**
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {string} moduleId
 * @param {object} record
 * @returns {Array<string|number|boolean>}
 */
function buildRecordRow_(sheet, moduleId, record) {
  const headers = getSheetHeaderRow_(sheet);
  const fieldMap = getRecordHeaderFields_(moduleId);

  return headers.map((header) => {
    const field = fieldMap[header];

    if (!field) {
      return '';
    }

    if (field === 'select') {
      return false;
    }

    if (!Object.prototype.hasOwnProperty.call(record, field)) {
      return '';
    }

    return formatRecordFieldValue_(field, record[field]);
  });
}

/**
 * @param {string} field
 * @param {*} value
 * @returns {string|number|boolean}
 */
function formatRecordFieldValue_(field, value) {
  if (field === 'year' || field === 'width' || field === 'height' || field === 'price') {
    return parseOptionalNumber(value);
  }

  if (field === 'status') {
    return normalizeArtworkStatus_(value);
  }

  return value || '';
}
