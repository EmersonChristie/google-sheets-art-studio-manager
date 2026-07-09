/**
 * @param {string} value
 * @returns {string}
 */
function slugifyFileName(value) {
  const slug = String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 80);

  return slug || 'untitled';
}
