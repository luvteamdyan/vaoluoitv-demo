import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SyncModule } from './sync/sync.module';
import { AuthModule } from './auth/auth.module';
import { AppConfigModule } from './config/app-config.module';
import { AppConfigService } from './config/app-config.service';

@Module({
  imports: [
    AppConfigModule,
    MongooseModule.forRootAsync({
      imports: [AppConfigModule],
      useFactory: (configService: AppConfigService) => ({
        uri: configService.mongodbUri,
      }),
      inject: [AppConfigService],
    }),
    AuthModule,
    SyncModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
