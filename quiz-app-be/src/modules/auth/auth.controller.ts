import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, UserOutDto, LoginResponseDto } from './dto/register.dto';

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

@Controller('api/v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto): Promise<ApiResponse<UserOutDto>> {
    const user = await this.authService.register(registerDto);
    return {
      code: HttpStatus.CREATED,
      message: 'User registered successfully',
      data: user,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<ApiResponse<LoginResponseDto>> {
    const result = await this.authService.login(loginDto);
    return {
      code: HttpStatus.OK,
      message: 'Login successful',
      data: result,
    };
  }
}
