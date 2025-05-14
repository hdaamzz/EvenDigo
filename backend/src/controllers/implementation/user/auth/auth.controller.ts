import { Request, Response } from 'express';
import { ILogin } from '../../../../models/interfaces/auth.interface';
import { IUser } from '../../../../models/interfaces/auth.interface';
import { inject, injectable } from 'tsyringe';
import StatusCode from '../../../../types/statuscode';
import { IAuthController } from '../../../../../src/controllers/interfaces/User/Auth/IAuth.controller';
import { IAuthService } from '../../../../../src/services/interfaces/IAuth.service';

interface AuthenticatedRequest extends Request {
  user?: IUser;
}

@injectable()
export class AuthController implements IAuthController {
  constructor(
    @inject("AuthService") private authService: IAuthService
  ) {}

  async sendOTP(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: 'Name, email, and password are required'
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
        message: 'Failed to send OTP'
      });
    }
  }

  async verifyOTP(req: Request, res: Response): Promise<void> {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: 'Email and OTP are required'
        });
        return;
      }

      const result = await this.authService.verifyOTP(email, otp);

      res.status(result.success ? StatusCode.OK : StatusCode.BAD_REQUEST).json(result);
    } catch (error) {
      console.error('Verify OTP error:', error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to verify OTP'
      });
    }
  }

  async verifyUser(req: Request, res: Response): Promise<void> {
    try {
      const loginData: ILogin = req.body;
      
      if (!loginData.email || !loginData.password) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: 'Email and password are required'
        });
        return;
      }

      const result = await this.authService.login(loginData);
      
      if (!result.success) {
        res.status(StatusCode.UNAUTHORIZED).json(result);
        return;
      }

      const token = result.token;

      if (!token) {
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: 'Token generation failed'
        });
        return;
      }
      

      res.cookie('session', token, {
        httpOnly: true,
        secure: true, 
        sameSite: 'none', 
        maxAge: 24 * 60 * 60 * 1000,
        domain: process.env.NODE_ENV === 'production' ? '' : 'localhost'
      });
      
      res.status(StatusCode.OK).json(result);
    } catch (error) {
      console.error('Login error:', error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async sendForgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      
      if (!email) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: 'Email is required'
        });
        return;
      }
      
      const result = await this.authService.sendForgotPasswordEmail(email);
      
      res.status(result.success ? StatusCode.OK : StatusCode.BAD_REQUEST).json(result);
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email, token, newPassword } = req.body;
      
      if (!email || !token || !newPassword) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: 'Email, token, and new password are required'
        });
        return;
      }
      
      const result = await this.authService.resetPassword(email, token, newPassword);
      
      res.status(result.success ? StatusCode.OK : StatusCode.BAD_REQUEST).json(result);
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async isAuthenticated(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(StatusCode.UNAUTHORIZED).json({
          isAuthenticated: false,
          message: 'User not authenticated'
        });
        return;
      }

      const currentUser = await this.authService.findUserByEmail(req.user.email);
      
      if (!currentUser) {
        res.status(StatusCode.UNAUTHORIZED).json({
          isAuthenticated: false,
          message: 'User not found'
        });
        return;
      }

      res.status(StatusCode.OK).json({
        isAuthenticated: true,
        user: {
          id: currentUser._id,
          email: currentUser.email,
          name: currentUser.name,
          profileImg: currentUser.profileImg,
          role: currentUser.role,
          status: currentUser.status
        },
        token: req.cookies.session,
        role: currentUser.role
      });
    } catch (error) {
      console.error('Auth check error:', error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Authentication check failed. Please try again later.'
      });
    }
  }

  async firebaseSignIn(req: Request, res: Response): Promise<void> {
    try {
      const { idToken, name, profileImg } = req.body;

      if (!idToken) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: 'ID token is required'
        });
        return;
      }

      const result = await this.authService.verifyFirebaseToken(idToken, name || 'User', profileImg);

      if (!result.success || !result.token || !result.user) {
        res.status(StatusCode.UNAUTHORIZED).json(result);
        return;
      }

      res.cookie('session', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000,
        domain: process.env.NODE_ENV === 'production' ? process.env.COOKIE_DOMAIN : undefined
      });

      res.status(StatusCode.OK).json({
        success: true,
        message: 'Authentication successful',
        user: result.user
      });
    } catch (error) {
      console.error('Firebase authentication error:', error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Authentication failed. Please try again later.'
      });
    }
  }

  logout(_req: Request, res: Response): void {
    try {
      res.clearCookie('session', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        domain: process.env.NODE_ENV === 'production' ? process.env.COOKIE_DOMAIN : undefined
      });
      
      res.status(StatusCode.OK).json({ 
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to logout'
      });
    }
  }
}