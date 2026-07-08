const FORM_FIELD_CONFIG = {
  artworks: [
    { key: 'title', label: 'Title', type: 'text', required: true },
    { key: 'year', label: 'Year', type: 'number' },
    { key: 'medium', label: 'Medium', type: 'text' },
    { key: 'width', label: 'Width', type: 'number' },
    { key: 'height', label: 'Height', type: 'number' },
    { key: 'dimensions', label: 'Dimensions', type: 'text' },
    { key: 'mainImage', label: 'Main Image', type: 'text' },
    { key: 'secondaryImages', label: 'Secondary Images', type: 'text' },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: ['Available', 'Sold', 'On Hold', 'On Consignment']
    },
    { key: 'price', label: 'Price', type: 'number' },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'notes', label: 'Notes', type: 'textarea' }
  ],
  contacts: [
    { key: 'name', label: 'Name', type: 'text', required: true },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'phone', label: 'Phone', type: 'text' },
    {
      key: 'type',
      label: 'Contact Type',
      type: 'select',
      options: ['Collector', 'Gallery', 'Press', 'Other']
    },
    { key: 'notes', label: 'Notes', type: 'textarea' }
  ],
  collections: [
    { key: 'name', label: 'Name', type: 'text', required: true },
    { key: 'slug', label: 'Slug', type: 'text' },
    { key: 'description', label: 'Description', type: 'textarea' },
    {
      key: 'visibility',
      label: 'Visibility',
      type: 'select',
      options: ['Public', 'Private', 'Hidden']
    }
  ]
};

/**
 * @param {string} moduleId
 * @returns {Array<object>}
 */
function getFormFieldsForModule(moduleId) {
  return FORM_FIELD_CONFIG[moduleId]
    ? FORM_FIELD_CONFIG[moduleId].map((field) => Object.assign({}, field))
    : [];
}

/**
 * @returns {typeof FORM_FIELD_CONFIG}
 */
function getFormFieldConfig() {
  return FORM_FIELD_CONFIG;
}
