const SETTINGS_SHEET_KEYS = {
  'Artist Name': 'artistName',
  'Website URL': 'websiteUrl',
  'Cloudinary Cloud Name': 'cloudinaryCloudName',
  'Cloudinary Upload Preset': 'cloudinaryUploadPreset',
  'Deploy Hook URL': 'deployHookUrl',
  'Artwork Folder ID': 'artworkFolderId',
  'Artwork Folder Name': 'artworkFolderName',
  'Artwork Folder URL': 'artworkFolderUrl',
  'Default Image Storage': 'imageStorageMode'
};

/**
 * @returns {GoogleAppsScript.Spreadsheet.Sheet}
 */
function getSettingsSheet_() {
  return ensureSheetWithHeaders_(
    getSheetNames().SETTINGS,
    getSheetHeaders(getSheetNames().SETTINGS)
  );
}

/**
 * @returns {object}
 */
function getSheetSettings() {
  const sheet = getSettingsSheet_();
  const headers = getSheetHeaderRow_(sheet);
  const values =
    sheet.getLastRow() >= 2
      ? sheet.getRange(2, 1, 1, headers.length).getValues()[0]
      : headers.map(() => '');

  const settings = {};

  headers.forEach((header, index) => {
    const key = SETTINGS_SHEET_KEYS[header];

    if (key) {
      settings[key] = values[index] || '';
    }
  });

  return settings;
}

/**
 * @param {object} partialSettings
 */
function saveSheetSettings(partialSettings) {
  const sheet = getSettingsSheet_();
  const headers = getSheetHeaderRow_(sheet);
  const current = getSheetSettings();
  const merged = Object.assign({}, current, partialSettings);

  const rowValues = headers.map((header) => {
    const key = SETTINGS_SHEET_KEYS[header];
    return key ? merged[key] || '' : '';
  });

  if (sheet.getLastRow() < 2) {
    sheet.appendRow(rowValues);
  } else {
    sheet.getRange(2, 1, 1, headers.length).setValues([rowValues]);
  }
}

/**
 * @param {object} setup
 */
function syncSetupToSettingsSheet_(setup) {
  saveSheetSettings({
    artistName: setup.artistName,
    websiteUrl: setup.websiteUrl,
    cloudinaryCloudName: setup.cloudinaryCloudName,
    cloudinaryUploadPreset: setup.cloudinaryUploadPreset,
    deployHookUrl: setup.deployHookUrl,
    imageStorageMode: setup.imageStorageMode
  });
}
