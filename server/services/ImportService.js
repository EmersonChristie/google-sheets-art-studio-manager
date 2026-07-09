/**
 * @param {string} moduleId
 * @returns {object}
 */
function getImportSchema(moduleId) {
  return getImportSchemaForModule(moduleId);
}

/**
 * @param {string} moduleId
 * @param {Array<object>} records
 * @returns {object}
 */
function importModuleRecords(moduleId, records) {
  if (!records || !records.length) {
    throw new Error('No records to import.');
  }

  const schema = getImportSchemaForModule(moduleId);
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
  const startSequence = Math.max(sheet.getLastRow(), 1);
  const rows = records.map((record, index) => {
    const payload = normalizeImportRecord_(record, schema);

    if (!isNonEmptyString(payload.id)) {
      payload.id = generateRecordIdForSequence_(moduleId, startSequence + index);
    }

    return buildRecordRow_(sheet, moduleId, payload);
  });

  const startRow = sheet.getLastRow() + 1;
  sheet.getRange(startRow, 1, rows.length, rows[0].length).setValues(rows);
  triggerDeployHook_();

  return {
    success: true,
    imported: rows.length,
    errors: [],
    message: 'Imported ' + rows.length + ' ' + getModuleById(moduleId).label.toLowerCase() + '.'
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

        if (trimmed && !Number.isFinite(Number(trimmed))) {
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
    const column = columnsByKey[fieldKey];
    const value = payload[fieldKey];

    if (!column || value === '' || value === null || value === undefined) {
      return;
    }

    if (column.type === 'dropdown' && column.options.length) {
      const match = column.options.find(
        (option) => option.toLowerCase() === String(value).trim().toLowerCase()
      );

      if (match) {
        payload[fieldKey] = match;
      }
    }
  });

  return payload;
}
