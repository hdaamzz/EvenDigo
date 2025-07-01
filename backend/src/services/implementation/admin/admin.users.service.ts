import { IUser, ServiceResponse, ServiceResponseWithMessage } from "../../../models/interfaces/auth.interface";
import { inject, injectable } from "tsyringe";
import { IUsersAdminService } from "../../../services/interfaces/IUsers.admin.service";
import { IUserRepository } from "../../../repositories/interfaces/IUser.repository";
import { IVerificationRepository } from "../../../repositories/interfaces/IVerification.repository";
import { IVerification } from "src/models/interfaces/profile.interface";

@injectable()
export class AdminUsersService implements IUsersAdminService {

    constructor(
      @inject("UserRepository") private userRepository: IUserRepository,
      @inject("VerificationRepository") private varificationRepository: IVerificationRepository
    ) {}

    async fetchAllUsers(): Promise<ServiceResponse<IUser[]>> {
      try {
        const users = await this.userRepository.findAll();
        
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

    async searchUsers(searchTerm: string): Promise<ServiceResponse<IUser[]>> {
      try {
        const users = await this.userRepository.searchUsers(searchTerm);
        
        return {
          success: true,
          message: "Users search completed successfully",
          data: users,
        };
      } catch (error) {
        return {
          success: false,
          message: "Failed to search users",
        };
      }
    }

    async fetchAllVerificationUsers(): Promise<ServiceResponse<IVerification[]>> {
      try {
        const users = await this.varificationRepository.findAllVerificationUsers();
        
        return {
          success: true,
          message: "Verification users fetched successfully",
          data: users,
        };
      } catch (error) {
        return {
          success: false,
          message: "Failed to fetch verification users",
        };
      }
    }

    async searchVerificationUsers(searchTerm: string): Promise<ServiceResponse<IVerification[]>> {
      try {
        const users = await this.varificationRepository.searchVerificationUsers(searchTerm);
        
        return {
          success: true,
          message: "Verification users search completed successfully",
          data: users,
        };
      } catch (error) {
        return {
          success: false,
          message: "Failed to search verification users",
        };
      }
    }

    async fetchUserById(userId: string): Promise<ServiceResponse<IUser>> {
      try {
        const user = await this.userRepository.findById(userId);
        
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

    async blockUser(userId: string): Promise<ServiceResponseWithMessage> {
      try {
        const user = await this.userRepository.blockUserById(userId);
        if (!user) {
          return {
            success: false,
            message: "User blocking failed",
          };
        }
        return {
          success: true,
          message: "User blocked successfully"
        }
      } catch (error) {
        return {
          success: false,
          message: "Failed to block user",
        };
      }
    }

    async unblockUser(userId: string): Promise<ServiceResponseWithMessage> {
      try {
        const user = await this.userRepository.unblockUserById(userId);
        if (!user) {
          return {
            success: false,
            message: "User unblocking failed",
          };
        }
        return {
          success: true,
          message: "User unblocked successfully"
        }
      } catch (error) {
        return {
          success: false,
          message: "Failed to unblock user",
        };
      }
    }

    async approveUser(userId: string): Promise<ServiceResponseWithMessage> {
      try {
        await this.userRepository.approveUserStatusChange(userId)
        const requestedUser = await this.varificationRepository.approveUser(userId);
        if (!requestedUser) {
          return {
            success: false,
            message: "User verification failed",
          };
        }
        return {
          success: true,
          message: "User verified successfully"
        }
      } catch (error) {
        return {
          success: false,
          message: "Failed to verify user",
        };
      }
    }

    async rejectUser(userId: string): Promise<ServiceResponseWithMessage> {
      try {
        const requestedUser = await this.varificationRepository.rejectUser(userId);
        if (!requestedUser) {
          return {
            success: false,
            message: "User rejection failed",
          };
        }
        return {
          success: true,
          message: "User rejected successfully"
        }
      } catch (error) {
        return {
          success: false,
          message: "Failed to reject user",
        };
      }
    }
}