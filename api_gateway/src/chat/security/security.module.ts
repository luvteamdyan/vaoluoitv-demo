import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from '@nestjs-modules/ioredis';
import { SanitizationService } from './sanitization.service';
import { RateLimitService } from './rate-limit.service';
import { AuditLoggerService } from './audit-logger.service';
import { WebSocketSecurityGuard } from './websocket-security.guard';
import { MonitoringService } from './monitoring.service';
import { AppConfigService } from '@/config/app-config.service';

@Module({
  imports: [
    ConfigModule,
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (appConfigService: AppConfigService) => ({
        type: 'single',
        url: appConfigService.redisUrl,
      }),
      inject: [AppConfigService],
    }),
  ],
  providers: [
    SanitizationService,
    RateLimitService,
    AuditLoggerService,
    WebSocketSecurityGuard,
    MonitoringService,
  ],
  exports: [
    SanitizationService,
    RateLimitService,
    AuditLoggerService,
    WebSocketSecurityGuard,
    MonitoringService,
  ],
})
export class SecurityModule {}
