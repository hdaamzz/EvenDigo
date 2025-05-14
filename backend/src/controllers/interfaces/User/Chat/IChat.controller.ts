import { Request, Response } from 'express';

export interface IChatController {
  getChats(req: Request, res: Response): Promise<void>;
  getMessages(req: Request, res: Response): Promise<void>;
  getUsersGroupChat(req: Request, res: Response): Promise<void>;
  getMessageGroupChat(req: Request, res: Response): Promise<void>;
}
