const ARTWORK_SHEET_NAME = 'Artwork';
const ARTWORK_HEADERS = [
  'Title',
  'Medium',
  'Dimensions',
  'Price',
  'Status',
  'Description',
  'Image URL'
];

function saveArtwork(artwork) {
  const sheet = getArtworkSheet_();
  sheet.appendRow([
    artwork.title || '',
    artwork.medium || '',
    artwork.dimensions || '',
    artwork.price || '',
    artwork.status || '',
    artwork.description || '',
    artwork.imageUrl || ''
  ]);

  triggerDeployHook_();

  return { message: 'Artwork saved.' };
}

function getArtworkSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(ARTWORK_SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(ARTWORK_SHEET_NAME);
    sheet.appendRow(ARTWORK_HEADERS);
    sheet.getRange(1, 1, 1, ARTWORK_HEADERS.length).setFontWeight('bold');
  }

  return sheet;
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
