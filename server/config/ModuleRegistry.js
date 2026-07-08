const MODULE_REGISTRY = {
  artworks: {
    id: 'artworks',
    label: 'Artworks',
    singularLabel: 'Artwork',
    sheetName: 'Artworks',
    selectColumn: 'Select',
    actions: {
      add: 'Add Artwork',
      edit: 'Edit Selected Artwork',
      bulk: 'Bulk Artwork Actions'
    },
    utilities: ['search', 'filters', 'import', 'export']
  },
  contacts: {
    id: 'contacts',
    label: 'Contacts',
    singularLabel: 'Contact',
    sheetName: 'Contacts',
    selectColumn: 'Select',
    actions: {
      add: 'Add Contact',
      edit: 'Edit Selected Contact',
      bulk: 'Bulk Contact Actions'
    },
    utilities: ['search', 'filters', 'import', 'export']
  },
  collections: {
    id: 'collections',
    label: 'Collections',
    singularLabel: 'Collection',
    sheetName: 'Collections',
    selectColumn: 'Select',
    actions: {
      add: 'Add Collection',
      edit: 'Edit Selected Collection',
      bulk: 'Bulk Collection Actions'
    },
    utilities: ['search', 'filters', 'import', 'export']
  }
};

const SETTINGS_MODULE = {
  id: 'settings',
  label: 'Settings',
  singularLabel: 'Setting',
  sheetName: 'Settings',
  actions: {
    add: 'Add Setting',
    edit: 'Edit Selected Setting',
    bulk: 'Bulk Setting Actions'
  },
  utilities: []
};

/**
 * @returns {typeof MODULE_REGISTRY}
 */
function getModuleRegistry() {
  return MODULE_REGISTRY;
}

/**
 * @param {string} sheetName
 * @returns {object|null}
 */
function getModuleBySheetName(sheetName) {
  if (sheetName === SETTINGS_MODULE.sheetName) {
    return SETTINGS_MODULE;
  }

  return (
    Object.values(MODULE_REGISTRY).find((module) => module.sheetName === sheetName) ||
    null
  );
}

/**
 * @param {string} moduleId
 * @returns {object|null}
 */
function getModuleById(moduleId) {
  if (moduleId === SETTINGS_MODULE.id) {
    return SETTINGS_MODULE;
  }

  return MODULE_REGISTRY[moduleId] || null;
}

/**
 * @returns {string}
 */
function getSetupViewId() {
  return 'setup';
}

/**
 * @returns {typeof SHEET_NAMES}
 */
function getSheetNames() {
  return {
    SETTINGS: 'Settings',
    ARTWORKS: 'Artworks',
    COLLECTIONS: 'Collections',
    CONTACTS: 'Contacts'
  };
}
