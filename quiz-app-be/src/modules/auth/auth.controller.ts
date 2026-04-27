import { Controller, Post, Get, Put, Body, HttpCode, HttpStatus, UseGuards, HttpException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, UserOutDto, LoginResponseDto, ProfileDto, UpdateProfileDto } from './dto/register.dto';
import { JwtGuard } from '../../core/guards/jwt.guard';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import type { CurrentUserData } from '../../core/decorators/current-user.decorator';

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

  @Get('me')
  @UseGuards(JwtGuard)
  async getMe(@CurrentUser() user: CurrentUserData): Promise<ApiResponse<ProfileDto>> {
    const profile = await this.authService.getMe(user.id);
    return {
      code: HttpStatus.OK,
      message: 'Profile retrieved successfully',
      data: profile,
    };
  }

  @Put('me')
  @UseGuards(JwtGuard)
  async updateMe(
    @CurrentUser() user: CurrentUserData,
    @Body() dto: UpdateProfileDto,
  ): Promise<ApiResponse<ProfileDto>> {
    const profile = await this.authService.updateMe(user.id, dto);
    return {
      code: HttpStatus.OK,
      message: 'Profile updated successfully',
      data: profile,
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard)
  refresh(@CurrentUser() user: CurrentUserData): ApiResponse<{ access_token: string }> {
    const result = this.authService.refreshToken(user.id, user.email, user.role_id);
    return { code: HttpStatus.OK, message: 'Token refreshed', data: result };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(): ApiResponse<null> {
    return { code: HttpStatus.OK, message: 'Logged out successfully', data: null };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  resetPassword(@Body() body: { email: string }): ApiResponse<null> {
    if (!body.email) throw new HttpException('Email is required', HttpStatus.BAD_REQUEST);
    return { code: HttpStatus.OK, message: 'If the email exists, a reset link has been sent', data: null };
  }
}
