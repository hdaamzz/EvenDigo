import { Request, Response } from 'express';
import { AuthenticatedRequest, FileRequest } from '../../models/interfaces/profile.interface';



export interface IProfileController {
  fetchUserById(req: Request, res: Response): Promise<void>;
  updateUserDetails(req: Request, res: Response): Promise<void>;
  sendVerificationRequest(req: Request, res: Response): Promise<void>;
  verificationRequestDetails(req: Request, res: Response): Promise<void>;
  uploadProfileImage(req: FileRequest & AuthenticatedRequest, res: Response): Promise<void>;
  getUserEvents(req: AuthenticatedRequest, res: Response): Promise<void>;
  cancelTicket(req: AuthenticatedRequest, res: Response): Promise<void>;
  getUserWallet(req: AuthenticatedRequest, res: Response): Promise<void>;
  addMoneyToWallet(req: AuthenticatedRequest, res: Response): Promise<void>;
  withdrawMoneyFromWallet(req: AuthenticatedRequest, res: Response): Promise<void>;
}