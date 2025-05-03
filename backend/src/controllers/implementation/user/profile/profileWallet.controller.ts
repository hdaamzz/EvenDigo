import { Request, Response } from 'express';
import { IProfileService } from '../../../../../src/services/interfaces/IProfile.service';
import StatusCode from '../../../../../src/types/statuscode';
import { inject, injectable } from 'tsyringe';
import { IProfileWalletController } from '../../../../../src/controllers/interfaces/User/Profile/IProfileWallet.controller';



@injectable()
export class ProfileWalletController implements IProfileWalletController{
  constructor(
    @inject("ProfileService")   private profileService: IProfileService,
    
  ) {}

  async getUserWallet(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user._id.toString();
      const response = await this.profileService.getWalletDetails(userId);
      console.log(response);
      
      if (response.success) {
        res.status(StatusCode.OK).json(response);
      } else {
        res.status(StatusCode.BAD_REQUEST).json(response);
      }
    } catch (error) {
      console.error('Wallet fetch error:', error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Internal server error',
        error: (error as Error).message
      });
    }
  }
}