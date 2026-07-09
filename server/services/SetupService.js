const ORGANIZATION_REQUIRED_FIELDS = ['artistName'];

const SETUP_KEYS = [
  'artistName',
  'websiteUrl',
  'cloudinaryCloudName',
  'cloudinaryUploadPreset',
  'deployHookUrl',
  'imageStorageMode'
];

const DEFAULT_IMAGE_STORAGE_MODE = 'default-folder';

/**
 * @returns {boolean}
 */
function isOrganizationConfigured() {
  const setup = getSetup();

  return ORGANIZATION_REQUIRED_FIELDS.every((key) =>
    isNonEmptyString(setup[key])
  );
}

function getSetup() {
  const props = PropertiesService.getDocumentProperties();
  const settings = SETUP_KEYS.reduce((acc, key) => {
    acc[key] = props.getProperty(key) || '';
    return acc;
  }, {});

  if (!settings.imageStorageMode) {
    settings.imageStorageMode = DEFAULT_IMAGE_STORAGE_MODE;
  }

  return settings;
}

function saveSetup(settings) {
  const props = PropertiesService.getDocumentProperties();
  const normalized = Object.assign({}, settings);

  if (!normalized.imageStorageMode) {
    normalized.imageStorageMode = DEFAULT_IMAGE_STORAGE_MODE;
  }

  SETUP_KEYS.forEach((key) => {
    props.setProperty(key, String(normalized[key] || '').trim());
  });

  if (isOrganizationConfigured()) {
    provisionWorkspaceOnSetup_();
    syncSetupToSettingsSheet_(normalized);
    getOrCreateArtworkFolder();
  }

  return { message: 'Setup saved.' };
}
