import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StreamKeysService } from '@/stream-keys/stream-keys.service';
import { StreamKeysController } from '@/stream-keys/stream-keys.controller';
import { StreamKey, StreamKeySchema } from '@/schemas/stream-key.schema';
import { Match, MatchSchema } from '@/schemas/match.schema';
import { User, UserSchema } from '@/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StreamKey.name, schema: StreamKeySchema },
      { name: Match.name, schema: MatchSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [StreamKeysController],
  providers: [StreamKeysService],
  exports: [StreamKeysService],
})
export class StreamKeysModule {}
