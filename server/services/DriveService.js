const SUPPORTED_IMAGE_MIME_TYPES = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp'
};

const ARTWORK_FOLDER_NAME = 'Artwork';

/**
 * @returns {GoogleAppsScript.Drive.Folder}
 */
function getOrCreateArtworkFolder() {
  const settings = getSheetSettings();

  if (settings.artworkFolderId) {
    try {
      return DriveApp.getFolderById(settings.artworkFolderId);
    } catch (error) {
      console.warn('Stored artwork folder missing, recreating.', error);
    }
  }

  const folders = DriveApp.getFoldersByName(ARTWORK_FOLDER_NAME);
  const folder = folders.hasNext()
    ? folders.next()
    : DriveApp.createFolder(ARTWORK_FOLDER_NAME);

  saveSheetSettings({
    artworkFolderId: folder.getId(),
    artworkFolderName: folder.getName(),
    artworkFolderUrl: folder.getUrl()
  });

  return folder;
}

/**
 * @param {string} artworkTitle
 * @param {string} artworkId
 * @param {string} parentFolderId
 * @returns {GoogleAppsScript.Drive.Folder}
 */
function createArtworkSubfolder(artworkTitle, artworkId, parentFolderId) {
  const slug = slugifyFileName(artworkTitle);
  const folderName = slug + '-' + artworkId;
  const parentFolder = DriveApp.getFolderById(parentFolderId);
  const existingFolders = parentFolder.getFoldersByName(folderName);

  if (existingFolders.hasNext()) {
    return existingFolders.next();
  }

  return parentFolder.createFolder(folderName);
}

/**
 * @param {Array<object>} files
 * @param {string} artworkTitle
 * @param {string} artworkId
 * @param {string} storageMode
 * @returns {object}
 */
function uploadArtworkImages(files, artworkTitle, artworkId, storageMode) {
  if (!files || !files.length) {
    return {
      files: [],
      folder: null
    };
  }

  const mainFolder = getOrCreateArtworkFolder();
  let targetFolder = mainFolder;
  let folderMeta = null;

  if (storageMode === 'artwork-subfolder') {
    targetFolder = createArtworkSubfolder(artworkTitle, artworkId, mainFolder.getId());
    folderMeta = {
      id: targetFolder.getId(),
      name: targetFolder.getName(),
      url: targetFolder.getUrl()
    };
  }

  const slug = slugifyFileName(artworkTitle);
  const uploadedFiles = files.map((file, index) => {
    return uploadArtworkImageFile_(targetFolder, file, slug, artworkId, index + 1);
  });

  return {
    files: uploadedFiles,
    folder: folderMeta
  };
}

/**
 * @param {GoogleAppsScript.Drive.Folder} folder
 * @param {object} file
 * @param {string} slug
 * @param {string} artworkId
 * @param {number} imageNumber
 * @returns {{ id: string, name: string, url: string }}
 */
function uploadArtworkImageFile_(folder, file, slug, artworkId, imageNumber) {
  const extension = getImageExtension_(file);
  const fileName = slug + '-' + artworkId + '-' + imageNumber + extension;
  const blob = Utilities.newBlob(
    Utilities.base64Decode(file.data),
    file.mimeType,
    fileName
  );
  const driveFile = folder.createFile(blob);

  return {
    id: driveFile.getId(),
    name: driveFile.getName(),
    url: driveFile.getUrl()
  };
}

/**
 * @param {object} file
 * @returns {string}
 */
function getImageExtension_(file) {
  if (file.fileName && file.fileName.indexOf('.') !== -1) {
    const ext = file.fileName.slice(file.fileName.lastIndexOf('.')).toLowerCase();

    if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].indexOf(ext) !== -1) {
      return ext === '.jpeg' ? '.jpg' : ext;
    }
  }

  return SUPPORTED_IMAGE_MIME_TYPES[file.mimeType] || '.jpg';
}

/**
 * @param {object} file
 */
function validateImageFile_(file) {
  if (!file || !file.data) {
    throw new Error('Image file data is missing.');
  }

  if (!SUPPORTED_IMAGE_MIME_TYPES[file.mimeType]) {
    throw new Error('Unsupported image type. Use JPG, PNG, GIF, or WebP.');
  }
}
