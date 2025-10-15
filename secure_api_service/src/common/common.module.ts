import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppConfigModule } from './config/app-config.module';
import { ApiKeyGuard } from './guards/api-key.guard';

@Module({
  imports: [ConfigModule, AppConfigModule],
  providers: [ApiKeyGuard],
  exports: [ApiKeyGuard, AppConfigModule],
})
export class CommonModule {}
