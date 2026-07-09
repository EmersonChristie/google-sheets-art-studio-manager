const ARTWORK_STATUS_OPTIONS = [
  'Available',
  'Sold',
  'On Hold',
  'On Consignment'
];

const CONTACT_TYPE_OPTIONS = ['Collector', 'Gallery', 'Press', 'Other'];

const COLLECTION_VISIBILITY_OPTIONS = ['Public', 'Private', 'Hidden'];

const IMAGE_STORAGE_OPTIONS = ['default-folder', 'artwork-subfolder'];

/**
 * Column formats keyed by sheet name, then header label.
 */
const SHEET_COLUMN_TYPES = {
  Artworks: {
    Select: { type: 'checkbox' },
    ID: { type: 'text' },
    'Main Image URL': { type: 'text' },
    'Secondary Image URLs': { type: 'text' },
    'Drive Folder URL': { type: 'text' },
    'Drive Folder ID': { type: 'text' },
    Title: { type: 'text' },
    Year: { type: 'integer' },
    Medium: { type: 'text' },
    Width: { type: 'number' },
    Height: { type: 'number' },
    Dimensions: { type: 'text' },
    Status: { type: 'dropdown', options: ARTWORK_STATUS_OPTIONS },
    Price: { type: 'number' },
    Description: { type: 'text' },
    Notes: { type: 'text' }
  },
  Contacts: {
    Select: { type: 'checkbox' },
    ID: { type: 'text' },
    Name: { type: 'text' },
    Email: { type: 'text' },
    Phone: { type: 'text' },
    'Contact Type': { type: 'dropdown', options: CONTACT_TYPE_OPTIONS },
    Notes: { type: 'text' }
  },
  Collections: {
    Select: { type: 'checkbox' },
    ID: { type: 'text' },
    Name: { type: 'text' },
    Slug: { type: 'text' },
    Description: { type: 'text' },
    Visibility: { type: 'dropdown', options: COLLECTION_VISIBILITY_OPTIONS }
  },
  Settings: {
    'Artist Name': { type: 'text' },
    'Website URL': { type: 'text' },
    'Cloudinary Cloud Name': { type: 'text' },
    'Cloudinary Upload Preset': { type: 'text' },
    'Deploy Hook URL': { type: 'text' },
    'Artwork Folder ID': { type: 'text' },
    'Artwork Folder Name': { type: 'text' },
    'Artwork Folder URL': { type: 'text' },
    'Default Image Storage': { type: 'dropdown', options: IMAGE_STORAGE_OPTIONS }
  }
};

/**
 * @param {string} sheetName
 * @returns {Object<string, object>}
 */
function getSheetColumnTypes(sheetName) {
  return SHEET_COLUMN_TYPES[sheetName] ? Object.assign({}, SHEET_COLUMN_TYPES[sheetName]) : {};
}
