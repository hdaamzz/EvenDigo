import { inject, injectable } from 'tsyringe';
import * as admin from 'firebase-admin';
import { IFirebaseAuthService } from 'src/services/interfaces/user/auth/IFirebaseAuthService';
import { IUserRepository } from 'src/repositories/interfaces/IUser.repository';
import { ITokenService } from 'src/services/interfaces/user/auth/ITokenService';
import { IUser } from 'src/models/interfaces/auth.interface';

@injectable()
export class FirebaseAuthService implements IFirebaseAuthService {
  constructor(
    @inject('UserRepository') private userRepository: IUserRepository,
    @inject('TokenService') private tokenService: ITokenService
  ) {}

  async verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
    try {
      return await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      console.error('ID token verification failed:', error);
      throw new Error('Invalid ID token');
    }
  }

  async authenticateWithFirebase(
    idToken: string, 
    name: string, 
    profileImg?: string
  ): Promise<{
    success: boolean;
    message: string;
    user?: Partial<IUser>;
    accessToken?: string;
    refreshToken?: string;
  }> {
    try {
      const decodedToken = await this.verifyIdToken(idToken);

      if (!decodedToken.email) {
        return {
          success: false,
          message: 'Email is required for authentication',
        };
      }

      let user = await this.userRepository.findUserByEmail(decodedToken.email);
      
      if (!user) {
        const newUser: Partial<IUser> = {
          name: name || decodedToken.name || 'Unknown',
          email: decodedToken.email,
          firebaseUid: decodedToken.uid,
          profileImg: profileImg || decodedToken.picture || '',
          role: 'user',
          status: 'active',
          provider: 'google',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        user = await this.userRepository.create(newUser as IUser);
        
        if (!user) {
          throw new Error('Failed to create user');
        }
      } else {
        if (!user._id) {
          throw new Error('User ID is undefined');
        }

        if (user.status === 'blocked') {
          return {
            success: false,
            message: 'Account is blocked. Please contact support.',
          };
        }

        const updateData: Partial<IUser> = {
          firebaseUid: decodedToken.uid,
          lastLogin: new Date(),
          updatedAt: new Date(),
        };
        user = await this.userRepository.updateById(user._id, updateData);
        
        if (!user) {
          throw new Error('Failed to update user');
        }
      }

      if (!user || !user._id) {
        throw new Error('User not found after creation/update');
      }

      
      const accessToken = this.tokenService.generateToken(user);
      const refreshToken = this.tokenService.generateRefreshToken(user);

      if (!accessToken || !refreshToken) {
        throw new Error('Failed to generate authentication tokens');
      }

      const userResponse = {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      };      

      return {
        success: true,
        message: 'Authentication successful',
        user: userResponse,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      console.error('Firebase authentication error:', error);
      
      // Return appropriate error message
      if (error instanceof Error) {
        if (error.message.includes('ID token')) {
          return {
            success: false,
            message: 'Invalid authentication token. Please try signing in again.',
          };
        }
        if (error.message.includes('blocked')) {
          return {
            success: false,
            message: 'Account is blocked. Please contact support.',
          };
        }
      }

      return {
        success: false,
        message: 'Authentication failed. Please try again later.',
      };
    }
  }
}