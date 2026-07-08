const ORGANIZATION_REQUIRED_FIELDS = ['artistName'];

const SETUP_KEYS = [
  'artistName',
  'websiteUrl',
  'cloudinaryCloudName',
  'cloudinaryUploadPreset',
  'deployHookUrl'
];

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

  return SETUP_KEYS.reduce((settings, key) => {
    settings[key] = props.getProperty(key) || '';
    return settings;
  }, {});
}

function saveSetup(settings) {
  const props = PropertiesService.getDocumentProperties();

  SETUP_KEYS.forEach((key) => {
    props.setProperty(key, String(settings[key] || '').trim());
  });

  if (isOrganizationConfigured()) {
    ensureWorkspaceSheets();
  }

  return { message: 'Setup saved.' };
}
