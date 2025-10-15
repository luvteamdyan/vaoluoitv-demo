import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SecurityModule } from './security/security.module';
import { CommonModule } from './common/common.module';
import { AppConfigService } from './common/config/app-config.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    CommonModule,
    MongooseModule.forRootAsync({
      imports: [CommonModule],
      useFactory: (configService: AppConfigService) => ({
        uri: configService.mongodbUri,
      }),
      inject: [AppConfigService],
    }),
    SecurityModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
