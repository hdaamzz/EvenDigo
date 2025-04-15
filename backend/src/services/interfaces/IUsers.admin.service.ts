import { IVerification } from "src/models/interfaces/profile.interface";
import { IUser, ServiceResponse, ServiceResponseWithMessage } from "../../models/interfaces/auth.interface";

export interface IUsersAdminService {
  fetchAllUsers(): Promise<ServiceResponse<IUser[]>>;
  fetchAllVerificationUsers(): Promise<ServiceResponse<IVerification[]>>;
  fetchUserById(userId: string): Promise<ServiceResponse<IUser>>;
  blockUser(id: string): Promise<ServiceResponseWithMessage>;
  unblockUser(id: string): Promise<ServiceResponseWithMessage>;
  approveUser(id: string): Promise<ServiceResponseWithMessage>;
  rejectUser(id: string): Promise<ServiceResponseWithMessage>;
}