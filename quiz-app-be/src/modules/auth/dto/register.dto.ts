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
