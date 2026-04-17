import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryResponse } from 'cloudinary';

// Configure Cloudinary from environment variable
// CLOUDINARY_URL format: cloudinary://<api_key>:<api_secret>@<cloud_name>
if (process.env.CLOUDINARY_URL) {
  cloudinary.config(process.env.CLOUDINARY_URL);
} else {
  // Fallback to individual env vars if needed
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export const uploadToCloudinary = async (fileBuffer, filename, mimeType, folder = 'medicore/uploads') => {
  try {
    const uniqueFilename = `${Date.now()}-${filename.replace(/\s+/g, '_')}`;
    const fullPath = `${folder}/${uniqueFilename}`;

    const result = await cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto', // Automatically detect image/video/raw
        folder: folder,
        filename: uniqueFilename,
        format: mimeType.split('/')[1] || null,
      },
      (error, result) => {
        if (error) throw error;
      }
    );

    // The stream version doesn't return directly, so we use promise version
    // Actually let's use the buffer upload method
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

// Better: Use upload method with buffer
export const uploadFileToCloudinary = async (fileBuffer, filename, mimeType, folder = 'medicore/uploads') => {
  try {
    const uniqueFilename = `${Date.now()}-${filename.replace(/\s+/g, '_')}`;
    const fullPath = `${folder}/${uniqueFilename}`;

    const result = await cloudinary.uploader.upload(
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
