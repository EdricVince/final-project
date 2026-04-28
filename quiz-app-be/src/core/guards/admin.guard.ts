import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const adminKey = request.headers['x-admin-key'];
    const secret = this.configService.get<string>('ADMIN_SECRET');

    if (!adminKey || !secret || adminKey !== secret) {
      throw new UnauthorizedException('Invalid admin key');
    }
    return true;
  }
}
