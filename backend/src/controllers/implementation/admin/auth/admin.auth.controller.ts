import { Request, Response } from 'express';
import { ILogin } from '../../../../models/interfaces/auth.interface';
import { inject, injectable } from 'tsyringe';
import { IAuthAdminController } from '../../../../controllers/interfaces/Admin/Auth/IAuth.admin.controller';
import { IAuthAdminService } from '../../../../services/interfaces/IAuth.admin.service';
import StatusCode from '../../../../types/statuscode';
import { CookieUtils } from '../../../../utils/cookie.utils';

@injectable()
export class AdminAuthController implements IAuthAdminController {
  constructor(
    @inject('AdminAuthService') private adminAuthService: IAuthAdminService
  ) {}

  async verifyAdmin(req: Request, res: Response): Promise<void> {
    try {
      const loginData: ILogin = req.body;
      
      if (!loginData.email || !loginData.password) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: 'Email and password are required',
        });
        return;
      }

      const result = await this.adminAuthService.login(loginData);
      
      if (!result.success || !result.accessToken || !result.refreshToken || !result.user) {
        res.status(StatusCode.UNAUTHORIZED).json(result);
        return;
      }

      CookieUtils.setAuthCookies(res, {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });

      res.status(StatusCode.OK).json({
        success: true,
        message: 'Login successful',
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          role: result.user.role,
          token: result.accessToken,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
}