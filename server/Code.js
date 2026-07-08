const APP_NAME = 'Artist Website';

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu(APP_NAME)
    .addItem('Open Sidebar', 'openSidebar')
    .addItem('Setup Wizard', 'openSetupWizard')
    .addItem('Add Artwork', 'openArtworkForm')
    .addToUi();
}

function openSidebar() {
  showSidebar_('setup');
}

function openSetupWizard() {
  showSidebar_('setup');
}

function openArtworkForm() {
  showSidebar_('artwork');
}

function showSidebar_(screen) {
  const template = HtmlService.createTemplateFromFile('ui/Sidebar');
  template.initialScreen = screen;

  const html = template.evaluate().setTitle(APP_NAME);
  SpreadsheetApp.getUi().showSidebar(html);
}