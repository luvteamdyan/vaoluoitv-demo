import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { MatchSyncService } from './services/match-sync.service';
import { ScheduledSyncService } from './services/scheduled-sync.service';
import { MatchSyncController } from './controllers/match-sync.controller';
import { Match, MatchSchema } from '../schemas/match.schema';
import { ChatMessage, ChatMessageSchema } from '../schemas/chat-message.schema';
import { AppConfigService } from '../config/app-config.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Match.name, schema: MatchSchema },
      { name: ChatMessage.name, schema: ChatMessageSchema },
    ]),
    HttpModule,
    ScheduleModule.forRoot(),
    ConfigModule,
    AuthModule,
  ],
  controllers: [MatchSyncController],
  providers: [MatchSyncService, ScheduledSyncService, AppConfigService],
  exports: [MatchSyncService],
})
export class SyncModule {}
