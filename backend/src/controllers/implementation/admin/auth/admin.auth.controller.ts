import { Request, Response } from 'express';
import { IAuthResponse, ILogin } from '../../../../models/interfaces/auth.interface';
import { inject, injectable } from 'tsyringe';
import { IAuthAdminController } from '../../../../controllers/interfaces/Admin/Auth/IAuth.admin.controller';
import { IAuthAdminService } from '../../../../services/interfaces/IAuth.admin.service';
import StatusCode from '../../../../types/statuscode';
import { CookieUtils } from '../../../../utils/cookie.utils';

@injectable()
export class AdminAuthController implements IAuthAdminController {
  constructor(
    @inject('AdminAuthService') private readonly _adminAuthService: IAuthAdminService
  ) {}

  async verifyAdmin(req: Request, res: Response): Promise<void> {
    try {
      const loginData = this._extractLoginData(req);
      
      if (!this._isValidLoginData(loginData)) {
        this._sendBadRequestResponse(res, 'Email and password are required');
        return;
      }

      const result = await this._adminAuthService.login(loginData);
      
      if (!this._isSuccessfulLogin(result)) {
        res.status(StatusCode.UNAUTHORIZED).json(result);
        return;
      }

      this._setAuthCookies(res, result);
      this._sendSuccessResponse(res, result);
      
    } catch (error) {
      this._handleError(res, error);
    }
  }

  private _extractLoginData(req: Request): ILogin {
    return req.body as ILogin;
  }

  private _isValidLoginData(loginData: ILogin): boolean {
    return !!(loginData?.email && loginData?.password);
  }

  private _isSuccessfulLogin(result: IAuthResponse): boolean {    
    return !!(result?.success && result?.accessToken && result?.refreshToken && result?.user);
  }

  private _setAuthCookies(res: Response, result: IAuthResponse): void {
    CookieUtils.setAuthCookies(res, {
      accessToken: result.accessToken ?? '',
      refreshToken: result.refreshToken ?? '',
    });
  }

  private _sendBadRequestResponse(res: Response, message: string): void {
    res.status(StatusCode.BAD_REQUEST).json({
      success: false,
      message,
    });
  }

  private _sendSuccessResponse(res: Response, result: IAuthResponse): void {
    res.status(StatusCode.OK).json({
      success: true,
      message: 'Login successful',
      user: result.user
        ? {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
            role: result.user.role,
            token: result.accessToken,
          }
        : null,
    });
  }

  private _handleError(res: Response, error: unknown): void {
    console.error('Login error:', error);
    res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error',
    });
  }
}
