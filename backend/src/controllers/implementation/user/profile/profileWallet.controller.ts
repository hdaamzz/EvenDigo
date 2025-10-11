import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { IProfileWalletController } from '../../../../controllers/interfaces/User/Profile/IProfileWallet.controller';
import { ResponseHandler } from '../../../../utils/response-handler';
import { IProfileWalletService } from '../../../../services/interfaces/user/profile/IProfileWallet.service';

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

  async addMoney(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user?._id) {
        return ResponseHandler.error(res, null, "User not authenticated", 401);
      }

      const { amount, reference } = req.body;
      const userId = req.user._id.toString();

      if (!amount || amount <= 0) {
        return ResponseHandler.error(res, null, "Invalid amount", 400);
      }

      const response = await this.profileWalletService.addMoney(userId, amount, reference);
      
      if (response.success) {
        ResponseHandler.success(res, response.data, response.message);
      } else {
        ResponseHandler.error(res, null, response.message, 400);
      }
    } catch (error) {
      ResponseHandler.error(res, error, "Failed to add money to wallet");
    }
  }

  async withdrawMoney(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user?._id) {
        return ResponseHandler.error(res, null, "User not authenticated", 401);
      }

      const { amount } = req.body;
      const userId = req.user._id.toString();
      const userEmail = req.user.email;

      if (!amount || amount <= 0) {
        return ResponseHandler.error(res, null, "Invalid amount", 400);
      }

      if (amount < 100) {
        return ResponseHandler.error(res, null, "Minimum withdrawal amount is ₹100", 400);
      }

      if (amount > 50000) {
        return ResponseHandler.error(res, null, "Maximum withdrawal amount is ₹50,000", 400);
      }

      const response = await this.profileWalletService.withdrawMoney(userId, amount, userEmail);
      
      if (response.success) {
        ResponseHandler.success(res, response.data, response.message);
      } else {
        ResponseHandler.error(res, null, response.message, 400);
      }
    } catch (error) {
      ResponseHandler.error(res, error, "Failed to process withdrawal");
    }
  }
}