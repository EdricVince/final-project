import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

export interface JwtPayload {
  sub: number;
  email: string;
  role_id: number;
  iat: number;
  exp: number;
}

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader: string | undefined = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.split(' ')[1];
    const payload = this.verifyToken(token);

    request.user = {
      id: payload.sub,
      email: payload.email,
      role_id: payload.role_id,
    };

    return true;
  }

  private verifyToken(token: string): JwtPayload {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new UnauthorizedException('Invalid token format');
    }

    const [header, payloadPart, signature] = parts;
    const secret = this.configService.get<string>('JWT_SECRET') || 'secret';

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${header}.${payloadPart}`)
      .digest('base64url');

    if (expectedSignature !== signature) {
      throw new UnauthorizedException('Invalid token signature');
    }

    let payload: JwtPayload;
    try {
      payload = JSON.parse(Buffer.from(payloadPart, 'base64url').toString('utf8'));
    } catch {
      throw new UnauthorizedException('Invalid token payload');
    }

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      throw new UnauthorizedException('Token expired');
    }

    return payload;
  }
}
