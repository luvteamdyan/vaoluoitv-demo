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

  get port(): number {
    return this.configService.get<number>('PORT') || 3004;
  }

  get nodeEnv(): string {
    return this.configService.get<string>('NODE_ENV') || 'development';
  }

  get syncApiUrl(): string {
    return (
      this.configService.get<string>('SYNC_API_URL') ||
      'https://api.football-data.org/v4'
    );
  }

  get autoSyncEnabled(): boolean {
    return this.configService.get<boolean>('AUTO_SYNC_ENABLED') || false;
  }

  get syncInterval(): number {
    return this.configService.get<number>('SYNC_INTERVAL_MINUTES') || 30;
  }

  get jwtSecret(): string {
    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is required');
    }
    return secret;
  }

  get vaoluoiBeUrl(): string {
    return (
      this.configService.get<string>('VAOLUOI_BE_URL') ||
      'http://localhost:3000'
    );
  }

  get scheduledSyncEnabled(): boolean {
    return this.configService.get<boolean>('SCHEDULED_SYNC_ENABLED') || false;
  }
}
