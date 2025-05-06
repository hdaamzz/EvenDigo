import { Response } from 'express';
import StatusCode from '../types/statuscode';

export class ResponseHandler {
  static success<T>(res: Response, data?: T, message: string = 'Operation successful', statusCode: number = StatusCode.OK): void {
    res.status(statusCode).json({
      success: true,
      message,
      data
    });
  }

  static error(res: Response, error: any, message: string = 'Operation failed', statusCode: number = StatusCode.INTERNAL_SERVER_ERROR): void {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    console.error(`${message}:`, error);
    
    res.status(statusCode).json({
      success: false,
      message,
      error: errorMessage
    });
  }
}
