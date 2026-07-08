function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu(getAppConfig().name)
    .addItem('Open Sidebar', 'openSidebar')
    .addToUi();
}

function openSidebar() {
  showAppSidebar();
}

