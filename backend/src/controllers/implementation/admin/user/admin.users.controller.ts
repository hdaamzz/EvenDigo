import { Request, Response } from "express";
import { IUser, ServiceResponse } from "../../../../models/interfaces/auth.interface";
import { inject, injectable } from "tsyringe";
import { IVerification } from "../../../../../src/models/interfaces/profile.interface";
import { IUsersAdminController } from "../../../../../src/controllers/interfaces/Admin/User/IUsers.admin.controller";
import { IUsersAdminService } from "../../../../../src/services/interfaces/IUsers.admin.service";
import { ResponseHandler } from '../../../../../src/utils/response-handler';
import { BadRequestException, InternalServerErrorException } from '../../../../../src/error/error-handlers';
import StatusCode from "../../../../../src/types/statuscode";

@injectable()
export class AdminUsersController implements IUsersAdminController {
  constructor(
    @inject("AdminUsersService") private adminUsersService: IUsersAdminService,
  ) {}

  async fetchAllUsers(_req: Request, res: Response): Promise<void> {
    try {
      const response: ServiceResponse<IUser[]> = await this.adminUsersService.fetchAllUsers();
      
      if (response.success) {
        ResponseHandler.success(res, response.data);
      } else {
        throw new InternalServerErrorException(response.message || 'Failed to fetch all users');
      }
    } catch (error) {
      ResponseHandler.error(res, error, 'Failed to fetch all users');
    }
  }
  
  async fetchAllRequestedUsers(_req: Request, res: Response): Promise<void> {
    try {
      const response: ServiceResponse<IVerification[]> = await this.adminUsersService.fetchAllVerificationUsers();
      
      if (response.success) {
        ResponseHandler.success(res, response.data);
      } else {
        throw new InternalServerErrorException(response.message || 'Failed to fetch requested users');
      }
    } catch (error) {
      ResponseHandler.error(res, error, 'Failed to fetch requested users');
    }
  }

  async fetchUserById(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        throw new BadRequestException('User ID is required');
      }
      
      const response: ServiceResponse<IUser> = await this.adminUsersService.fetchUserById(userId);
      
      if (response.success) {
        ResponseHandler.success(res, response.data);
      } else {
        throw new InternalServerErrorException(response.message || 'Failed to fetch user');
      }
    } catch (error) {
      ResponseHandler.error(
        res, 
        error, 
        'Failed to fetch user by ID',
        error instanceof BadRequestException ? StatusCode.BAD_REQUEST : StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async blockAndUnblockUser(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        throw new BadRequestException('User ID is required');
      }
      
      const response: ServiceResponse<IUser> = await this.adminUsersService.blockUser(userId);
      
      if (response.success) {
        ResponseHandler.success(res, response.data, response.message);
      } else {
        throw new InternalServerErrorException(response.message || 'Failed to block user');
      }
    } catch (error) {
      ResponseHandler.error(
        res, 
        error, 
        'Failed to block user',
        error instanceof BadRequestException ? StatusCode.BAD_REQUEST : StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async unblockAndUnblockUser(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        throw new BadRequestException('User ID is required');
      }
      
      const response: ServiceResponse<IUser> = await this.adminUsersService.unblockUser(userId);
      
      if (response.success) {
        ResponseHandler.success(res, response.data, response.message);
      } else {
        throw new InternalServerErrorException(response.message || 'Failed to unblock user');
      }
    } catch (error) {
      ResponseHandler.error(
        res, 
        error, 
        'Failed to unblock user',
        error instanceof BadRequestException ? StatusCode.BAD_REQUEST : StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
  
  async approveUser(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        throw new BadRequestException('User ID is required');
      }
      
      const response: ServiceResponse<IUser> = await this.adminUsersService.approveUser(userId);
      
      if (response.success) {
        ResponseHandler.success(res, response.data, response.message);
      } else {
        throw new InternalServerErrorException(response.message || 'Failed to approve user');
      }
    } catch (error) {
      ResponseHandler.error(
        res, 
        error, 
        'Failed to approve user',
        error instanceof BadRequestException ? StatusCode.BAD_REQUEST : StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async rejectUser(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        throw new BadRequestException('User ID is required');
      }
      
      const response: ServiceResponse<IUser> = await this.adminUsersService.rejectUser(userId);
      
      if (response.success) {
        ResponseHandler.success(res, response.data, response.message);
      } else {
        throw new InternalServerErrorException(response.message || 'Failed to reject user');
      }
    } catch (error) {
      ResponseHandler.error(
        res, 
        error, 
        'Failed to reject user',
        error instanceof BadRequestException ? StatusCode.BAD_REQUEST : StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
}