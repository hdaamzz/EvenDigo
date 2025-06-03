

export interface User{
    id?:string;
    _id:string;
    name:string;
    email:string;
    password?:string;
    role?:string;
    phone?:string;
    status?:string;
    firebaseUid?:string;
    profileImg?:string;
    provider?:string;
    bio?:string;
    location?:string;
    gender?:string;
    dateOfBirth?:string;
    rating?:number;
    createdAt?:string;
    verified?:boolean;
    profileImgPublicId?: string;
}


export interface IRegister{
    name:string;
    email:string;
    password:string;
    confirmPassword:string;
}

export interface ILogin{
    email:string;
    password:string;
}


export interface AuthState {
    user: User | null;
    token: string | null;
    loading: boolean;
    error: string | null;
    isAuthenticated: boolean;
}

export interface CloudinaryResponse {
    success: boolean;
    message: string;
    imageUrl?: string;
    publicId?: string;
  }

  export interface VerificationRequestResponse {
    success: boolean;
    message: string;
  }