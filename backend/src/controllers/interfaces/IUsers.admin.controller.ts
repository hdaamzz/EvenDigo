import { Request, Response } from "express";

export interface IUsersAdminController {
  fetchAllUsers(req: Request, res: Response): Promise<void>;
  fetchAllRequestedUsers(req: Request, res: Response): Promise<void>;
  fetchUserById(req: Request, res: Response): Promise<void>;
  blockAndUnblockUser(req: Request, res: Response): Promise<void>;
  unblockAndUnblockUser(req: Request, res: Response): Promise<void>;
  approveUser(req: Request, res: Response): Promise<void>;
  rejectUser(req: Request, res: Response): Promise<void>;
}
