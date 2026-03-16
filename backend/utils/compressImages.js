const sharp = require('sharp')
const fs = require('fs')

const MAX_SIZE_BYTES = 1 * 1024 * 1024 // 1MB
const MAX_WIDTH = 1920
const JPEG_QUALITY = 72
const PNG_COMPRESSION = 9

/**
 * Compress an image file on disk if it's over 1MB.
 * Only compresses image/* types. Overwrites the file in place.
 * @param {Object} file - Multer file object { path, mimetype, size }
 * @returns {Promise<void>}
 */
async function compressImageFile(file) {
  if (!file || !file.path) return
  if (!file.mimetype || !file.mimetype.startsWith('image/')) return
  if (file.size <= MAX_SIZE_BYTES) return

  try {
    const inputBuffer = fs.readFileSync(file.path)
    const isJpeg = file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg'
    const isPng = file.mimetype === 'image/png'
    const isWebp = file.mimetype === 'image/webp'

    let outputBuffer
    const pipeline = sharp(inputBuffer).resize(MAX_WIDTH, null, { withoutEnlargement: true })

    if (isJpeg) {
      outputBuffer = await pipeline.jpeg({ quality: JPEG_QUALITY }).toBuffer()
    } else if (isPng) {
      outputBuffer = await pipeline.png({ compressionLevel: PNG_COMPRESSION }).toBuffer()
    } else if (isWebp) {
      outputBuffer = await pipeline.webp({ quality: JPEG_QUALITY }).toBuffer()
    } else {
      outputBuffer = await pipeline.jpeg({ quality: JPEG_QUALITY }).toBuffer()
    }

    if (outputBuffer && outputBuffer.length < inputBuffer.length) {
      fs.writeFileSync(file.path, outputBuffer)
    }
  } catch (err) {
    console.error('Image compression skipped for', file.path, err.message)
  }
}

/**
 * Express middleware: compress any uploaded image files > 1MB.
 * Call after multer. Works with req.file or req.files (array or object with document/profilePicture).
 */
async function compressUploadedImages(req, res, next) {
  try {
    let files = []
    if (req.file) files = [req.file]
    else if (req.files) {
      if (Array.isArray(req.files)) files = req.files
      else {
        if (req.files.document) files = files.concat(req.files.document)
        if (req.files.profilePicture) files = files.concat(req.files.profilePicture)
      }
    }
    if (files.length > 0) {
      for (const file of files) {
        await compressImageFile(file)
      }
    }
    next()
  } catch (err) {
    console.error('compressUploadedImages middleware error:', err)
    next()
  }
}

module.exports = { compressImageFile, compressUploadedImages }
