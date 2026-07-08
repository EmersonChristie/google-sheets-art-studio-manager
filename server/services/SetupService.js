const SETUP_KEYS = [
  'artistName',
  'websiteUrl',
  'cloudinaryCloudName',
  'cloudinaryUploadPreset',
  'deployHookUrl'
];

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

  return { message: 'Setup saved.' };
}
