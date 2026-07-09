const IMPORT_DATA_TYPES = {
  TEXT: 'text',
  NUMBER: 'number',
  CURRENCY: 'currency',
  DATE: 'date',
  BOOLEAN: 'boolean',
  URL: 'url',
  EMAIL: 'email',
  IMAGE_URL: 'image-url',
  MULTI_VALUE: 'multi-value',
  UNKNOWN: 'unknown'
};

const BOOLEAN_TRUE_VALUES = ['true', 'yes', 'y', '1'];
const BOOLEAN_FALSE_VALUES = ['false', 'no', 'n', '0'];

/**
 * @param {string} fieldKey
 * @param {string} columnType
 * @param {object=} formField
 * @returns {string}
 */
function getCrmDataType_(fieldKey, columnType, formField) {
  if (fieldKey === 'email') {
    return IMPORT_DATA_TYPES.EMAIL;
  }

  if (fieldKey === 'mainImage' || fieldKey === 'secondaryImages') {
    return IMPORT_DATA_TYPES.IMAGE_URL;
  }

  if (fieldKey === 'driveFolderUrl' || fieldKey === 'websiteUrl') {
    return IMPORT_DATA_TYPES.URL;
  }

  if (fieldKey === 'price') {
    return IMPORT_DATA_TYPES.CURRENCY;
  }

  if (columnType === 'integer' || columnType === 'number') {
    return IMPORT_DATA_TYPES.NUMBER;
  }

  if (fieldKey === 'year') {
    return IMPORT_DATA_TYPES.NUMBER;
  }

  if (formField && formField.type === 'textarea') {
    return IMPORT_DATA_TYPES.TEXT;
  }

  return IMPORT_DATA_TYPES.TEXT;
}

/**
 * @param {Array<string>} values
 * @returns {object}
 */
function analyzeCsvColumn_(values) {
  const populated = values
    .map((value) => String(value === undefined || value === null ? '' : value).trim())
    .filter(Boolean);

  const sample = populated.length ? populated[0] : '';
  const detectedType = detectCsvColumnType_(populated);

  return {
    sample: sample,
    populatedCount: populated.length,
    detectedType: detectedType,
    detectedLabel: getImportDataTypeLabel_(detectedType)
  };
}

/**
 * @param {Array<string>} values
 * @returns {string}
 */
function detectCsvColumnType_(values) {
  if (!values.length) {
    return IMPORT_DATA_TYPES.UNKNOWN;
  }

  const sampleSize = Math.min(values.length, 25);
  const sample = values.slice(0, sampleSize);
  const scores = {};
  let total = 0;

  sample.forEach((value) => {
    const type = detectSingleValueType_(value);
    scores[type] = (scores[type] || 0) + 1;
    total++;
  });

  const ranked = Object.keys(scores).sort((a, b) => scores[b] - scores[a]);
  const winner = ranked[0] || IMPORT_DATA_TYPES.UNKNOWN;
  const confidence = total ? scores[winner] / total : 0;

  if (confidence < 0.5) {
    return IMPORT_DATA_TYPES.TEXT;
  }

  return winner;
}

/**
 * @param {string} value
 * @returns {string}
 */
function detectSingleValueType_(value) {
  const trimmed = String(value || '').trim();

  if (!trimmed) {
    return IMPORT_DATA_TYPES.UNKNOWN;
  }

  const lower = trimmed.toLowerCase();

  if (BOOLEAN_TRUE_VALUES.indexOf(lower) !== -1 || BOOLEAN_FALSE_VALUES.indexOf(lower) !== -1) {
    return IMPORT_DATA_TYPES.BOOLEAN;
  }

  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return IMPORT_DATA_TYPES.EMAIL;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    if (/\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(trimmed) || /drive\.google\.com/i.test(trimmed)) {
      return IMPORT_DATA_TYPES.IMAGE_URL;
    }

    return IMPORT_DATA_TYPES.URL;
  }

  if (/^[\$€£]\s?[\d,]+(\.\d+)?$/.test(trimmed) || /^[\d,]+(\.\d+)?\s?[\$€£]$/.test(trimmed)) {
    return IMPORT_DATA_TYPES.CURRENCY;
  }

  if (looksLikeDate_(trimmed)) {
    return IMPORT_DATA_TYPES.DATE;
  }

  if (trimmed.indexOf(',') !== -1 && trimmed.split(',').length > 1) {
    return IMPORT_DATA_TYPES.MULTI_VALUE;
  }

  if (/^-?\d+(\.\d+)?$/.test(trimmed.replace(/,/g, ''))) {
    return IMPORT_DATA_TYPES.NUMBER;
  }

  if (trimmed.length > 120) {
    return IMPORT_DATA_TYPES.TEXT;
  }

  return IMPORT_DATA_TYPES.TEXT;
}

/**
 * @param {string} value
 * @returns {boolean}
 */
function looksLikeDate_(value) {
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(value)) {
    return true;
  }

  if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(value)) {
    return true;
  }

  if (/^\d{1,2}-\d{1,2}-\d{2,4}$/.test(value)) {
    return true;
  }

  const parsed = Date.parse(value);
  return Number.isFinite(parsed) && value.length >= 6;
}

/**
 * @param {string} csvType
 * @param {string} crmType
 * @returns {boolean}
 */
function areImportTypesCompatible_(csvType, crmType) {
  if (!csvType || !crmType || csvType === IMPORT_DATA_TYPES.UNKNOWN) {
    return true;
  }

  if (csvType === crmType) {
    return true;
  }

  const compatible = {
    currency: ['number', 'currency', 'text'],
    number: ['number', 'currency', 'text'],
    text: ['text', 'multi-value', 'url', 'email', 'image-url', 'date', 'boolean', 'unknown'],
    multi-value: ['text', 'multi-value'],
    url: ['url', 'image-url', 'text'],
    'image-url': ['image-url', 'url', 'text'],
    email: ['email', 'text'],
    date: ['date', 'text', 'number'],
    boolean: ['boolean', 'text'],
    unknown: ['text', 'number', 'currency', 'date', 'boolean', 'url', 'email', 'image-url', 'multi-value']
  };

  const allowed = compatible[csvType] || [IMPORT_DATA_TYPES.TEXT];
  return allowed.indexOf(crmType) !== -1;
}

/**
 * @param {string} csvType
 * @param {string} crmType
 * @returns {string}
 */
function getImportCompatibilityWarning_(csvType, crmType) {
  if (areImportTypesCompatible_(csvType, crmType)) {
    return '';
  }

  return (
    getImportDataTypeLabel_(csvType) +
    ' being mapped to ' +
    getImportDataTypeLabel_(crmType)
  );
}

/**
 * @param {string} dataType
 * @returns {string}
 */
function getImportDataTypeLabel_(dataType) {
  const labels = {
    text: 'Text',
    number: 'Number',
    currency: 'Currency',
    date: 'Date',
    boolean: 'Boolean',
    url: 'URL',
    email: 'Email',
    'image-url': 'Image URL',
    'multi-value': 'Multi-value list',
    unknown: 'Unknown'
  };

  return labels[dataType] || 'Unknown';
}

/**
 * @param {*} value
 * @param {string} csvType
 * @param {string} crmType
 * @param {string=} fieldKey
 * @returns {{ value: *, normalized: boolean }}
 */
function normalizeImportValue_(value, csvType, crmType, fieldKey) {
  if (value === '' || value === null || value === undefined) {
    return { value: '', normalized: false };
  }

  let text = String(value).replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  let normalized = text !== String(value);

  if (
    crmType === IMPORT_DATA_TYPES.NUMBER ||
    crmType === IMPORT_DATA_TYPES.CURRENCY ||
    csvType === IMPORT_DATA_TYPES.CURRENCY ||
    csvType === IMPORT_DATA_TYPES.NUMBER ||
    fieldKey === 'price' ||
    fieldKey === 'year' ||
    fieldKey === 'width' ||
    fieldKey === 'height'
  ) {
    const numeric = parseImportNumber_(text);

    if (numeric !== null) {
      return { value: numeric, normalized: true };
    }
  }

  if (crmType === IMPORT_DATA_TYPES.BOOLEAN || csvType === IMPORT_DATA_TYPES.BOOLEAN) {
    const boolValue = parseImportBoolean_(text);

    if (boolValue !== null) {
      return { value: boolValue, normalized: true };
    }
  }

  if (crmType === IMPORT_DATA_TYPES.DATE || csvType === IMPORT_DATA_TYPES.DATE) {
    const dateValue = parseImportDate_(text);

    if (dateValue) {
      return { value: dateValue, normalized: true };
    }
  }

  if (csvType === IMPORT_DATA_TYPES.MULTI_VALUE && fieldKey === 'secondaryImages') {
    const urls = text
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean);

    if (urls.length > 1) {
      return { value: JSON.stringify(urls), normalized: true };
    }
  }

  return { value: text, normalized: normalized };
}

/**
 * @param {string} value
 * @returns {number|null}
 */
function parseImportNumber_(value) {
  const cleaned = String(value || '')
    .trim()
    .replace(/[\$€£]/g, '')
    .replace(/,/g, '')
    .trim();

  if (!cleaned) {
    return null;
  }

  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
}

/**
 * @param {string} value
 * @returns {boolean|null}
 */
function parseImportBoolean_(value) {
  const lower = String(value || '').trim().toLowerCase();

  if (BOOLEAN_TRUE_VALUES.indexOf(lower) !== -1) {
    return true;
  }

  if (BOOLEAN_FALSE_VALUES.indexOf(lower) !== -1) {
    return false;
  }

  return null;
}

/**
 * @param {string} value
 * @returns {string}
 */
function parseImportDate_(value) {
  const trimmed = String(value || '').trim();

  if (!trimmed || !looksLikeDate_(trimmed)) {
    return '';
  }

  const parsed = new Date(trimmed);

  if (!Number.isFinite(parsed.getTime())) {
    return '';
  }

  if (/^\d{4}$/.test(trimmed)) {
    return String(parsed.getFullYear());
  }

  return Utilities.formatDate(parsed, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}
