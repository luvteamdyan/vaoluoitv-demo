import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AppConfigService } from '../config/app-config.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private configService: AppConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = context.switchToHttp().getRequest();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const apiKey = this.extractApiKeyFromHeader(request);

    if (!apiKey) {
      throw new UnauthorizedException('API key is required');
    }

    const validApiKey = this.configService.apiKey;

    if (!validApiKey) {
      throw new UnauthorizedException('API key configuration is missing');
    }

    if (apiKey !== validApiKey) {
      throw new UnauthorizedException('Invalid API key');
    }

    return true;
  }

  private extractApiKeyFromHeader(request: {
    headers: Record<string, string | string[] | undefined>;
  }): string | undefined {
    // Check for API key in x-api-key header
    const apiKey = request.headers['x-api-key'];
    if (apiKey && typeof apiKey === 'string') {
      return apiKey;
    }

    // Check for API key in Authorization header as Bearer token
    const authHeader = request.headers.authorization;
    if (authHeader && typeof authHeader === 'string') {
      const [type, token] = authHeader.split(' ');
      if (type === 'Bearer' && token) {
        return token;
      }
    }

    return undefined;
  }
}
