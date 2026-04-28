import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { RegisterDto, LoginDto, UserOutDto, LoginResponseDto, ProfileDto, UpdateProfileDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
  ) {}

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  private async verifyPassword(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }

  private generateToken(payload: object, expiresInSeconds = 7 * 24 * 60 * 60): string {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const payloadStr = Buffer.from(JSON.stringify({
      ...payload,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
    })).toString('base64url');

    const secret = this.configService.get<string>('JWT_SECRET') || 'secret';
    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${header}.${payloadStr}`)
      .digest('base64url');

    return `${header}.${payloadStr}.${signature}`;
  }

  async register(registerDto: RegisterDto): Promise<UserOutDto> {
    const { email, password, role_id } = registerDto;

    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await this.hashPassword(password);

    try {
      const user = await this.usersService.create(email, hashedPassword, role_id);

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

    const passwordValid = await this.verifyPassword(password, user.password);
    if (!passwordValid) {
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

  async getMe(userId: number): Promise<ProfileDto> {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role_id: user.role_id,
      is_active: user.is_active,
      created_at: user.created_at,
    };
  }

  async updateMe(userId: number, dto: UpdateProfileDto): Promise<ProfileDto> {
    await this.usersService.update(userId, dto);
    return this.getMe(userId);
  }

  refreshToken(userId: number, email: string, roleId: number): { access_token: string } {
    const token = this.generateToken({ sub: userId, email, role_id: roleId });
    return { access_token: token };
  }

  private async verifySupabaseToken(supabaseToken: string): Promise<{ email: string; name?: string }> {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const serviceKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${supabaseToken}`,
        apikey: serviceKey!,
      },
    });

    if (!res.ok) {
      throw new UnauthorizedException('Invalid OAuth token');
    }

    const data = await res.json() as { email?: string; user_metadata?: { full_name?: string; name?: string } };
    if (!data.email) throw new UnauthorizedException('No email in OAuth token');

    return {
      email: data.email,
      name: data.user_metadata?.full_name ?? data.user_metadata?.name,
    };
  }

  async oauthLogin(supabaseToken: string): Promise<LoginResponseDto> {
    const { email, name } = await this.verifySupabaseToken(supabaseToken);

    let user = await this.usersService.findByEmail(email);

    if (!user) {
      const placeholder = await bcrypt.hash(crypto.randomUUID(), 12);
      user = await this.usersService.create(email, placeholder, 1);
      if (name) await this.usersService.update(user.id, { name });
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

  refreshFromToken(token: string): { access_token: string } {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new UnauthorizedException('Invalid token format');
    }
    const [header, payloadPart, signature] = parts;
    const secret = this.configService.get<string>('JWT_SECRET') || 'secret';
    const expectedSig = crypto.createHmac('sha256', secret).update(`${header}.${payloadPart}`).digest('base64url');
    if (expectedSig !== signature) {
      throw new UnauthorizedException('Invalid token signature');
    }
    let payload: { sub: number; email: string; role_id: number };
    try {
      payload = JSON.parse(Buffer.from(payloadPart!, 'base64url').toString('utf8'));
    } catch {
      throw new UnauthorizedException('Invalid token payload');
    }
    return this.refreshToken(payload.sub, payload.email, payload.role_id);
  }
}
