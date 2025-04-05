import { IAuthResponse, ILogin } from "../../../models/interfaces/auth.interface";
import { reHash } from "../../../utils/helpers";
import * as jwt from 'jsonwebtoken';
import { IAuthAdminService } from "../../../../src/services/interfaces/IAuth.admin.service";
import { inject, injectable } from "tsyringe";
import { IUserRepository } from "../../../../src/repositories/interfaces/IUser.repository";

@injectable()
export class AdminAuthService implements IAuthAdminService{

    constructor(
        @inject("UserRepository") private userRepository: IUserRepository,
    ) {}

    async login(credentials: ILogin): Promise<IAuthResponse> {
        console.log(credentials);
        
        const user = await this.userRepository.findUserByEmail(credentials.email);
        if (!user) {
            return {
                success: false,
                message: "Invalid email or password"
            };
        }
        if (!user.password) {
            throw new Error('Password is undefined'); 
        }
    
        const isPasswordMatch = await reHash(credentials.password, user.password);
        if (!isPasswordMatch) {
            return {
                success: false,
                message: "Invalid email or password"
            };
        }
        if (!user._id) {
            throw new Error('User ID is undefined'); 
        }
        if (user.role !== 'admin') {
            return {
                success: false,
                message: "You are not an authorized person"
            };
        }
        await this.userRepository.updateUserLastLogin(user._id);
    
        const token = jwt.sign({
            userId: user._id,
            email: user.email,
            name: user.name
        },
        process.env.JWT_SECRET!,
        { expiresIn: '24h' }
        );
    
        const userResponse = {
            id: user._id,
            email: user.email,
            name: user.name
        };
        return {
            success: true,
            message: 'Login successful',
            token,
            user: userResponse
        };
    }
}