import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
// import { AuthService } from '../services/implementation/user/auth.service';
import { UserModel } from '../../src/models/UserModel';
import Stripe from 'stripe';
import StatusCode from '../../src/types/statuscode';

// const authService = new AuthService();

interface AuthenticatedRequest extends Request {
    user?: any;
}

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const token = req.cookies.session;  
  if (!token) {
    res.status(StatusCode.UNAUTHORIZED).json({
      isAuthenticated: false,
      message: 'No authentication token provided'
    });
    return;
  }

  try {
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;

    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    res.status(StatusCode.UNAUTHORIZED).json({
      isAuthenticated: false,
      message: 'Invalid authentication token'
    });
  }
};

export function validateFirebaseSignInRequest(req: Request, res: Response, next: NextFunction): void {
  const { idToken } = req.body;
  if (!idToken) {
    res.status(StatusCode.BAD_REQUEST).json({
      success: false,
      message: 'ID token is required'
    });
    return; 
  }
  next(); 
}

// export async function validateSession(req: Request, res: Response, next: NextFunction): Promise<void> {
//   const token = req.cookies.session;
//   if (!token) {
//     res.status(StatusCode.UNAUTHORIZED).json({
//       success: false,
//       message: 'No session found'
//     });
//     return; 
//   }

//   try {
//     const user = await authService.validateSession(token);
//     if (!user) {
//       res.status(StatusCode.UNAUTHORIZED).json({
//         success: false,
//         message: 'Invalid session'
//       });
//       return;
//     }

//     req.user = user;
//     next(); 
//   } catch (error) {
//     console.error('Session validation error:', error);
//     res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// }

// Extend the Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
      stripeEvent?: Stripe.Event;
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction):Promise<any> => {
  try {
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
  
    
    // Adding user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(StatusCode.UNAUTHORIZED).json({ success: false, error: 'Authentication failed' });
  }
};