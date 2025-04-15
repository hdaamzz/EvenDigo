import { User } from "./userModel";

export interface UpdateProfileResponse {
    success: boolean;
    message: string;
    data: User
  }