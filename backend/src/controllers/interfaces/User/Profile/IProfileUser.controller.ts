import { Request, Response } from 'express';
import { AuthenticatedRequest, FileRequest } from '../../../../models/interfaces/profile.interface';



export interface IProfileUserController {
  fetchUserById(req: Request, res: Response): Promise<void>;
  updateUserDetails(req: Request, res: Response): Promise<void>;
  sendVerificationRequest(req: Request, res: Response): Promise<void>;
  verificationRequestDetails(req: Request, res: Response): Promise<void>;
  uploadProfileImage(req: FileRequest & AuthenticatedRequest, res: Response): Promise<void>;
}