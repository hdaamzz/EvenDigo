import { IUser } from 'src/models/interfaces/auth.interface';

export interface ITokenService {
  generateToken(user: IUser): string;
  generateRefreshToken(user: IUser): string;
  verifyToken(token: string): any; 
  verifyRefreshToken(token: string): any;
}
