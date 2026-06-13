import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const adminKey: string | undefined = request.headers['x-admin-key'];
    const secret = this.configService.get<string>('ADMIN_SECRET');

    if (!adminKey || !secret) {
      throw new UnauthorizedException('Invalid admin key');
    }

    // Pad to equal length then compare in constant time (prevents timing attacks)
    const a = crypto.createHmac('sha256', 'sprk-admin').update(adminKey).digest();
    const b = crypto.createHmac('sha256', 'sprk-admin').update(secret).digest();

    if (!crypto.timingSafeEqual(a, b)) throw new UnauthorizedException('Invalid admin key');
    return true;
  }
}
