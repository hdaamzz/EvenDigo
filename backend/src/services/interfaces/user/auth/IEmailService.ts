export interface EmailOptions {
    to: string;
    subject: string;
    text: string;
    html?: string;
  }
  
  export interface IEmailService {
    sendEmail(options: EmailOptions): Promise<void>;
    sendOTPEmail(email: string, name: string, otp: string): Promise<void>;
    sendPasswordResetEmail(email: string, name: string, resetToken: string): Promise<void>;
  }