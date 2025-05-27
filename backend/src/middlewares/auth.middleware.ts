import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../../src/models/UserModel';
import { ITokenService } from '../../src/services/interfaces/user/auth/ITokenService';
import StatusCode from '../../src/types/statuscode';
import { container } from '../../src/configs/container';

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
    
    // First, try to authenticate with access token
    if (accessToken) {
      try {
        const decoded = tokenService.verifyToken(accessToken);
        const user = await UserModel.findById(decoded.userId).select('-password');
        
        if (!user || user.status === 'blocked') {
          res.status(StatusCode.UNAUTHORIZED).json({ 
            success: false, 
            error: 'User not found or blocked' 
          });
          return;
        }
        
        req.user = user;
        return next();
        
      } catch (tokenError) {
        console.log('Access token verification failed:', tokenError);
      }
    }
    
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
       res.status(StatusCode.UNAUTHORIZED).json({ 
        success: false, 
        error: 'Authentication required' 
      });
      return;
    }
    
    try {
      const decodedRefresh = tokenService.verifyRefreshToken(refreshToken);
      const user = await UserModel.findById(decodedRefresh.userId).select('-password');
      
      if (!user || user.status === 'blocked') {
         res.status(StatusCode.UNAUTHORIZED).json({ 
          success: false, 
          error: 'User not found or blocked' 
        });
        return
      }
      
      const newAccessToken = tokenService.generateToken(user);
      
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        maxAge: 15 * 60 * 1000,
        ...(process.env.NODE_ENV === 'production' && {
          domain: process.env.CLIENT_DOMAIN || undefined
        })
      };
      
      res.cookie('accessToken', newAccessToken, cookieOptions);
      
      req.user = user;
      next();
      
    } catch (refreshError) {
      console.error('Refresh token verification failed:', refreshError);
       res.status(StatusCode.UNAUTHORIZED).json({ 
        success: false, 
        error: 'Invalid refresh token' 
      });
      return
    }
    
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ 
      success: false, 
      error: 'Authentication failed' 
    });
  }
};