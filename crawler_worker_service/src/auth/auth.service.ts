import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AppConfigService } from '../config/app-config.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: AppConfigService,
  ) {}

  /**
   * Validate JWT token bằng cách gọi đến vaoluoi_be auth endpoint
   */
  async validateToken(token: string): Promise<any> {
    try {
      this.logger.debug('Validating token with vaoluoi_be service');

      const response = await firstValueFrom(
        this.httpService.get(
          `${this.configService.vaoluoiBeUrl}/api/v1/auth/validate`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        ),
      );

      if (response.data && response.data.user) {
        this.logger.debug(
          `Token validated successfully for user: ${response.data.user.email}`,
        );
        return response.data.user;
      }

      throw new UnauthorizedException(
        'Invalid token response from auth service',
      );
    } catch (error: any) {
      this.logger.error('Token validation failed:', error.message);

      if (error.response?.status === 401) {
        throw new UnauthorizedException('Invalid or expired token');
      }

      throw new UnauthorizedException('Token validation service unavailable');
    }
  }

  /**
   * Validate user role
   */
  validateUserRole(user: any, requiredRoles: string[]): boolean {
    if (!user || !user.role) {
      return false;
    }

    return requiredRoles.includes(user.role);
  }

  /**
   * Extract user info from validated token
   */
  extractUserFromToken(payload: any): any {
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      name: payload.name,
    };
  }
}
