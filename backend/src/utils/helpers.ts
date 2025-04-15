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

/**
 * @param filePath 
 * @returns 
 */
export const uploadToCloudinary = async (filePath: string) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'events',
    });
    fs.unlinkSync(filePath); // Clean up temp file
    return result;
  } catch (error) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw error;
  }
};

/**
 * @returns UUID string
 */
export function generateUniqueId(): string {
  return uuidv4();
}

/**
 * @param data 
 * @returns 
 */
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

/**
 * @param data
 * @returns 
 */
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


// private async sendBookingConfirmationEmail(userId: string, bookingId: string): Promise<void> {
//   // Get user details with email
//   const user = await this.userRepository.findById(userId); // You'll need to inject userRepository
  
//   if (!user || !user.email) {
//     console.error(`Cannot send confirmation email: User ${userId} not found or missing email`);
//     return;
//   }
  
//   // Get booking details
//   const booking = await this.bookingRepository.findByBookingId(bookingId);
  
//   if (!booking) {
//     console.error(`Cannot send confirmation email: Booking ${bookingId} not found`);
//     return;
//   }
  
  // Send email with a email service - you'll need to implement or use a library
  // await this.emailService.sendTemplate('booking-confirmation', user.email, {
  //   userName: user.name,
  //   bookingId: booking.bookingId,
  //   eventName: booking.eventName, // You might need to fetch event details
  //   ticketDetails: booking.tickets,
  //   totalAmount: booking.totalAmount
  // });
// }