import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../../../../models/interfaces/profile.interface';

export interface IAuthController {
  sendOTP(req: Request, res: Response): Promise<void>;
  verifyOTP(req: Request, res: Response): Promise<void>;
  verifyUser(req: Request, res: Response): Promise<void>;
  sendForgotPassword(req: Request, res: Response): Promise<void>;
  resetPassword(req: Request, res: Response): Promise<void>;
  isAuthenticated(req: AuthenticatedRequest, res: Response): Promise<void>;
  firebaseSignIn(req: Request, res: Response): Promise<void>;
  isLogout(req: Request, res: Response): void;
}