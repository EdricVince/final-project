export class RegisterDto {
  email: string;
  password: string;
  role_id?: number;
}

export class LoginDto {
  email: string;
  password: string;
}

export class UserOutDto {
  id: number;
  email: string;
  is_active: boolean;
  role_id: number;
}

export class LoginResponseDto {
  access_token: string;
  user: UserOutDto;
}

export class ProfileDto {
  id: number;
  email: string;
  name: string | null;
  avatar: string | null;
  role_id: number;
  is_active: boolean;
  created_at: Date;
}

export class UpdateProfileDto {
  name?: string;
  avatar?: string;
}
