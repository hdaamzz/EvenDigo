import { Request, Response, NextFunction } from 'express';
import StatusCode from '../types/statuscode';

interface RequestStore {
  [key: string]: {
    timeout: NodeJS.Timeout;
    res: Response;
  };
}


export const debounceMiddleware = (
  delay: number = 300,
  keyGenerator: (req: Request) => string = (req) => {
    const userId = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null;
    return `${req.method}:${req.path}:${userId || req.ip}`;
  }
) => {
  const requests: RequestStore = {};

  return (req: Request, res: Response, next: NextFunction) => {
    const key = keyGenerator(req);

    if (requests[key]) {
      clearTimeout(requests[key].timeout);
      requests[key].res.status(StatusCode.TOO_MANY_REQUEST).json({ 
        success: false, 
        message: 'Request debounced. Please try again.' 
      });
    }

    const timeout = setTimeout(() => {
      delete requests[key];
      next();
    }, delay);

    requests[key] = { timeout, res };
  };
};

export const createRouteDebounce = (delay: number = 300) => debounceMiddleware(delay);