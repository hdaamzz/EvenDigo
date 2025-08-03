export interface UserJWTPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
  iat?: number;  
  exp?: number;  
}

