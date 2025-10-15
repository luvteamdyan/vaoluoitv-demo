import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppConfigService } from '../config/config.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: AppConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    // Kiểm tra API key trước
    if (token === this.configService.security.apiKey) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      request.user = { id: 'system', type: 'api_key' };
      return true;
    }

    // Nếu không phải API key, kiểm tra JWT
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const payload = this.jwtService.verify(token, {
        secret: this.configService.jwt.secret,
      });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] =
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (request.headers.authorization as string)?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
