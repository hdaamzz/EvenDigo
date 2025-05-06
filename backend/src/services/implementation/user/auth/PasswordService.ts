import { ServiceResponse } from '../../../../../src/models/interfaces/auth.interface';
import { IAuthRepository } from '../../../../../src/repositories/interfaces/IAuth.repository';
import { IUserRepository } from '../../../../../src/repositories/interfaces/IUser.repository';
import { IPasswordService } from '../../../../../src/services/interfaces/user/auth/IPasswordService';
import { hashPassword, reHash } from '../../../../../src/utils/helpers';
import { inject, injectable } from 'tsyringe';


@injectable()
export class PasswordService implements IPasswordService {
  constructor(
    @inject("AuthRepository") private authRepository: IAuthRepository,
    @inject("UserRepository") private userRepository: IUserRepository
  ) {}

  async hashPassword(password: string): Promise<string> {
    return hashPassword(password);
  }

  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return reHash(plainPassword, hashedPassword);
  }

  async storeResetToken(email: string, token: string): Promise<void> {
    await this.authRepository.storeResetToken(email, token);
  }

  async verifyResetToken(email: string, token: string): Promise<boolean> {
    const storedToken = await this.authRepository.getResetToken(email);
    return storedToken === token;
  }

  async deleteResetToken(email: string): Promise<void> {
    await this.authRepository.deleteResetToken(email);
  }

  async resetPassword(email: string, token: string, newPassword: string): Promise<ServiceResponse<null>> {
    try {
      const isValidToken = await this.verifyResetToken(email, token);
      if (!isValidToken) {
        return {
          success: false,
          message: "Invalid or expired reset token"
        };
      }
      
      const user = await this.userRepository.findUserByEmail(email);
      if (!user || !user._id) {
        return {
          success: false,
          message: "User not found"
        };
      }
      
      const hashedPassword = await this.hashPassword(newPassword);
      
      await this.userRepository.updateUser(user._id.toString(), { password: hashedPassword });
      
      await this.deleteResetToken(email);
      
      return {
        success: true,
        message: "Password reset successful"
      };
    } catch (error) {
      console.error("Reset password error:", error);
      return {
        success: false,
        message: "Failed to reset password"
      };
    }
  }
}