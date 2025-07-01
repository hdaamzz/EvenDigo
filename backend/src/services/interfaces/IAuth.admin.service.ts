import { IAuthResponse, ILogin } from "../../models/interfaces/auth.interface";

export interface IAuthAdminService {
  login(credentials: ILogin): Promise<IAuthResponse>;
}