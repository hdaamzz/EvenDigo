import { Request, Response } from "express";

export interface IEventsAdminController {
  fetchAllEvents(req: Request, res: Response): Promise<void>;
  updateEventStatus(req: Request, res: Response): Promise<void>;
}
