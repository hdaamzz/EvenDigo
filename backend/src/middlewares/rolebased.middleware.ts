import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../../src/models/UserModel';
import StatusCode from '../../src/types/statuscode';


export const userRole = async (req: Request, res: Response, next: NextFunction):Promise<any> => {
  try {
    // Get token from header
    const token = req.cookies.session;
    
    if (!token) {
      console.log('no token');
      
      return res.status(StatusCode.UNAUTHORIZED).json({ success: false, error: 'No authentication token, access denied' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;

    
    // Find user by id
    const user = await UserModel.findById(decoded.userId).select('-password');
        
    if (!user) {
      console.log('user not found');
      
      return res.status(StatusCode.UNAUTHORIZED).json({ success: false, error: 'Token is valid, but user not found' });
    }
    if (user.status=='blocked') {
      console.log('blocked');
      
      return res.status(StatusCode.UNAUTHORIZED).json({ success: false, error: 'Token is valid, but user has blocked' });
    }
    if (user.role !=='user') {
      console.log('not user');
      
        return res.status(StatusCode.UNAUTHORIZED).json({ success: false, error: 'Token is valid, but its not user' });
    }
  
    
    // Add user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Roelbased middleware error:', error);
    res.status(StatusCode.UNAUTHORIZED).json({ success: false, error: 'Authentication failed' });
  }
};


export const adminRole = async (req: Request, res: Response, next: NextFunction):Promise<any> => {
    try {
      // Get token from header
      const token = req.cookies.session;
      
      if (!token) {
        return res.status(StatusCode.UNAUTHORIZED).json({ success: false, error: 'No authentication token, access denied' });
      }
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
  
      
      // Find user by id
      const user = await UserModel.findById(decoded.userId).select('-password');    
      if (!user) {
        return res.status(StatusCode.UNAUTHORIZED).json({ success: false, error: 'Token is valid, but user not found' });
      }
      if (user.status=='blocked') {
        return res.status(StatusCode.UNAUTHORIZED).json({ success: false, error: 'Token is valid, but user has blocked' });
      }
      if (user.role !=='admin') {
          return res.status(StatusCode.UNAUTHORIZED).json({ success: false, error: 'Token is valid, but its not admin' });
        }
    
      
      // Add user to request
      req.user = user;
      next();
    } catch (error) {
      console.error('Roelbased middleware error:', error);
      res.status(StatusCode.UNAUTHORIZED).json({ success: false, error: 'Authentication failed' });
    }
  };