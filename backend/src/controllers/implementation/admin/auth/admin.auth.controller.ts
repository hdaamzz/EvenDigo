import { Request, Response } from 'express';
import { ILogin } from '../../../../models/interfaces/auth.interface';
import { inject, injectable } from 'tsyringe';
import { IAuthAdminController } from '../../../../../src/controllers/interfaces/Admin/Auth/IAuth.admin.controller';
import { IAuthAdminService } from '../../../../../src/services/interfaces/IAuth.admin.service';
import StatusCode from '../../../../../src/types/statuscode';
import { ResponseHandler } from '../../../../../src/utils/response-handler';
import { BadRequestException, InternalServerErrorException,  ForbiddenException } from '../../../../../src/error/error-handlers';

@injectable()
export class AdminAuthController implements IAuthAdminController {
    constructor(
      @inject("AdminAuthService") private adminAuthService: IAuthAdminService,
    ) {}

    async verifyAdmin(req: Request, res: Response): Promise<void> {
        try {
          const loginData: ILogin = req.body;
          
          if (!loginData.email || !loginData.password) {
            throw new BadRequestException('Email and password are required');
          }
    
          const result = await this.adminAuthService.login(loginData);
          
          if (!result.success) {
            ResponseHandler.error(res,new ForbiddenException('Invalid credentials'),'Authentication failed',StatusCode.UNAUTHORIZED );
            return;
          }
    
          const token = result.token;
    
          // Set cookie
          res.cookie('session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000,
            domain: process.env.NODE_ENV === 'production' ? '.yourdomain.com' : undefined 
          });
    
          ResponseHandler.success(res, 
            { 
              user: result.user,
              token: result.token
            },
            'Authentication successful',StatusCode.OK );
          
        } catch (error) {
          if (error instanceof BadRequestException) {
            ResponseHandler.error(res,error,'Invalid request data',StatusCode.BAD_REQUEST);
          } else {
            console.error('Login error:', error);
            ResponseHandler.error(res,new InternalServerErrorException('Authentication process failed'), 'Internal server error', StatusCode.INTERNAL_SERVER_ERROR );
          }
        }
    };
}