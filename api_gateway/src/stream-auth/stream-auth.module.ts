import { Module } from '@nestjs/common';
import { StreamAuthController } from './stream-auth.controller';
import { StreamAuthService } from './stream-auth.service';
import { StreamKeysModule } from '@/stream-keys/stream-keys.module';
import { SecureApiModule } from '@/middleware/serure-middleware/secure-api.module';

@Module({
  imports: [StreamKeysModule, SecureApiModule],
  controllers: [StreamAuthController],
  providers: [StreamAuthService],
  exports: [StreamAuthService],
})
export class StreamAuthModule {}
