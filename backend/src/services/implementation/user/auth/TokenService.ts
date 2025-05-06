import { injectable } from 'tsyringe';
import * as jwt from 'jsonwebtoken';
import { ITokenService } from '../../../../../src/services/interfaces/user/auth/ITokenService';
import { IUser } from '../../../../../src/models/interfaces/auth.interface';

@injectable()
export class TokenService implements ITokenService {
  constructor() {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
  }

  generateToken(user: IUser): string {
    return jwt.sign(
      {
        userId: user._id,
        email: user.email,
        name: user.name
      },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );
  }

  verifyToken(token: string): any {
    return jwt.verify(token, process.env.JWT_SECRET!);
  }
}