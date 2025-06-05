import bcryptjs from 'bcryptjs';
import nodemailer from 'nodemailer';
import fs from 'fs';
import multer from 'multer';
import cloudinary from '../../src/configs/cloudinary';
import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcryptjs.genSalt(10);
  return bcryptjs.hash(password, salt);
};

export const reHash = async (checking: string, current: string): Promise<boolean> => {
  return bcryptjs.compare(checking, current);
};

export const sendEmail = async ({ to, subject, text }: {
  to: string;
  subject: string;
  text: string;
}): Promise<void> => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  console.log(to, subject, text);

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    text,
  });
};

const uploadDir = 'src/uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!') as any, false);
    }
  },
});


export const uploadToCloudinary = async (filePath: string) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'events',
    });
    fs.unlinkSync(filePath); 
    return result;
  } catch (error) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw error;
  }
};


export const generateSecureCloudinaryUrl = (
  publicId: string, 
  expirationHours: number = 1
): string => {
  const expirationTime = Math.round(Date.now() / 1000) + (expirationHours * 3600);
  
  return cloudinary.url(publicId, {
    sign_url: true,
    expires_at: expirationTime,
    secure: true,
    type: 'upload' 
  });
};


export const uploadToCloudinaryPrivate = async (filePath: string) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'events',
      type: 'private', 
      resource_type: 'auto'
    });
    fs.unlinkSync(filePath); 
    return result;
  } catch (error) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw error;
  }
};


export const generateSecurePrivateUrl = (
  publicId: string, 
  expirationHours: number = 1
): string => {
  const expirationTime = Math.round(Date.now() / 1000) + (expirationHours * 3600);
  
  return cloudinary.url(publicId, {
    type: 'private',
    sign_url: true,
    expires_at: expirationTime,
    secure: true
  });
};


export function generateUniqueId(): string {
  return uuidv4();
}


export async function generateAndUploadQrCode(data: string): Promise<string> {
  try {
    const qrCodeBuffer = await QRCode.toBuffer(data, {
      errorCorrectionLevel: 'H',
      type: 'png',
      margin: 1,
      scale: 8,
    });

    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'qr_codes', resource_type: 'image' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(qrCodeBuffer);
    });

    return result.secure_url; 
  } catch (error) {
    throw new Error(`Failed to generate and upload QR code: ${(error as Error).message}`);
  }
}


export async function generateAndUploadSecureQrCode(data: string): Promise<{
  publicId: string;
  secureUrl: string;
}> {
  try {
    const qrCodeBuffer = await QRCode.toBuffer(data, {
      errorCorrectionLevel: 'H',
      type: 'png',
      margin: 1,
      scale: 8,
    });

    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          folder: 'qr_codes', 
          resource_type: 'image',
          type: 'private' 
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(qrCodeBuffer);
    });

    
    const secureUrl = generateSecurePrivateUrl(result.public_id, 24);

    return {
      publicId: result.public_id,
      secureUrl
    };
  } catch (error) {
    throw new Error(`Failed to generate and upload secure QR code: ${(error as Error).message}`);
  }
}


export async function generateQrCode(data: string): Promise<string> {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: 1,
      scale: 8,
    });
    return qrCodeDataUrl;
  } catch (error) {
    throw new Error(`Failed to generate QR code: ${(error as Error).message}`);
  }
}

export function generateRandomId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 30; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars[randomIndex];
  }
  return result;
}