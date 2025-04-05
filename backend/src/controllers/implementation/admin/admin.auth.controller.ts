import { Request, Response } from 'express';
import { ILogin } from '../../../models/interfaces/auth.interface';
import { IAuthAdminController } from '../../../../src/controllers/interfaces/IAuth.admin.controller';
import { inject, injectable } from 'tsyringe';
import { IAuthAdminService } from '../../../../src/services/interfaces/IAuth.admin.service';
// import * as jwt from 'jsonwebtoken';

@injectable()
export class AdminAuthController implements IAuthAdminController{
    constructor(
      @inject("AdminAuthService")  private adminAuthService: IAuthAdminService,
    ){}


    async verifyAdmin(req: Request, res: Response): Promise<void> {
        try {
          const loginData: ILogin = req.body;
          if (!loginData.email || !loginData.password) {
            res.status(400).json({
              success: false,
              message: 'Email and password are required'
            });
            return;
          }
    
          const result = await this.adminAuthService.login(loginData);
          if (!result.success) {
            res.status(401).json(result);
            return;
          }
    
    
          const token = result.token;
    
          res.cookie('session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000,
            domain: process.env.NODE_ENV === 'production' ? '.yourdomain.com' : undefined 
          });
    
          res.status(200).json(result);
        } catch (error) {
          console.error('Login error:', error);
          res.status(500).json({
            success: false,
            message: 'Internal server error'
          });
        }
      }
}