/**
 * @param {string} moduleId
 * @returns {object}
 */
function getImportSchema(moduleId) {
  return getImportSchemaForModule(moduleId);
}

/**
 * @param {string} moduleId
 * @param {object} payload
 * @returns {object}
 */
function importModuleRecords(moduleId, payload) {
  const records = payload && payload.records ? payload.records : [];
  const customFieldHeaders = payload && payload.customFieldHeaders ? payload.customFieldHeaders : [];

  if (!records.length) {
    throw new Error('No records to import.');
  }

  const schema = getImportSchemaForModule(moduleId);
  const mappingValidation = validateImportCustomFields_(moduleId, customFieldHeaders);

  if (!mappingValidation.valid) {
    return {
      success: false,
      imported: 0,
      errors: mappingValidation.errors,
      message: 'Import validation failed.'
    };
  }

  const validation = validateImportRecords_(moduleId, records, schema);

  if (!validation.valid) {
    return {
      success: false,
      imported: 0,
      errors: validation.errors,
      message: 'Import validation failed.'
    };
  }

  const sheet = getModuleSheet_(moduleId);
  appendCustomFieldsToSheet_(sheet, customFieldHeaders);

  const startSequence = Math.max(sheet.getLastRow(), 1);
  const rows = records.map((record, index) => {
    const normalized = normalizeImportRecord_(record, schema);

    if (!isNonEmptyString(normalized.id)) {
      normalized.id = generateRecordIdForSequence_(moduleId, startSequence + index);
    }

    return buildImportRecordRow_(sheet, moduleId, normalized);
  });

  const startRow = sheet.getLastRow() + 1;
  sheet.getRange(startRow, 1, rows.length, rows[0].length).setValues(rows);
  triggerDeployHook_();

  const customNote =
    customFieldHeaders.length > 0
      ? ' Added ' + customFieldHeaders.length + ' custom field(s).'
      : '';

  return {
    success: true,
    imported: rows.length,
    errors: [],
    message:
      'Imported ' +
      rows.length +
      ' ' +
      getModuleById(moduleId).label.toLowerCase() +
      '.' +
      customNote
  };
}

/**
 * @param {string} moduleId
 * @param {Array<object>} records
 * @param {object} schema
 * @returns {{ valid: boolean, errors: Array<object> }}
 */
function validateImportRecords_(moduleId, records, schema) {
  const errors = [];
  const columnsByKey = schema.columns.reduce((acc, column) => {
    acc[column.fieldKey] = column;
    return acc;
  }, {});

  records.forEach((record, rowIndex) => {
    schema.columns.forEach((column) => {
      if (!column.required) {
        return;
      }

      if (!isNonEmptyString(record[column.fieldKey])) {
        errors.push({
          row: rowIndex + 1,
          field: column.header,
          message: column.header + ' is required.'
        });
      }
    });

    Object.keys(record).forEach((fieldKey) => {
      const column = columnsByKey[fieldKey];
      const value = record[fieldKey];

      if (!column || value === '' || value === null || value === undefined) {
        return;
      }

      if (column.type === 'number' || column.type === 'integer') {
        const trimmed = String(value).trim();
        const numeric = parseImportNumber_(trimmed);

        if (trimmed && numeric === null) {
          errors.push({
            row: rowIndex + 1,
            field: column.header,
            message: column.header + ' must be a number.'
          });
        }
      }

      if (column.type === 'dropdown' && column.options.length) {
        const normalized = String(value).trim();

        if (
          normalized &&
          column.options.indexOf(normalized) === -1 &&
          !column.options.some(
            (option) => option.toLowerCase() === normalized.toLowerCase()
          )
        ) {
          errors.push({
            row: rowIndex + 1,
            field: column.header,
            message:
              column.header +
              ' must be one of: ' +
              column.options.join(', ') +
              '.'
          });
        }
      }

      if (fieldKey === 'email' && isNonEmptyString(value)) {
        const email = String(value).trim();

        if (email.indexOf('@') === -1) {
          errors.push({
            row: rowIndex + 1,
            field: column.header,
            message: column.header + ' must be a valid email.'
          });
        }
      }
    });
  });

  return {
    valid: errors.length === 0,
    errors: errors
  };
}

/**
 * @param {string} moduleId
 * @param {number} sequence
 * @returns {string}
 */
function generateRecordIdForSequence_(moduleId, sequence) {
  const prefixes = {
    artworks: 'AW',
    contacts: 'CON',
    collections: 'COL'
  };
  const prefix = prefixes[moduleId] || 'REC';
  const padLength = moduleId === 'artworks' ? 4 : 3;

  return prefix + '-' + String(sequence).padStart(padLength, '0');
}

/**
 * @param {object} record
 * @param {object} schema
 * @returns {object}
 */
function normalizeImportRecord_(record, schema) {
  const payload = Object.assign({}, record);
  const columnsByKey = schema.columns.reduce((acc, column) => {
    acc[column.fieldKey] = column;
    return acc;
  }, {});

  Object.keys(payload).forEach((fieldKey) => {
    if (fieldKey === 'customFields') {
      return;
    }

    const column = columnsByKey[fieldKey];
    const value = payload[fieldKey];

    if (!column || value === '' || value === null || value === undefined) {
      return;
    }

    const normalized = normalizeImportValue_(
      value,
      IMPORT_DATA_TYPES.TEXT,
      column.dataType || getCrmDataType_(fieldKey, column.type),
      fieldKey
    );

    payload[fieldKey] = normalized.value;

    if (column.type === 'dropdown' && column.options.length) {
      const match = column.options.find(
        (option) => option.toLowerCase() === String(payload[fieldKey]).trim().toLowerCase()
      );

      if (match) {
        payload[fieldKey] = match;
      }
    }
  });

  if (payload.customFields) {
    Object.keys(payload.customFields).forEach((header) => {
      const value = payload.customFields[header];

      if (value === '' || value === null || value === undefined) {
        return;
      }

      const normalized = normalizeImportValue_(value, IMPORT_DATA_TYPES.TEXT, IMPORT_DATA_TYPES.TEXT);
      payload.customFields[header] = normalized.value;
    });
  }

  return payload;
}

/**
 * @param {string} moduleId
 * @param {string[]} customFieldHeaders
 * @returns {{ valid: boolean, errors: Array<object> }}
 */
function validateImportCustomFields_(moduleId, customFieldHeaders) {
  const errors = [];
  const sheet = getModuleSheet_(moduleId);
  const existingHeaders = getSheetHeaderRow_(sheet);
  const seen = {};

  customFieldHeaders.forEach((name) => {
    const trimmed = String(name || '').trim();

    if (!trimmed) {
      errors.push({
        row: 0,
        field: 'Custom Field',
        message: 'Custom field name cannot be blank.'
      });
      return;
    }

    const normalized = trimmed.toLowerCase();

    if (seen[normalized]) {
      errors.push({
        row: 0,
        field: trimmed,
        message: 'Duplicate custom field name: ' + trimmed + '.'
      });
      return;
    }

    seen[normalized] = true;

    if (existingHeaders.indexOf(trimmed) !== -1) {
      errors.push({
        row: 0,
        field: trimmed,
        message: 'Custom field "' + trimmed + '" already exists on this sheet.'
      });
    }
  });

  return {
    valid: errors.length === 0,
    errors: errors
  };
}

/**
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {string[]} customFieldHeaders
 * @returns {string[]}
 */
function appendCustomFieldsToSheet_(sheet, customFieldHeaders) {
  const names = (customFieldHeaders || [])
    .map((name) => String(name || '').trim())
    .filter(Boolean);

  if (!names.length) {
    return [];
  }

  const existingHeaders = getSheetHeaderRow_(sheet);
  const toAdd = names.filter((name) => existingHeaders.indexOf(name) === -1);

  if (!toAdd.length) {
    return [];
  }

  const startCol = existingHeaders.length + 1;
  sheet.getRange(1, startCol, 1, toAdd.length).setValues([toAdd]);
  sheet.getRange(1, startCol, 1, toAdd.length).setFontWeight('bold');

  return toAdd;
}

/**
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {string} moduleId
 * @param {object} record
 * @returns {Array<string|number|boolean>}
 */
function buildImportRecordRow_(sheet, moduleId, record) {
  const headers = getSheetHeaderRow_(sheet);
  const fieldMap = getRecordHeaderFields_(moduleId);
  const customFields = record.customFields || {};

  return headers.map((header) => {
    const field = fieldMap[header];

    if (!header) {
      return '';
    }

    if (field === 'select') {
      return false;
    }

    if (field && Object.prototype.hasOwnProperty.call(record, field)) {
      return formatRecordFieldValue_(field, record[field]);
    }

    if (Object.prototype.hasOwnProperty.call(customFields, header)) {
      return customFields[header] || '';
    }

    return '';
  });
}
