import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DatabaseConfig,
  JwtConfig,
  UploadConfig,
  R2Config,
  CdnConfig,
  SecurityConfig,
  LoggingConfig,
} from './config.interface';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get nodeEnv(): string {
    return this.configService.get('NODE_ENV') || 'development';
  }

  get port(): number {
    return this.configService.get('PORT') || 3002;
  }

  get database(): DatabaseConfig {
    return {
      uri:
        this.configService.get('MONGODB_URI') ||
        'mongodb://localhost:27017/vaoluoi-upload',
    };
  }

  get jwt(): JwtConfig {
    return {
      secret: this.configService.get('JWT_SECRET') || 'your-secret-key',
      expiresIn: this.configService.get('JWT_EXPIRES_IN') || '24h',
    };
  }

  get upload(): UploadConfig {
    return {
      maxImageSize: 52428800, // 50MB
      maxVideoSize: 104857600, // 100MB
      allowedTypes: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'video/mp4',
        'video/webm',
        'video/avi',
      ],
      path: './uploads',
      responsive: {
        enabled: true,
        defaultBreakpoints: {
          mobile: { width: 480, height: 640, quality: 80 },
          tablet: { width: 768, height: 1024, quality: 85 },
          desktop: { width: 1920, height: 1080, quality: 90 },
        },
        maxVariants: 5,
        preserveAspectRatio: true,
      },
    };
  }

  get r2(): R2Config {
    return {
      endpoint:
        this.configService.get('R2_ENDPOINT') ||
        'https://your-account-id.r2.cloudflarestorage.com',
      accessKeyId:
        this.configService.get('R2_ACCESS_KEY_ID') || 'your-access-key',
      secretAccessKey:
        this.configService.get('R2_SECRET_ACCESS_KEY') || 'your-secret-key',
      bucketName:
        this.configService.get('R2_BUCKET_NAME') || 'your-bucket-name',
    };
  }

  get cdn(): CdnConfig {
    return {
      baseUrl:
        this.configService.get('CDN_BASE_URL') || 'https://cdn.vaoluoitv.com',
    };
  }

  get security(): SecurityConfig {
    return {
      apiKey: this.configService.get('API_KEY') || 'default-api-key',
    };
  }

  get logging(): LoggingConfig {
    return {
      level: this.configService.get('LOG_LEVEL') || 'info',
      file: this.configService.get('LOG_FILE') || './logs/upload-service.log',
    };
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get isTest(): boolean {
    return this.nodeEnv === 'test';
  }
}
