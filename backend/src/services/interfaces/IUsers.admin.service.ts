import { IVerification } from "src/models/interfaces/profile.interface";
import { IUser, ServiceResponse, ServiceResponseWithMessage } from "../../models/interfaces/auth.interface";

export interface IUsersAdminService {
  fetchAllUsers(): Promise<ServiceResponse<IUser[]>>;
  fetchAllVerificationUsers(): Promise<ServiceResponse<IVerification[]>>;
  fetchUserById(userId: string): Promise<ServiceResponse<IUser>>;
  blockUser(userId: string): Promise<ServiceResponseWithMessage>;
  unblockUser(userId: string): Promise<ServiceResponseWithMessage>;
  approveUser(userId: string): Promise<ServiceResponseWithMessage>;
  rejectUser(userId: string): Promise<ServiceResponseWithMessage>;
}