import { Request, Response } from "express";
import { IUser, ServiceResponse } from "../../../../models/interfaces/auth.interface";
import { inject, injectable } from "tsyringe";
import { IVerification } from "../../../../../src/models/interfaces/profile.interface";
import { IUsersAdminController } from "../../../../../src/controllers/interfaces/Admin/User/IUsers.admin.controller";
import StatusCode from "../../../../../src/types/statuscode";
import { IUsersAdminService } from "../../../../../src/services/interfaces/IUsers.admin.service";
import { 
  AdminUserResponseDto, 
  AdminVerificationResponseDto, 
  UserActionRequestDto 
} from "../../../../dto/admin/user/admin.user.dto";

@injectable()
export class AdminUsersController implements IUsersAdminController {

  constructor(
    @inject("AdminUsersService") private adminUsersService: IUsersAdminService,
  ) {}

  async fetchAllUsers(_req: Request, res: Response): Promise<void> {
    const response: ServiceResponse<IUser[]> = await this.adminUsersService.fetchAllUsers();
    if (response.success) {
      const userDtos = AdminUserResponseDto.fromUsers(response.data!);
      res.status(StatusCode.OK).json(userDtos);
    } else {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json(response);
    }
  }

  async searchUsers(req: Request, res: Response): Promise<void> {
    const searchTerm = req.query.search as string;
    
    if (!searchTerm || searchTerm.trim() === '') {
      return this.fetchAllUsers(req, res);
    }
    
    const response: ServiceResponse<IUser[]> = await this.adminUsersService.searchUsers(searchTerm.trim());
    if (response.success) {
      const userDtos = AdminUserResponseDto.fromUsers(response.data!);
      res.status(StatusCode.OK).json(userDtos);
    } else {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json(response);
    }
  }

  async fetchAllRequestedUsers(_req: Request, res: Response): Promise<void> {
    const response: ServiceResponse<IVerification[]> = await this.adminUsersService.fetchAllVerificationUsers();
    if (response.success) {
      const verificationDtos = AdminVerificationResponseDto.fromVerifications(response.data!);
      res.status(StatusCode.OK).json(verificationDtos);
    } else {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json(response);
    }
  }

  async searchVerificationUsers(req: Request, res: Response): Promise<void> {
    const searchTerm = req.query.search as string;
    
    if (!searchTerm || searchTerm.trim() === '') {
      return this.fetchAllRequestedUsers(req, res);
    }
    
    const response: ServiceResponse<IVerification[]> = await this.adminUsersService.searchVerificationUsers(searchTerm.trim());
    console.log(response);
    
    if (response.success) {
      const verificationDtos = AdminVerificationResponseDto.fromVerifications(response.data!);
      res.status(StatusCode.OK).json(verificationDtos);
    } else {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json(response);
    }
  }

  async fetchUserById(req: Request, res: Response): Promise<void> {
    const userActionDto = new UserActionRequestDto(req.body);
    
    const response: ServiceResponse<IUser> = await this.adminUsersService.fetchUserById(userActionDto.userId);
    if (response.success) {
      const userDto = AdminUserResponseDto.fromUser(response.data!);
      res.status(StatusCode.OK).json(userDto);
    } else {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json(response);
    }
  }

  async blockAndUnblockUser(req: Request, res: Response): Promise<void> {
    const userActionDto = new UserActionRequestDto(req.body);
    const response = await this.adminUsersService.blockUser(userActionDto.userId);
    if (response.success) {
      res.status(StatusCode.OK).json(response);
    } else {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json(response);
    }
  }

  async unblockAndUnblockUser(req: Request, res: Response): Promise<void> {
    const userActionDto = new UserActionRequestDto(req.body);
    const response = await this.adminUsersService.unblockUser(userActionDto.userId);
    if (response.success) {
      res.status(StatusCode.OK).json(response);
    } else {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json(response);
    }
  }

  async approveUser(req: Request, res: Response): Promise<void> {
    const userActionDto = new UserActionRequestDto(req.body);
    const response = await this.adminUsersService.approveUser(userActionDto.userId);
    if (response.success) {
      res.status(StatusCode.OK).json(response);
    } else {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json(response);
    }
  }

  async rejectUser(req: Request, res: Response): Promise<void> {
    const userActionDto = new UserActionRequestDto(req.body);
    const response = await this.adminUsersService.rejectUser(userActionDto.userId);
    if (response.success) {
      res.status(StatusCode.OK).json(response);
    } else {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json(response);
    }
  }
}