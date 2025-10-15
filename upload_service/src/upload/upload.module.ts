import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UploadService } from './upload.service';
import { AppConfigService } from '../config/config.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: (configService: AppConfigService) => ({
        secret: configService.jwt.secret,
        signOptions: { expiresIn: configService.jwt.expiresIn },
      }),
      inject: [AppConfigService],
    }),
  ],
  controllers: [],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
