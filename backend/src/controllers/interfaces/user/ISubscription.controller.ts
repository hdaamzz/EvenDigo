import { Request, Response } from 'express';

export interface ISubscriptionController {

  createCheckout(req: Request, res: Response): Promise<void>;
  
  walletUpgrade(req: Request, res: Response): Promise<void>;
  
  getCurrentSubscription(req: Request, res: Response): Promise<void>;
  
  cancelSubscription(req: Request, res: Response): Promise<void>;
  
  handleWebhook(req: Request, res: Response): Promise<void>;
}