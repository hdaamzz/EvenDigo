import { Request } from 'express';
import { IUser } from './auth.interface';
import { Schema } from 'mongoose';


export interface AuthenticatedRequest extends Request {
    user?: IUser;
  }
  
  export interface FileRequest extends AuthenticatedRequest {
    file?: Express.Multer.File;
  }



export interface IVerification{
    user_id:Schema.Types.ObjectId | string;
    status:string;
    note?:string;

}

export interface CloudinaryUploadResult {
    public_id: string;
    secure_url: string;
    format: string;
    width: number;
    height: number;
    bytes: number;
    resource_type: string;
  }