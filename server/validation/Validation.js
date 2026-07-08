/**
 * Shared validation helpers for sidebar forms.
 * Extend per module as CRUD features are implemented.
 */

/**
 * @param {string} value
 * @returns {boolean}
 */
function isNonEmptyString(value) {
  return String(value || '').trim().length > 0;
}

/**
 * @param {string|number} value
 * @returns {number|string}
 */
function parseOptionalNumber(value) {
  const trimmed = String(value || '').trim();

  if (!trimmed) {
    return '';
  }

  const num = Number(trimmed);

  return Number.isFinite(num) ? num : '';
}
