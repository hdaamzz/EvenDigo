import { Request, Response } from 'express';
import { IUser } from '../../../../models/interfaces/auth.interface';

export interface IAuthController {
  sendOTP(req: Request, res: Response): Promise<void>;
  verifyOTP(req: Request, res: Response): Promise<void>;
  verifyUser(req: Request, res: Response): Promise<void>;
  sendForgotPassword(req: Request, res: Response): Promise<void>;
  resetPassword(req: Request, res: Response): Promise<void>;
  isAuthenticated(req: AuthenticatedRequest, res: Response): Promise<void>;
  firebaseSignIn(req: Request, res: Response): Promise<void>;
  logout(req: Request, res: Response): void;
}

export interface AuthenticatedRequest extends Request {
  user?: IUser;
}