import { EmailOptions, IEmailService } from '../../../../services/interfaces/user/auth/IEmailService';
import { sendEmail } from '../../../../utils/helpers';
import { injectable } from 'tsyringe';


@injectable()
export class EmailService implements IEmailService {
  async sendEmail(options: EmailOptions): Promise<void> {
    await sendEmail(options);
  }

  async sendOTPEmail(email: string, name: string, otp: string): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: 'Registration OTP',
      text: `Hi ${name}, Your OTP for registration is: ${otp}`
    });
  }

  async sendPasswordResetEmail(email: string, name: string, resetToken: string): Promise<void> {
    const resetUrl = `${process.env.CLIENT_SERVER || 'http://localhost:4200'}/reset-password?email=${email}&token=${resetToken}`;
    
    await this.sendEmail({
      to: email,
      subject: 'Password Reset Request',
      text: `Hi ${name}, Your password reset link is: ${resetUrl}. This link will expire in 10 minutes.`
    });
  }
}
