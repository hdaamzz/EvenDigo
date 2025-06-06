import { Request, Response } from "express";
import { IUser, ServiceResponse } from "../../../../models/interfaces/auth.interface";
import { inject, injectable } from "tsyringe";
import { IVerification } from "../../../../../src/models/interfaces/profile.interface";
import { IUsersAdminController } from "../../../../../src/controllers/interfaces/Admin/User/IUsers.admin.controller";
import StatusCode from "../../../../../src/types/statuscode";
import { IUsersAdminService } from "../../../../../src/services/interfaces/IUsers.admin.service";


@injectable()
export class AdminUsersController implements IUsersAdminController{

  constructor(
    @inject("AdminUsersService")  private adminUsersService: IUsersAdminService,
  ) {}

  async fetchAllUsers(_req: Request, res: Response): Promise<void> {
    const response: ServiceResponse<IUser[]> = await this.adminUsersService.fetchAllUsers();
    if (response.success) {
      res.status(StatusCode.OK).json(response.data);
    } else {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json(response);
    }


  }
  async fetchAllRequestedUsers(_req: Request, res: Response): Promise<void> {
    const response: ServiceResponse<IVerification[]> = await this.adminUsersService.fetchAllVerificationUsers();
    if (response.success) {
      res.status(StatusCode.OK).json(response.data);
    } else {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json(response);
    }


  }

  async fetchUserById(req: Request, res: Response): Promise<void> {
    const {userId} = req.body;
    
    const response: ServiceResponse<IUser> = await this.adminUsersService.fetchUserById(userId);
    if (response.success) {
      res.status(StatusCode.OK).json(response.data);
    } else {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json(response);
    }
  }

  async blockAndUnblockUser(req:Request, res:Response):Promise<void>{
    const{userId}=req.body;    
    const response=await this.adminUsersService.blockUser(userId)
    if(response.success){
      res.status(StatusCode.OK).json(response)
    }else{
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json(response)
    }
  }


  async unblockAndUnblockUser(req:Request, res:Response):Promise<void>{
    const{userId}=req.body;    
    const response=await this.adminUsersService.unblockUser(userId)
    if(response.success){
      res.status(StatusCode.OK).json(response)
    }else{
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json(response)
    }
  }
  async approveUser(req:Request, res:Response):Promise<void>{
    const{userId}=req.body;
    
    const response=await this.adminUsersService.approveUser(userId)
    if(response.success){
      res.status(StatusCode.OK).json(response)
    }else{
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json(response)
    }
  }

  async rejectUser(req:Request, res:Response):Promise<void>{
    const{userId}=req.body;
    
    const response=await this.adminUsersService.rejectUser(userId)
    if(response.success){
      res.status(StatusCode.OK).json(response)
    }else{
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json(response)
    }
  }


}