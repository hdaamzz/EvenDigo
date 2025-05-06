import { ServiceResponse } from "../../../../../src/models/interfaces/auth.interface";

export interface IPasswordService {
  hashPassword(password: string): Promise<string>;
  verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean>;
  storeResetToken(email: string, token: string): Promise<void>;
  verifyResetToken(email: string, token: string): Promise<boolean>;
  deleteResetToken(email: string): Promise<void>;
  resetPassword(email: string, token: string, newPassword: string): Promise<ServiceResponse<null>>;
}
