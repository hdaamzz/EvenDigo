import { Request, Response, NextFunction } from 'express';
import StatusCode from '../types/statuscode';

export interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
}

export class AuthenticationError extends Error implements AppError {
  statusCode = StatusCode.UNAUTHORIZED;
  isOperational = true;

  constructor(message: string = 'Authentication failed') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class ValidationError extends Error implements AppError {
  statusCode = StatusCode.BAD_REQUEST;
  isOperational = true;

  constructor(message: string = 'Validation failed') {
    super(message);
    this.name = 'ValidationError';
  }
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(`Error: ${err.message}`, {
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: 'Something went wrong!',
  });
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};