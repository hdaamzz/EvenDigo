import { Request, Response } from "express";
import { IUser, ServiceResponse } from "../../../models/interfaces/auth.interface";
import { inject, injectable } from "tsyringe";
import { IUsersAdminController } from "../../../../src/controllers/interfaces/IUsers.admin.controller";
import { IUsersAdminService } from "../../../../src/services/interfaces/IUsers.admin.service";


@injectable()
export class AdminUsersController implements IUsersAdminController{

  constructor(
    @inject("AdminUsersService")  private adminUsersService: IUsersAdminService,
  ) {}

  async fetchAllUsers(_req: Request, res: Response): Promise<void> {
    const response: ServiceResponse<IUser[]> = await this.adminUsersService.fetchAllUsers();
    if (response.success) {
      res.status(200).json(response.data);
    } else {
      res.status(500).json(response);
    }


  }
  async fetchAllRequestedUsers(_req: Request, res: Response): Promise<void> {
    const response: ServiceResponse<IUser[]> = await this.adminUsersService.fetchAllVerificationUsers();
    if (response.success) {
      res.status(200).json(response.data);
    } else {
      res.status(500).json(response);
    }


  }

  async fetchUserById(req: Request, res: Response): Promise<void> {
    const {userId} = req.body;
    
    const response: ServiceResponse<IUser> = await this.adminUsersService.fetchUserById(userId);
    if (response.success) {
      res.status(200).json(response.data);
    } else {
      res.status(500).json(response);
    }
  }

  async blockAndUnblockUser(req:Request, res:Response):Promise<void>{
    const{id}=req.body;
    console.log(id);
    
    const response=await this.adminUsersService.blockUser(id)
    if(response.success){
      res.status(200).json(response)
    }else{
      res.status(500).json(response)
    }
  }


  async unblockAndUnblockUser(req:Request, res:Response):Promise<void>{
    const{id}=req.body;    
    const response=await this.adminUsersService.unblockUser(id)
    if(response.success){
      res.status(200).json(response)
    }else{
      res.status(500).json(response)
    }
  }
  async approveUser(req:Request, res:Response):Promise<void>{
    const{id}=req.body;
    
    const response=await this.adminUsersService.approveUser(id)
    if(response.success){
      res.status(200).json(response)
    }else{
      res.status(500).json(response)
    }
  }

  async rejectUser(req:Request, res:Response):Promise<void>{
    const{id}=req.body;
    
    const response=await this.adminUsersService.rejectUser(id)
    if(response.success){
      res.status(200).json(response)
    }else{
      res.status(500).json(response)
    }
  }


}