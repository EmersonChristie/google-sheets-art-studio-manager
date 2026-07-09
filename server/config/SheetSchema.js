/**
 * Column headers for each workspace sheet.
 */
const SHEET_HEADERS = {
  Settings: [
    'Artist Name',
    'Website URL',
    'Cloudinary Cloud Name',
    'Cloudinary Upload Preset',
    'Deploy Hook URL',
    'Artwork Folder ID',
    'Artwork Folder Name',
    'Artwork Folder URL',
    'Default Image Storage'
  ],
  Artworks: [
    'Select',
    'ID',
    'Main Image URL',
    'Secondary Image URLs',
    'Drive Folder URL',
    'Drive Folder ID',
    'Title',
    'Year',
    'Medium',
    'Width',
    'Height',
    'Dimensions',
    'Status',
    'Price',
    'Description',
    'Notes'
  ],
  Collections: ['Select', 'ID', 'Name', 'Slug', 'Description', 'Visibility'],
  Contacts: ['Select', 'ID', 'Name', 'Email', 'Phone', 'Contact Type', 'Notes']
};

/**
 * @param {string} sheetName
 * @returns {string[]}
 */
function getSheetHeaders(sheetName) {
  return SHEET_HEADERS[sheetName] ? SHEET_HEADERS[sheetName].slice() : [];
}

/**
 * @returns {typeof SHEET_HEADERS}
 */
function getSheetHeaderMap() {
  return SHEET_HEADERS;
}
