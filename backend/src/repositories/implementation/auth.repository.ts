import Redis from 'ioredis';
import { IUser, IOtpData } from '../../models/interfaces/auth.interface';
import { IAuthRepository } from '../interfaces/IAuth.repository';
import { injectable } from 'tsyringe';


@injectable()
export class AuthRepository implements IAuthRepository {
  private redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379')
    });
  }

  async storeOTPData(email: string, otp: string, userData: IUser): Promise<void> {
    const otpData: IOtpData = { email, otp, userData };
    // Store OTP data with 3 minutes expiration
    await this.redis.setex(`otp:${email}`, 300, JSON.stringify(otpData));
    
    
  }

  async getOTPData(email: string): Promise<IOtpData | null> {
    const data = await this.redis.get(`otp:${email}`);
    
    return data ? JSON.parse(data) : null;
  }

  async deleteOTPData(email: string): Promise<void> {
    await this.redis.del(`otp:${email}`);
  }

  async storeResetToken(email: string, token: string): Promise<void> {
    // Store reset token with 10 minutes expiration
    await this.redis.setex(`reset:${email}`, 600, token);
  }
  
  async getResetToken(email: string): Promise<string | null> {
    return await this.redis.get(`reset:${email}`);
  }
  
  async deleteResetToken(email: string): Promise<void> {
    await this.redis.del(`reset:${email}`);
  }
  
}