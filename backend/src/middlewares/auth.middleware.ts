import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/UserModel';
import { ITokenService } from '../services/interfaces/user/auth/ITokenService';
import StatusCode from '../types/statuscode';
import { container } from '../configs/container';
import { cookieConfig } from '../configs/cookie.config';
import { IUser } from '../models/interfaces/auth.interface';

declare global {
  namespace Express {
    interface Request {
      user?: any; 
      stripeEvent?: any;
    }
  }
}

export function validateFirebaseSignInRequest(
  req: Request, 
  res: Response, 
  next: NextFunction
): void {
  const { idToken } = req.body;
  
  if (!idToken) {
    res.status(StatusCode.BAD_REQUEST).json({
      success: false,
      message: 'ID token is required',
    });
    return;
  }
  
  next();
}

export const authMiddleware = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const tokenService = container.resolve<ITokenService>('TokenService');
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;
    
    if (!accessToken && !refreshToken) {
      res.status(StatusCode.UNAUTHORIZED).json({ 
        success: false, 
        message: 'Authentication required',
        code: 'NO_TOKENS'
      });
      return;
    }
    
    if (accessToken) {
      try {
        const decoded = tokenService.verifyToken(accessToken);
        const user = await UserModel.findById(decoded.userId).select('-password');
        
        if (!user || user.status === 'blocked') {
          res.status(StatusCode.UNAUTHORIZED).json({ 
            success: false, 
            message: 'User not found or blocked',
            code: 'USER_INVALID'
          });
          return;
        }
        
        req.user = user;
        return next();
        
      } catch (tokenError) {
        console.log('Access token expired or invalid, attempting refresh...');
        
        if (refreshToken) {
          try {
            const refreshResult = await refreshAccessToken(refreshToken, tokenService, res);
            
            if (refreshResult.success && refreshResult.user) {
              req.user = refreshResult.user;
              return next();
            } else {
              clearAuthCookies(res);
              res.status(StatusCode.UNAUTHORIZED).json({ 
                success: false, 
                message: 'Session expired. Please login again.',
                code: 'SESSION_EXPIRED'
              });
              return;
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            clearAuthCookies(res);
            res.status(StatusCode.UNAUTHORIZED).json({ 
              success: false, 
              message: 'Session expired. Please login again.',
              code: 'REFRESH_FAILED'
            });
            return;
          }
        } else {
          res.status(StatusCode.UNAUTHORIZED).json({ 
            success: false, 
            message: 'Session expired. Please login again.',
            code: 'NO_REFRESH_TOKEN'
          });
          return;
        }
      }
    }
    
    if (refreshToken) {
      try {
        const refreshResult = await refreshAccessToken(refreshToken, tokenService, res);
        
        if (refreshResult.success && refreshResult.user) {
          req.user = refreshResult.user;
          return next();
        } else {
          clearAuthCookies(res);
          res.status(StatusCode.UNAUTHORIZED).json({ 
            success: false, 
            message: 'Session expired. Please login again.',
            code: 'SESSION_EXPIRED'
          });
          return;
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        clearAuthCookies(res);
        res.status(StatusCode.UNAUTHORIZED).json({ 
          success: false, 
          message: 'Session expired. Please login again.',
          code: 'REFRESH_FAILED'
        });
        return;
      }
    }
    
    res.status(StatusCode.UNAUTHORIZED).json({ 
      success: false, 
      message: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });
    
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ 
      success: false, 
      message: 'Authentication failed',
      code: 'INTERNAL_ERROR'
    });
  }
};

async function refreshAccessToken(
  refreshToken: string, 
  tokenService: ITokenService, 
  res: Response
): Promise<{ success: boolean; user?: IUser ; message?: string }> {
  try {
    const decodedRefresh = tokenService.verifyRefreshToken(refreshToken);
    const user = await UserModel.findById(decodedRefresh.userId).select('-password');
    
    if (!user || user.status === 'blocked') {
      return { 
        success: false, 
        message: 'User not found or blocked' 
      };
    }
    
    const newAccessToken = tokenService.generateToken(user);
    
    const newRefreshToken = tokenService.generateRefreshToken(user);
    
    const cookieOptions = cookieConfig.getTokenCookieOptions();
    res.cookie('accessToken', newAccessToken, cookieOptions.accessToken);
    res.cookie('refreshToken', newRefreshToken, cookieOptions.refreshToken);
    
    console.log('Token refreshed successfully for user:', user.email);    
    return { 
      success: true, 
      user: user 
    };
    
  } catch (error) {
    console.error('Refresh token verification failed:', error);
    return { 
      success: false, 
      message: 'Invalid refresh token' 
    };
  }
}

function clearAuthCookies(res: Response): void {
  const clearOptions = cookieConfig.getClearCookieOptions();
  res.clearCookie('accessToken', clearOptions);
  res.clearCookie('refreshToken', clearOptions);
}