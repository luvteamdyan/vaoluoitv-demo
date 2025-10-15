import { Module } from '@nestjs/common';
import { SecureApiModule } from './serure-middleware/secure-api.module';
import { UploadModule } from './upload-middleware/upload.module';

@Module({
  imports: [SecureApiModule, UploadModule],
  exports: [SecureApiModule, UploadModule],
})
export class MiddlewareModule {}
