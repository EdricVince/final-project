import { IsEmail, IsString, MinLength, IsOptional, IsInt, Min, Max } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(3)
  role_id?: number;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(1)
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
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}
