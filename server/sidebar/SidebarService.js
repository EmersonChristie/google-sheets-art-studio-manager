/**
 * Opens the sidebar using the active sheet context.
 */
function showAppSidebar() {
  showSidebar_();
}

function showSidebar_() {
  if (isOrganizationConfigured()) {
    ensureWorkspaceSheets();
  }

  const bootstrap = getSidebarBootstrap_();
  const template = HtmlService.createTemplateFromFile('ui/Sidebar');
  template.bootstrapJson = JSON.stringify(bootstrap);

  const html = template.evaluate().setTitle(getAppConfig().name);
  SpreadsheetApp.getUi().showSidebar(html);
}

/**
 * @returns {object}
 */
function getSidebarBootstrap() {
  return getSidebarBootstrap_();
}

/**
 * @returns {object}
 */
function refreshSidebarContext() {
  return getSidebarBootstrap_();
}

/**
 * @returns {object}
 */
function getSidebarBootstrap_() {
  const activeSheetName = getActiveSheetName();
  const isSetupComplete = isOrganizationConfigured();

  if (!isSetupComplete) {
    return {
      app: getAppConfig(),
      isSetupComplete: false,
      page: getSetupViewId(),
      activeSheetName: activeSheetName,
      module: null,
      recordCount: 0,
      formFields: [],
      utilityLabels: getUtilityLabels_()
    };
  }

  const module = getModuleBySheetName(activeSheetName);

  if (!module) {
    return {
      app: getAppConfig(),
      isSetupComplete: true,
      page: 'unsupported',
      activeSheetName: activeSheetName,
      module: null,
      recordCount: 0,
      formFields: [],
      utilityLabels: getUtilityLabels_()
    };
  }

  if (module.id === 'settings') {
    return {
      app: getAppConfig(),
      isSetupComplete: true,
      page: 'dashboard',
      activeSheetName: activeSheetName,
      module: module,
      recordCount: 0,
      formFields: [],
      utilityLabels: [],
      isSettingsModule: true,
      selection: null
    };
  }

  const selection = getModuleSelectionContext(module.id);

  return {
    app: getAppConfig(),
    isSetupComplete: true,
    page: selection.page,
    activeSheetName: activeSheetName,
    module: module,
    recordCount: getModuleRecordCount(module.id),
    formFields: getFormFieldsForModule(module.id),
    utilityLabels: getUtilityLabels_(module),
    isSettingsModule: false,
    selection: selection
  };
}

/**
 * @param {object=} module
 * @returns {Array<{ id: string, label: string }>}
 */
function getUtilityLabels_(module) {
  if (!module || !module.utilities) {
    return [
      { id: 'search', label: 'Search' },
      { id: 'filters', label: 'Filters' },
      { id: 'import', label: 'Import' },
      { id: 'export', label: 'Export' }
    ];
  }

  const labels = {
    search: 'Search',
    filters: 'Filters',
    import: 'Import',
    export: 'Export'
  };

  return module.utilities.map((utilityId) => ({
    id: utilityId,
    label: labels[utilityId] || utilityId
  }));
}
