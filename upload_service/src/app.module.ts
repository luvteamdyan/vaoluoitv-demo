import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { UploadModule } from './upload/upload.module';
import { AppConfigModule } from './config/config.module';
import { AppConfigService } from './config/config.service';
import { UploadMicroserviceController } from './upload/upload-microservice.controller';

@Module({
  imports: [
    AppConfigModule,
    MongooseModule.forRootAsync({
      useFactory: (configService: AppConfigService) => ({
        uri: configService.database.uri,
      }),
      inject: [AppConfigService],
    }),
    JwtModule.registerAsync({
      useFactory: (configService: AppConfigService) => ({
        secret: configService.jwt.secret,
        signOptions: { expiresIn: configService.jwt.expiresIn },
      }),
      inject: [AppConfigService],
    }),
    UploadModule,
  ],
  controllers: [UploadMicroserviceController],
  providers: [],
})
export class AppModule {}
