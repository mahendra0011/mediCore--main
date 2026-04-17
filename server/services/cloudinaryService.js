import cloudinary from 'cloudinary';

// Configure Cloudinary from environment variable
// CLOUDINARY_URL format: cloudinary://<api_key>:<api_secret>@<cloud_name>
try {
  if (process.env.CLOUDINARY_URL) {
    cloudinary.v2.config(process.env.CLOUDINARY_URL);
    console.log('Cloudinary configured via CLOUDINARY_URL');
  } else if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    cloudinary.v2.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    console.log('Cloudinary configured via individual env vars');
  } else {
    console.warn('Cloudinary not configured - no credentials found in environment');
  }
} catch (error) {
  console.error('Cloudinary configuration error:', error.message);
}

/**
 * Upload file to Cloudinary
 * @param {Buffer} fileBuffer - File content as buffer
 * @param {string} filename - Original filename
 * @param {string} mimeType - MIME type of the file
 * @param {string} folder - Cloudinary folder (default: 'medicore/uploads')
 * @returns {Promise<Object>} Upload result with url, publicId, etc.
 */
export const uploadFileToCloudinary = async (fileBuffer, filename, mimeType, folder = 'medicore/uploads') => {
  try {
    const uniqueFilename = `${Date.now()}-${filename.replace(/\s+/g, '_')}`;

    const result = await cloudinary.v2.uploader.upload(
      fileBuffer,
      {
        resource_type: mimeType.startsWith('image') ? 'image' : 'raw',
        folder: folder,
        public_id: uniqueFilename,
        format: mimeType.split('/')[1] || null,
        overwrite: false,
      }
    );

    return {
      id: result.public_id,
      url: result.secure_url,
      filename: filename,
      publicId: result.public_id,
      format: result.format,
      size: result.bytes,
      mimeType: mimeType,
      storedIn: 'cloudinary',
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

export default cloudinary;
