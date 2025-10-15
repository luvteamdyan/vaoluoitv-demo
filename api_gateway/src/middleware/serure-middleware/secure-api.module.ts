import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SecureApiService } from './secure-api.service';
import { SecureApiController } from './secure-api.controller';
import { AppConfigModule } from '@/config/app-config.module';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000, // 10 seconds timeout
      maxRedirects: 3,
    }),
    AppConfigModule,
  ],
  controllers: [SecureApiController],
  providers: [SecureApiService],
  exports: [SecureApiService],
})
export class SecureApiModule {}
