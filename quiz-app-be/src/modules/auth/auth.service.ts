import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { RegisterDto, LoginDto, UserOutDto, LoginResponseDto } from './dto/register.dto';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
  ) {}

  private hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  private generateToken(payload: object): string {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const payloadStr = Buffer.from(JSON.stringify({
      ...payload,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (15 * 60), // 15 minutes
    })).toString('base64url');

    const secret = this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') || 'secret';
    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${header}.${payloadStr}`)
      .digest('base64url');

    return `${header}.${payloadStr}.${signature}`;
  }

  async register(registerDto: RegisterDto): Promise<UserOutDto> {
    const { email, password } = registerDto;

    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = this.hashPassword(password);

    try {
      const user = await this.usersService.create(email, hashedPassword);

      return {
        id: user.id,
        email: user.email,
        is_active: user.is_active,
        role_id: user.role_id,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const { email, password } = loginDto;

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const hashedPassword = this.hashPassword(password);
    if (user.password !== hashedPassword) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.is_active) {
      throw new UnauthorizedException('Account is not active');
    }

    const token = this.generateToken({
      sub: user.id,
      email: user.email,
      role_id: user.role_id,
    });

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        is_active: user.is_active,
        role_id: user.role_id,
      },
    };
  }
}
