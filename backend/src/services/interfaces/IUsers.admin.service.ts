import { IUser, ServiceResponse } from "../../models/interfaces/auth.interface";

export interface IUsersAdminService {
  fetchAllUsers(): Promise<ServiceResponse<IUser[]>>;
  fetchAllVerificationUsers(): Promise<ServiceResponse<IUser[]>>;
  fetchUserById(userId: string): Promise<ServiceResponse<IUser>>;
  blockUser(id: string): Promise<any>;
  unblockUser(id: string): Promise<any>;
  approveUser(id: string): Promise<any>;
  rejectUser(id: string): Promise<any>;
}