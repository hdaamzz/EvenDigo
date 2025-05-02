import { Request, Response } from 'express';
import { ILogin } from '../../../../models/interfaces/auth.interface';
import { IUser } from '../../../../models/interfaces/auth.interface';
import * as admin from 'firebase-admin';
import * as jwt from 'jsonwebtoken';
import { inject, injectable } from 'tsyringe';
import { AuthService } from '../../../../services/implementation/user/auth.service';
import StatusCode from '../../../../types/statuscode';
import { IAuthController } from '../../../../../src/controllers/interfaces/User/Auth/IAuth.controller';

interface AuthenticatedRequest extends Request {
  user?: IUser;
}

@injectable()
export class AuthController implements IAuthController {
  constructor(
    @inject("AuthService") private authService: AuthService
  ) {}

  async sendOTP(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password } = req.body;

      const result = await this.authService.sendOTP({
        name,
        email,
        password,
      });      
      res.status(StatusCode.OK).json(result);
    } catch (error) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to send OTP'
      });
    }
  }

  async verifyOTP(req: Request, res: Response): Promise<void> {
    try {
      const { email, otp } = req.body;


      const result = await this.authService.verifyOTP(email, otp);

      res.status(result.success ? StatusCode.OK : StatusCode.BAD_REQUEST).json(result);
    } catch (error) {
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
      
      const result = await this.authService.sendForgotPasswordEmail(email);
      
      if (result.success) {
        res.status(StatusCode.OK).json(result);
      } else {
        res.status(StatusCode.BAD_REQUEST).json(result);
      }
      
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
      
      const result = await this.authService.resetPassword(email, token, newPassword);
      
      if (result.success) {
        res.status(StatusCode.OK).json(result);
      } else {
        res.status(StatusCode.BAD_REQUEST).json(result);
      }
      
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }



  isAuthenticated = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {

        res.status(StatusCode.UNAUTHORIZED).json({
          isAuthenticated: false,
          message: 'User not authenticated'
        });
        return;
      }

      let currentUser = await this.authService.findUserByEmail(req.user.email);

      res.status(StatusCode.OK).json({
        isAuthenticated: true,
        user: req.user,
        token: req.cookies.session,
        role: currentUser?.role
      });
    } catch (error) {
      console.error('Auth check  error:', error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Authentication check failed. Please try again later.'
      });
    }

  };

  async firebaseSignIn(req: Request, res: Response): Promise<void> {
    try {
      const { idToken, name, profileImg } = req.body;

      if (!idToken || !name) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: 'ID token and name are required'
        });
        return;
      }


      const decodedToken = await admin.auth().verifyIdToken(idToken);

      if (!decodedToken.email) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: 'Email is required for authentication'
        });
        return;
      }

      let user = await this.authService.findUserByEmail(decodedToken.email);

      if (!user) {
        const newUser: IUser = {
          name: name || decodedToken.name || 'Unknown',
          email: decodedToken.email,
          firebaseUid: decodedToken.uid,
          profileImg: profileImg || decodedToken.picture || '',
          role: 'user',
          status: 'active',
          provider: 'google',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        user = await this.authService.createUser(newUser);
      } else {
        if (!user._id) {
          throw new Error('User ID is undefined');
        }
        user = await this.authService.updateUser(user._id, {
          firebaseUid: decodedToken.uid,
          lastLogin: new Date()
        });
      }

      const sessionToken = jwt.sign(
        { userId: user._id, email: user.email, name: user.name },
        process.env.JWT_SECRET!,
        { expiresIn: '8h' }
      );

      res.cookie('session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 8 * 60 * 60 * 1000,
        domain: process.env.NODE_ENV === 'production' ? '' : undefined
      });

      const { firebaseUid, createdAt, updatedAt, ...safeUser } = user;

      res.status(StatusCode.OK).json({
        success: true,
        message: 'Authentication successful',
        user: safeUser
      });
    } catch (error) {
      console.error('Firebase authentication error:', error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Authentication failed. Please try again later.'
      });
    }
  }

  isLogout = (_req: Request, res: Response): void => {
    try {
      res.clearCookie('session');
      res.status(StatusCode.OK).json({ success: true });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to logout'
      });
    }
  };
}