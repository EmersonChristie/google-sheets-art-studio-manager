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
