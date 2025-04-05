import { IAuthResponse, ILogin } from "../../../src/models/interfaces/auth.interface";

export interface IAuthAdminService {
  login(credentials: ILogin): Promise<IAuthResponse>;
}