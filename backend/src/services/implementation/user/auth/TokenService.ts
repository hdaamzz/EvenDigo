import { injectable } from 'tsyringe';
import * as jwt from 'jsonwebtoken';
import { ITokenService } from '../../../../services/interfaces/user/auth/ITokenService';
import { IUser } from '../../../../models/interfaces/auth.interface';

@injectable()
export class TokenService implements ITokenService {
  constructor() {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    if (!process.env.REFRESH_TOKEN_SECRET) {
      throw new Error('REFRESH_TOKEN_SECRET is not defined in environment variables');
    }
  }

  generateToken(user: IUser): string {
    return jwt.sign(
      {
        userId: user._id,
        email: user.email,
        name: user.name,
        role: user.role, 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' } 
    );
  }

  generateRefreshToken(user: IUser): string {
    return jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: '7d' } 
    );
  }

  verifyToken(token: string): any {
    try {
      return jwt.verify(token, process.env.JWT_SECRET!);
    } catch (error) {
      throw new Error('Invalid access token');
    }
  }

  verifyRefreshToken(token: string): any {
    try {
      return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!);
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }
}