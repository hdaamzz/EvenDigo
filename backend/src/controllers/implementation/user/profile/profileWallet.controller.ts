import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { IProfileWalletController } from '../../../../controllers/interfaces/User/Profile/IProfileWallet.controller';
import { ResponseHandler } from '../../../../utils/response-handler';
import { IProfileWalletService } from '../../../../../src/services/interfaces/user/profile/IProfileWallet.service';

@injectable()
export class ProfileWalletController implements IProfileWalletController {
  constructor(
    @inject("ProfileWalletService") private profileWalletService: IProfileWalletService,
  ) {}

  async getUserWallet(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user?._id) {
        return ResponseHandler.error(res, null, "User not authenticated", 401);
      }
      
      const userId = req.user._id.toString();
      const response = await this.profileWalletService.getWalletDetails(userId);
      
      if (response.success) {
        ResponseHandler.success(res, response.data, response.message);
      } else {
        ResponseHandler.error(res, null, response.message, 400);
      }
    } catch (error) {
      ResponseHandler.error(res, error, "Failed to fetch wallet details");
    }
  }
}