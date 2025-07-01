import { IUser } from "../../../../models/interfaces/auth.interface";

export interface IFirebaseAuthService {
  verifyIdToken(idToken: string): Promise<any>;
  authenticateWithFirebase(idToken: string, name: string, profileImg?: string): Promise<{
    success: boolean;
    message: string;
    user?: Partial<IUser>;
    token?: string;
  }>;
}