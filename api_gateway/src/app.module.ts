import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { AuthModule } from '@/auth/auth.module';
import { UsersModule } from '@/users/users.module';
import { StreamKeysModule } from '@/stream-keys/stream-keys.module';
import { AppConfigModule } from '@/config/app-config.module';
import { AppConfigService } from '@/config/app-config.service';
import { MiddlewareModule } from '@/middleware/middleware.module';
import { AdsConfigModule } from '@/ads-config/ads-config.module';
import { ChatModule } from '@/chat/chat.module';
import { MatchesModule } from './matches/matches.module';
import { WebhookModule } from '@/webhook/webhook.module';

@Module({
  imports: [
    HttpModule,
    AppConfigModule,
    MongooseModule.forRootAsync({
      imports: [AppConfigModule],
      useFactory: (configService: AppConfigService) => ({
        uri: configService.mongodbUri,
      }),
      inject: [AppConfigService],
    }),
    AuthModule,
    UsersModule,
    MatchesModule,
    StreamKeysModule,
    MiddlewareModule,
    AdsConfigModule,
    ChatModule,
    WebhookModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
