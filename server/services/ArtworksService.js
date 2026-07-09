/**
 * @param {object} formData
 * @returns {{ message: string, id: string }}
 */
function saveArtworkRecord(formData) {
  const title = String(formData.title || '').trim();

  if (!title) {
    throw new Error('Title is required before saving artwork images.');
  }

  const sheet = getModuleSheet_('artworks');
  const artworkId = generateRecordId_('artworks', sheet);
  const storageMode = normalizeStorageMode_(formData.storageMode);
  const images = formData.images || [];

  images.forEach(validateImageFile_);

  const uploadResult =
    images.length > 0
      ? uploadArtworkImages(images, title, artworkId, storageMode)
      : { files: [], folder: null };

  const mainImageUrl = uploadResult.files[0] ? uploadResult.files[0].url : '';
  const secondaryImageUrls = uploadResult.files.slice(1).map((file) => file.url);
  const folderMeta = uploadResult.folder;

  const record = {
    id: artworkId,
    title: title,
    year: formData.year || '',
    medium: formData.medium || '',
    width: formData.width || '',
    height: formData.height || '',
    dimensions: formData.dimensions || '',
    status: formData.status || 'Available',
    price: formData.price || '',
    description: formData.description || '',
    notes: formData.notes || '',
    mainImage: mainImageUrl,
    secondaryImages: JSON.stringify(secondaryImageUrls),
    driveFolderUrl: folderMeta ? folderMeta.url : '',
    driveFolderId: folderMeta ? folderMeta.id : ''
  };

  sheet.appendRow(buildRecordRow_(sheet, 'artworks', record));
  triggerDeployHook_();

  return {
    message: 'Artwork saved.',
    id: artworkId
  };
}

/**
 * @param {string} storageMode
 * @returns {string}
 */
function normalizeStorageMode_(storageMode) {
  return storageMode === 'artwork-subfolder' ? 'artwork-subfolder' : 'default-folder';
}

/**
 * @param {object} artwork
 * @returns {{ message: string, id: string }}
 */
function saveArtwork(artwork) {
  return saveModuleRecord('artworks', artwork);
}

/**
 * @param {number} rowNumber
 * @param {object} artwork
 * @returns {{ message: string }}
 */
function updateArtwork(rowNumber, artwork) {
  return updateModuleRecord('artworks', rowNumber, artwork);
}
