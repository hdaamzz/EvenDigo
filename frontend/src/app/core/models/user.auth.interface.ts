import { User } from "./userModel";

export interface CommonResponse{
    success:boolean;
    message:string;
    user?:User
}