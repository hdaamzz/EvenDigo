import { IEvent } from "../event.interface";
import { User } from "../userModel";

export interface IAdminLogin{
    email:string;
    password:string;
}
export interface UsersResponse {
    success: boolean;
    message: string;
    data: User[];
  }

export interface IAdminLoginResponse {
  message:string;
  success:boolean;
  token:string
  user:User
}
  
 export interface SuccessResponse {
    success: true; 
    data: User[];
  }
  export interface EventSuccessResponse {
    success: true; 
    data: IEvent[];
  }
  
 export interface ErrorResponse {
    success: false; 
    message: string;
  }
  
 export type ApiResponse = SuccessResponse | ErrorResponse;

 export interface EventListResponse{
  success:boolean,
  message:string,
  data:IEvent[]
 }

 export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixed_amount'
}
 export type EventsApiResponse = EventSuccessResponse | ErrorResponse;

