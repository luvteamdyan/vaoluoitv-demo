import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { MatchesService } from '@/matches/matches.service';
import { MatchesController } from '@/matches/matches.controller';
import { Match, MatchSchema } from '@/schemas/match.schema';
import { SecureApiModule } from '@/middleware/serure-middleware/secure-api.module';
import { StreamKeysModule } from '@/stream-keys/stream-keys.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Match.name, schema: MatchSchema }]),
    HttpModule,
    SecureApiModule,
    StreamKeysModule,
  ],
  controllers: [MatchesController],
  providers: [MatchesService],
  exports: [MatchesService],
})
export class MatchesModule {}
