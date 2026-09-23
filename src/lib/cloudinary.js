import { v2 as cloudinary } from 'cloudinary';

export function isCloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET &&
    process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloudinary_cloud_name'
  );
}

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

/**
 * Uploads an image (base64 string or data URI) to Cloudinary
 * @param {string} fileUri - Data URI e.g. "data:image/jpeg;base64,..."
 * @param {string} folder - Destination folder in Cloudinary
 * @returns {Promise<{ url: string, publicId: string }>}
 */
export async function uploadToCloudinary(fileUri, folder = 'electricity_meter_readings') {
  if (!isCloudinaryConfigured()) {
    console.warn('Cloudinary is not configured. Photo upload skipped.');
    return {
      url: null,
      publicId: null,
      message: 'Cloudinary credentials missing in .env.local',
    };
  }

  const result = await cloudinary.uploader.upload(fileUri, {
    folder,
    resource_type: 'image',
    transformation: [
      { quality: 'auto', fetch_format: 'auto' },
      { width: 1600, crop: 'limit' } // optimise size for fast mobile viewing
    ],
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}
