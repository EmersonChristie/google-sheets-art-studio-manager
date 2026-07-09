function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Escapes JSON for safe embedding inside a <script> tag.
 * @param {*} value
 * @returns {string}
 */
function sanitizeJsonForHtml_(value) {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}
