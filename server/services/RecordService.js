const ARTWORK_STATUS_OPTIONS = [
  'Available',
  'Sold',
  'On Hold',
  'On Consignment'
];

/**
 * @param {string} moduleId
 * @returns {GoogleAppsScript.Spreadsheet.Sheet}
 */
function getModuleSheet_(moduleId) {
  const module = getModuleById(moduleId);

  if (!module) {
    throw new Error('Unsupported module.');
  }

  return ensureSheetWithHeaders_(module.sheetName, getSheetHeaders(module.sheetName));
}

/**
 * @param {string} moduleId
 * @returns {number}
 */
function getModuleRecordCount(moduleId) {
  const sheet = getModuleSheet_(moduleId);
  return Math.max(sheet.getLastRow() - 1, 0);
}

/**
 * @param {string} moduleId
 * @param {object} record
 * @returns {{ message: string, id: string }}
 */
function saveModuleRecord(moduleId, record) {
  const sheet = getModuleSheet_(moduleId);
  const payload = Object.assign({}, record);

  if (moduleId === 'artworks' && !payload.id) {
    payload.id = generateRecordId_(moduleId, sheet);
  }

  if ((moduleId === 'contacts' || moduleId === 'collections') && !payload.id) {
    payload.id = generateRecordId_(moduleId, sheet);
  }

  sheet.appendRow(buildRecordRow_(sheet, moduleId, payload));
  triggerDeployHook_();

  return {
    message: `${getModuleById(moduleId).singularLabel} saved.`,
    id: payload.id || ''
  };
}

/**
 * @param {string} moduleId
 * @param {number} rowNumber
 * @param {object} record
 * @returns {{ message: string }}
 */
function updateModuleRecord(moduleId, rowNumber, record) {
  const sheet = getModuleSheet_(moduleId);

  updateRecordRow_(sheet, rowNumber, moduleId, record);
  triggerDeployHook_();

  return {
    message: `${getModuleById(moduleId).singularLabel} updated.`
  };
}

/**
 * Lightweight context payload for sidebar polling.
 * @returns {object}
 */
function watchSidebarContext() {
  const activeSheetName = getActiveSheetName();
  const isSetupComplete = isOrganizationConfigured();

  if (!isSetupComplete) {
    return {
      activeSheetName: activeSheetName,
      page: getSetupViewId(),
      moduleId: null,
      selectionSignature: '',
      selection: null,
      recordCount: 0
    };
  }

  const module = getModuleBySheetName(activeSheetName);

  if (!module || module.id === 'settings') {
    return {
      activeSheetName: activeSheetName,
      page: module ? 'dashboard' : 'unsupported',
      moduleId: module ? module.id : null,
      selectionSignature: '',
      selection: null,
      recordCount: 0,
      isSettingsModule: Boolean(module)
    };
  }

  const selection = getModuleSelectionContext(module.id);
  const rowNumbers = selection.rowNumbers.slice().sort((a, b) => a - b);

  return {
    activeSheetName: activeSheetName,
    page: selection.page,
    moduleId: module.id,
    selectionSignature: rowNumbers.join(','),
    selection: selection,
    recordCount: getModuleRecordCount(module.id)
  };
}

/**
 * @param {string} moduleId
 * @returns {object}
 */
function getModuleSelectionContext(moduleId) {
  const module = getModuleById(moduleId);
  const sheet = getModuleSheet_(moduleId);
  const rowNumbers = module.selectColumn
    ? getSelectedRowNumbers_(sheet, module.selectColumn)
    : [];
  const selectionCount = rowNumbers.length;

  if (selectionCount === 0) {
    return {
      selectionCount: 0,
      page: 'dashboard',
      rowNumber: null,
      record: null,
      records: [],
      rowNumbers: []
    };
  }

  if (selectionCount === 1) {
    const rowNumber = rowNumbers[0];

    return {
      selectionCount: 1,
      page: 'edit',
      rowNumber: rowNumber,
      record: getRecordFromRow_(sheet, rowNumber, moduleId),
      records: [],
      rowNumbers: rowNumbers
    };
  }

  const records = rowNumbers.map((rowNumber) =>
    getRecordFromRow_(sheet, rowNumber, moduleId)
  );

  return {
    selectionCount: selectionCount,
    page: 'bulk',
    rowNumber: null,
    record: null,
    records: records,
    rowNumbers: rowNumbers
  };
}

/**
 * @param {string} moduleId
 * @returns {object}
 */
function getEditRecordContext(moduleId) {
  const context = getModuleSelectionContext(moduleId);

  if (context.selectionCount !== 1) {
    return {
      hasSelection: false,
      message:
        context.selectionCount === 0
          ? `No ${getModuleById(moduleId).singularLabel.toLowerCase()} selected. Mark one row in the Select column.`
          : `Multiple rows selected. Use bulk actions or select only one row.`
    };
  }

  return {
    hasSelection: true,
    rowNumber: context.rowNumber,
    record: context.record
  };
}

/**
 * @param {string} moduleId
 * @returns {object}
 */
function getBulkRecordContext(moduleId) {
  const context = getModuleSelectionContext(moduleId);
  const module = getModuleById(moduleId);

  return {
    selectionCount: context.selectionCount,
    rowNumbers: context.rowNumbers,
    records: context.records,
    message:
      context.selectionCount < 2
        ? `Select two or more rows in the Select column for bulk actions.`
        : ''
  };
}

/**
 * @param {string} status
 * @returns {string}
 */
function normalizeArtworkStatus_(status) {
  const value = String(status || '').trim();

  return ARTWORK_STATUS_OPTIONS.includes(value) ? value : 'Available';
}

/**
 * @param {string} moduleId
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @returns {string}
 */
function generateRecordId_(moduleId, sheet) {
  const prefixes = {
    artworks: 'ART',
    contacts: 'CON',
    collections: 'COL'
  };
  const prefix = prefixes[moduleId] || 'REC';
  const nextId = Math.max(sheet.getLastRow(), 1);

  return `${prefix}-${String(nextId).padStart(3, '0')}`;
}

function triggerDeployHook_() {
  const deployHookUrl = getSetup().deployHookUrl;

  if (!deployHookUrl) {
    return;
  }

  try {
    UrlFetchApp.fetch(deployHookUrl, {
      method: 'post',
      muteHttpExceptions: true
    });
  } catch (error) {
    console.warn('Deploy hook failed:', error);
  }
}
