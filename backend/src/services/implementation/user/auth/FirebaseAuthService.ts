import { inject, injectable } from 'tsyringe';

import * as admin from 'firebase-admin';
import { IFirebaseAuthService } from 'src/services/interfaces/user/auth/IFirebaseAuthService';
import { IUserRepository } from 'src/repositories/interfaces/IUser.repository';
import { ITokenService } from 'src/services/interfaces/user/auth/ITokenService';
import { IUser } from 'src/models/interfaces/auth.interface';

@injectable()
export class FirebaseAuthService implements IFirebaseAuthService {
  constructor(
    @inject("UserRepository") private userRepository: IUserRepository,
    @inject("TokenService") private tokenService: ITokenService
  ) {}

  async verifyIdToken(idToken: string): Promise<any> {
    return admin.auth().verifyIdToken(idToken);
  }

  async authenticateWithFirebase(idToken: string, name: string, profileImg?: string): Promise<{
    success: boolean;
    message: string;
    user?: IUser;
    token?: string;
  }> {
    try {
      const decodedToken = await this.verifyIdToken(idToken);

      if (!decodedToken.email) {
        return {
          success: false,
          message: 'Email is required for authentication'
        };
      }

      let user = await this.userRepository.findUserByEmail(decodedToken.email);

      if (!user) {
        const newUser: IUser = {
          name: name || decodedToken.name || 'Unknown',
          email: decodedToken.email,
          firebaseUid: decodedToken.uid,
          profileImg: profileImg || decodedToken.picture || '',
          role: 'user',
          status: 'active',
          provider: 'google',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        user = await this.userRepository.createUser(newUser);
      } else {
        if (!user._id) {
          throw new Error('User ID is undefined');
        }
        user = await this.userRepository.updateUser(user._id, {
          firebaseUid: decodedToken.uid,
          lastLogin: new Date()
        });
      }

      // At this point, we know user is not null due to previous checks
      const token = this.tokenService.generateToken(user as IUser);

      const { firebaseUid, createdAt, updatedAt, ...safeUser } = user as IUser;

      return {
        success: true,
        message: 'Authentication successful',
        user: safeUser as IUser,
        token
      };
    } catch (error) {
      console.error('Firebase authentication error:', error);
      return {
        success: false,
        message: 'Authentication failed. Please try again later.'
      };
    }
  }
}