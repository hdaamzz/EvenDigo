import { inject, injectable } from 'tsyringe';
import { IAuthResponse, ILogin } from '../../../models/interfaces/auth.interface';
import { reHash } from '../../../utils/helpers';
import { IAuthAdminService } from '../../../services/interfaces/IAuth.admin.service';
import { IUserRepository } from '../../../repositories/interfaces/IUser.repository';
import { ITokenService } from '../../../services/interfaces/user/auth/ITokenService';

@injectable()
export class AdminAuthService implements IAuthAdminService {
  constructor(
    @inject('UserRepository') private userRepository: IUserRepository,
    @inject('TokenService') private tokenService: ITokenService
  ) {}

  async login(credentials: ILogin): Promise<IAuthResponse> {
    const user = await this.userRepository.findUserByEmail(credentials.email);
    if (!user) {
      return {
        success: false,
        message: 'Invalid email or password',
      };
    }

    if (!user.password) {
      throw new Error('Password is undefined');
    }

    const isPasswordMatch = await reHash(credentials.password, user.password);
    if (!isPasswordMatch) {
      return {
        success: false,
        message: 'Invalid email or password',
      };
    }

    if (user.role !== 'admin') {
      return {
        success: false,
        message: 'You are not an authorized person',
      };
    }

    if (!user._id) {
      throw new Error('User ID is undefined');
    }

    await this.userRepository.updateUserLastLogin(user._id);

    const accessToken = this.tokenService.generateToken(user);
    const refreshToken = this.tokenService.generateRefreshToken(user);

    const userResponse = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    return {
      success: true,
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: userResponse,
    };
  }
}