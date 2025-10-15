import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get mongodbUri(): string {
    const uri = this.configService.get<string>('MONGODB_URI');
    if (!uri) {
      throw new Error('MONGODB_URI environment variable is required');
    }
    return uri;
  }

  get jwtSecret(): string {
    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is required');
    }
    return secret;
  }

  get jwtExpiresIn(): string {
    return this.configService.get<string>('JWT_EXPIRES_IN') || '7d';
  }

  get port(): number {
    return this.configService.get<number>('PORT') || 3000;
  }

  get nodeEnv(): string {
    return this.configService.get<string>('NODE_ENV') || 'development';
  }

  get secureApiBaseUrl(): string {
    return (
      this.configService.get<string>('SECURE_API_BASE_URL') ||
      'http://localhost:3001'
    );
  }

  get secureApiKey(): string {
    const key = this.configService.get<string>('SECURE_API_KEY');
    if (!key) {
      throw new Error('SECURE_API_KEY environment variable is required');
    }
    return key;
  }

  get uploadServiceUrl(): string {
    return (
      this.configService.get<string>('UPLOAD_SERVICE_URL') ||
      'http://localhost:3002'
    );
  }

  get uploadServiceApiKey(): string {
    const key = this.configService.get<string>('UPLOAD_SERVICE_API_KEY');
    if (!key) {
      throw new Error(
        'UPLOAD_SERVICE_API_KEY environment variable is required',
      );
    }
    return key;
  }

  get uploadMicroservicePort(): number {
    return this.configService.get<number>('UPLOAD_MICROSERVICE_PORT') || 3002;
  }

  get externalUserApiUrl(): string {
    const url = this.configService.get<string>('EXTERNAL_USER_API_URL');
    if (!url) {
      throw new Error('EXTERNAL_USER_API_URL environment variable is required');
    }
    return url;
  }

  get externalUserApiKey(): string {
    const key = this.configService.get<string>('EXTERNAL_USER_API_KEY');
    if (!key) {
      throw new Error('EXTERNAL_USER_API_KEY environment variable is required');
    }
    return key;
  }

  get redisUrl(): string {
    const url = this.configService.get<string>('REDIS_URL');
    if (!url && this.nodeEnv === 'production') {
      throw new Error(
        'REDIS_URL environment variable is required in production',
      );
    }
    return url || '';
  }

  get redisEnabled(): boolean {
    return (
      !!this.configService.get<string>('REDIS_URL') ||
      this.nodeEnv === 'production'
    );
  }

  get authWebhookUrl(): string {
    return (
      this.configService.get<string>('AUTH_WEBHOOK_URL') ||
      'https://auth.luck8event.com/api/v1'
    );
  }
}
