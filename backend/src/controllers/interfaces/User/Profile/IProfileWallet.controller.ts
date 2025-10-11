import { Response } from 'express';
import { AuthenticatedRequest } from '../../../../models/interfaces/profile.interface';



export interface IProfileWalletController {
  getUserWallet(req: AuthenticatedRequest, res: Response): Promise<void>;
  addMoney(req: AuthenticatedRequest, res: Response): Promise<void>;
  withdrawMoney(req: AuthenticatedRequest, res: Response): Promise<void>;
}