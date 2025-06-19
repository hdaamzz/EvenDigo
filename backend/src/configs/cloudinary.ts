import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true 
});

export const generateSecureUrl = (publicId: string, options: any = {}) => {
  const defaultOptions = {
    secure: true,
    sign_url: true,
    type: 'authenticated', 
    expires_at: Math.floor(Date.now() / 1000) + (60 * 60 * 24), 
    ...options
  };
  
  return cloudinary.url(publicId, defaultOptions);
};

export default cloudinary;