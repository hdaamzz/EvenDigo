import { Request, Response, NextFunction } from 'express';
import StatusCode from '../types/statuscode';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user'
}

export const adminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    if (!req.user) {
      res.status(StatusCode.UNAUTHORIZED).json({
        success: false,
        message: 'Authentication required',
        code: 'NO_USER'
      });
      return;
    }

    if (req.user.role !== UserRole.ADMIN) {
      res.status(StatusCode.FORBIDDEN).json({
        success: false,
        message: 'Admin access required',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Authorization failed',
      code: 'INTERNAL_ERROR'
    });
  }
};

export const userMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    if (!req.user) {
      res.status(StatusCode.UNAUTHORIZED).json({
        success: false,
        message: 'Authentication required',
        code: 'NO_USER'
      });
      return;
    }

    if (req.user.role !== UserRole.USER) {
      res.status(StatusCode.FORBIDDEN).json({
        success: false,
        message: 'User access required',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
      return;
    }

    next();
  } catch (error) {
    console.error('User middleware error:', error);
    res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Authorization failed',
      code: 'INTERNAL_ERROR'
    });
  }
};

export const requireRole = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: 'Authentication required',
          code: 'NO_USER'
        });
        return;
      }

      if (!roles.includes(req.user.role)) {
        res.status(StatusCode.FORBIDDEN).json({
          success: false,
          message: `Access denied. Required roles: ${roles.join(', ')}`,
          code: 'INSUFFICIENT_PERMISSIONS'
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Role middleware error:', error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Authorization failed',
        code: 'INTERNAL_ERROR'
      });
    }
  };
};

export const requireAnyRole = requireRole(UserRole.ADMIN, UserRole.USER);

export const requireAdminRole = requireRole(UserRole.ADMIN);

export const requireUserRole = requireRole(UserRole.USER);