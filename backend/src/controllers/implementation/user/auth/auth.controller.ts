import { Request, Response } from 'express';
import { ILogin } from '../../../../models/interfaces/auth.interface';
import { IUser } from '../../../../models/interfaces/auth.interface';
import { inject, injectable } from 'tsyringe';
import StatusCode from '../../../../types/statuscode';
import { IAuthController } from '../../../../../src/controllers/interfaces/User/Auth/IAuth.controller';
import { IAuthService } from '../../../../../src/services/interfaces/IAuth.service';
import { cookieConfig } from '../../../../../src/configs/cookie.config';

export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

@injectable()
export class AuthController implements IAuthController {
  constructor(
    @inject('AuthService') private authService: IAuthService
  ) {}

  async sendOTP(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: 'Name, email, and password are required',
        });
        return;
      }

      const result = await this.authService.sendOTP({
        name,
        email,
        password,
      });

      res.status(result.success ? StatusCode.OK : StatusCode.BAD_REQUEST).json(result);
    } catch (error) {
      console.error('Send OTP error:', error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to send OTP',
      });
    }
  }

  async verifyOTP(req: Request, res: Response): Promise<void> {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: 'Email and OTP are required',
        });
        return;
      }

      const result = await this.authService.verifyOTP(email, otp);

      res.status(result.success ? StatusCode.OK : StatusCode.BAD_REQUEST).json(result);
    } catch (error) {
      console.error('Verify OTP error:', error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to verify OTP',
      });
    }
  }

  async verifyUser(req: Request, res: Response): Promise<void> {
    try {
      const loginData: ILogin = req.body;

      if (!loginData.email || !loginData.password) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: 'Email and password are required',
        });
        return;
      }

      const result = await this.authService.login(loginData);
      console.log('Login result:', result);

      if (!result.success || !result.accessToken || !result.refreshToken || !result.user) {
        res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: result.message || 'Authentication failed',
        });
        return;
      }

      const cookieOptions = cookieConfig.getLoginCookieOptions();

      res.cookie('accessToken', result.accessToken, cookieOptions.accessToken);
      res.cookie('refreshToken', result.refreshToken, cookieOptions.refreshToken);

      res.status(StatusCode.OK).json({
        success: true,
        message: 'Login successful',
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          role: result.user.role,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  async sendForgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: 'Email is required',
        });
        return;
      }

      const result = await this.authService.sendForgotPasswordEmail(email);

      res.status(result.success ? StatusCode.OK : StatusCode.BAD_REQUEST).json(result);
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email, token, newPassword } = req.body;

      if (!email || !token || !newPassword) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: 'Email, token, and new password are required',
        });
        return;
      }

      const result = await this.authService.resetPassword(email, token, newPassword);

      res.status(result.success ? StatusCode.OK : StatusCode.BAD_REQUEST).json(result);
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  async isAuthenticated(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(StatusCode.UNAUTHORIZED).json({
          isAuthenticated: false,
          message: 'User not authenticated',
        });
        return;
      }

      // Since the middleware already verified the user and refreshed tokens if needed,
      // we can directly return the user info
      const currentUser = req.user;
      const token = req.cookies.accessToken;
      
      res.status(StatusCode.OK).json({
        isAuthenticated: true,
        user: {
          id: currentUser._id,
          email: currentUser.email,
          name: currentUser.name,
          profileImg: currentUser.profileImg,
          role: currentUser.role,
          status: currentUser.status,
        },
        token: token
      });
    } catch (error) {
      console.error('Auth check error:', error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Authentication check failed. Please try again later.',
      });
    }
  }

  async firebaseSignIn(req: Request, res: Response): Promise<void> {
    try {
      const { idToken, name, profileImg } = req.body;

      if (!idToken) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: 'ID token is required',
        });
        return;
      }

      const result = await this.authService.verifyFirebaseToken(idToken, name || 'User', profileImg);

      if (!result.success || !result.accessToken || !result.refreshToken || !result.user) {
        res.status(StatusCode.UNAUTHORIZED).json(result);
        return;
      }

      const cookieOptions = cookieConfig.getTokenCookieOptions();

      res.cookie('accessToken', result.accessToken, cookieOptions.accessToken);
      res.cookie('refreshToken', result.refreshToken, cookieOptions.refreshToken);

      res.status(StatusCode.OK).json({
        success: true,
        message: 'Authentication successful',
        user: {
          id: result.user._id,
          email: result.user.email,
          name: result.user.name,
          role: result.user.role
        },
      });
    } catch (error) {
      console.error('Firebase authentication error:', error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Authentication failed. Please try again later.',
      });
    }
  }

  // Remove the manual refresh token endpoint as it's now handled by middleware
  // async refreshToken(req: Request, res: Response): Promise<void> { ... }

  logout(_req: Request, res: Response): void {
    try {
      const clearOptions = cookieConfig.getClearCookieOptions();

      res.clearCookie('accessToken', clearOptions);
      res.clearCookie('refreshToken', clearOptions);

      res.status(StatusCode.OK).json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to logout',
      });
    }
  }
}