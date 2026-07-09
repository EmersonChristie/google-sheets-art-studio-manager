const IMPORT_SKIP_HEADERS = ['Select'];

const IMPORT_SYNONYMS = {
  artworks: {
    id: ['id', 'artwork id', 'sku', 'reference', 'ref'],
    mainImage: [
      'main image',
      'main image url',
      'image',
      'image url',
      'photo',
      'primary image',
      'thumbnail',
      'picture'
    ],
    secondaryImages: [
      'secondary images',
      'secondary image urls',
      'additional images',
      'other images',
      'gallery',
      'extra images'
    ],
    driveFolderUrl: ['drive folder url', 'drive folder', 'folder url', 'folder link'],
    driveFolderId: ['drive folder id', 'folder id'],
    title: ['title', 'name', 'artwork', 'artwork title', 'piece', 'work title', 'art title'],
    year: ['year', 'date', 'created', 'creation year', 'yr'],
    medium: ['medium', 'materials', 'media', 'technique'],
    width: ['width', 'w', 'width in', 'width inches', 'width inch'],
    height: ['height', 'h', 'height in', 'height inches', 'height inch'],
    dimensions: ['dimensions', 'dimension', 'size', 'dims', 'measurements'],
    status: ['status', 'availability', 'available', 'state'],
    price: ['price', 'amount', 'cost', 'value', 'list price'],
    description: ['description', 'desc', 'about', 'summary', 'details'],
    notes: ['notes', 'note', 'comments', 'comment', 'remarks']
  },
  contacts: {
    id: ['id', 'contact id', 'reference', 'ref'],
    name: ['name', 'full name', 'contact name', 'contact', 'person'],
    email: ['email', 'e mail', 'email address', 'mail'],
    phone: ['phone', 'telephone', 'mobile', 'cell', 'phone number'],
    type: ['type', 'contact type', 'category', 'role', 'kind'],
    notes: ['notes', 'note', 'comments', 'comment', 'remarks']
  },
  collections: {
    id: ['id', 'collection id', 'reference', 'ref'],
    name: ['name', 'collection', 'collection name', 'title'],
    slug: ['slug', 'url slug', 'handle', 'permalink'],
    description: ['description', 'desc', 'about', 'summary'],
    visibility: ['visibility', 'visible', 'public', 'status', 'access']
  }
};

/**
 * @param {string} moduleId
 * @returns {object}
 */
function getImportSchemaForModule(moduleId) {
  const module = getModuleById(moduleId);

  if (!module || module.id === 'settings') {
    throw new Error('Import is not available for this sheet.');
  }

  const sheetName = module.sheetName;
  const headers = getSheetHeaders(sheetName);
  const fieldMap = getRecordHeaderFields_(moduleId);
  const formFields = getFormFieldsForModule(moduleId);
  const columnTypes = getSheetColumnTypes(sheetName);
  const requiredKeys = formFields
    .filter((field) => field.required)
    .map((field) => field.key);
  const formFieldByKey = formFields.reduce((acc, field) => {
    acc[field.key] = field;
    return acc;
  }, {});

  const columns = headers
    .filter((header) => IMPORT_SKIP_HEADERS.indexOf(header) === -1)
    .map((header) => {
      const fieldKey = fieldMap[header] || '';
      const formField = formFieldByKey[fieldKey];
      const columnType = columnTypes[header] || { type: 'text' };

      return {
        header: header,
        fieldKey: fieldKey,
        required: requiredKeys.indexOf(fieldKey) !== -1,
        type: columnType.type,
        options: columnType.options || [],
        label: formField ? formField.label : header
      };
    })
    .filter((column) => column.fieldKey);

  return {
    moduleId: moduleId,
    moduleLabel: module.label,
    sheetName: sheetName,
    columns: columns,
    synonyms: IMPORT_SYNONYMS[moduleId] || {}
  };
}
