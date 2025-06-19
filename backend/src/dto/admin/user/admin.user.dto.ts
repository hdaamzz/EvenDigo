export class AdminUserResponseDto {
  _id: string;
  email: string;
  name: string;
  role: string;
  phone?: string;
  profileImg?: string;
  location?: string;
  bio?: string;
  gender?: 'Male' | 'Female';
  status: string;
  verified?: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;

  constructor(user: any) {
    this._id = user._id;
    this.email = user.email;
    this.name = user.name;
    this.role = user.role;
    this.phone = user.phone;
    this.profileImg = user.profileImg;
    this.location = user.location;
    this.bio = user.bio;
    this.gender = user.gender;
    this.status = user.status;
    this.verified = user.verified;
    this.lastLogin = user.lastLogin;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }

  static fromUser(user: any): AdminUserResponseDto {
    return new AdminUserResponseDto(user);
  }

  static fromUsers(users: any[]): AdminUserResponseDto[] {
    return users.map(user => new AdminUserResponseDto(user));
  }
}

export class AdminVerificationResponseDto {
  _id: string;
  user_id: any; 
  status: 'Approved' | 'Rejected' | 'Pending';
  note?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(verification: any) {
    this._id = verification._id;
    this.user_id = verification.user_id;
    this.status = verification.status;
    this.note = verification.note;
    this.createdAt = verification.createdAt;
    this.updatedAt = verification.updatedAt;
  }

  static fromVerification(verification: any): AdminVerificationResponseDto {
    return new AdminVerificationResponseDto(verification);
  }

  static fromVerifications(verifications: any[]): AdminVerificationResponseDto[] {
    return verifications.map(verification => new AdminVerificationResponseDto(verification));
  }
}

export class UserActionRequestDto {
  userId: string;

  constructor(body: any) {
    this.userId = body.userId;
  }
}