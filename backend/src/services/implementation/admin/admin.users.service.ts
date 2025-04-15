import { IUser, ServiceResponse, ServiceResponseWithMessage } from "../../../models/interfaces/auth.interface";
import { inject, injectable } from "tsyringe";
import { IUsersAdminService } from "../../../../src/services/interfaces/IUsers.admin.service";
import { IUserRepository } from "../../../../src/repositories/interfaces/IUser.repository";
import { IVerificationRepository } from "../../../../src/repositories/interfaces/IVerification.repository";
import { IVerification } from "src/models/interfaces/profile.interface";


@injectable()
export class AdminUsersService implements IUsersAdminService {

    constructor(
      @inject("UserRepository") private userRepository: IUserRepository,
      @inject("VerificationRepository") private varificationRepository:IVerificationRepository


    ) {}

    
    async fetchAllUsers(): Promise<ServiceResponse<IUser[]>> {
    try {
      const users = await this.userRepository.findAllUsers();
      
      return {
        success: true,
        message: "Users fetched successfully",
        data: users,
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to fetch users",
      };
    }
  }

  async fetchAllVerificationUsers(): Promise<ServiceResponse<IVerification[]>> {
    try {
      const users = await this.varificationRepository.findAllVerificationUsers();
      
      return {
        success: true,
        message: "Users fetched successfully",
        data: users,
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to fetch users",
      };
    }
  }

  async fetchUserById(userId: string): Promise<ServiceResponse<IUser>> {
    try {
      const user = await this.userRepository.findUserById(userId);
      
      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }
      
      return {
        success: true,
        message: "User fetched successfully",
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to fetch user",
      };
    }
  }

  async blockUser(id:string):Promise<ServiceResponseWithMessage>{
    try {
      const user=await this.userRepository.blockUserById(id);
      if(!user){
        return {
          success:false,
          message:"User Blocking failed",
        };
      }
      return {
        success:true,
        message:"User Blocking success"
      }
    } catch (error) {
      return {
        success: false,
        message: "Failed to block user",
      };
    }
  }
  async unblockUser(id:string):Promise<ServiceResponseWithMessage>{
    try {
      const user=await this.userRepository.unblockUserById(id);
      if(!user){
        return {
          success:false,
          message:"User Unblocking failed",
        };
      }
      return {
        success:true,
        message:"User Unblocking success"
      }
    } catch (error) {
      return {
        success: false,
        message: "Failed to unblock user",
      };
    }
  }

  async approveUser(id:string):Promise<ServiceResponseWithMessage>{
    try {
      await this.userRepository.approveUserStatusChange(id)
      const requestedUser=await this.varificationRepository.approveUser(id);
      if(!requestedUser){
        return {
          success:false,
          message:"User veriefieing failed",
        };
      }
      return {
        success:true,
        message:"User Verified success"
      }
    } catch (error) {
      return {
        success: false,
        message: "Failed to verifieing user",
      };
    }
  }

  async rejectUser(id:string):Promise<ServiceResponseWithMessage>{
    try {
      const requestedUser=await this.varificationRepository.rejectUser(id);
      if(!requestedUser){
        return {
          success:false,
          message:"User rejecting failed",
        };
      }
      return {
        success:true,
        message:"User Rejected success"
      }
    } catch (error) {
      return {
        success: false,
        message: "Failed to rejecting user",
      };
    }
  }


}