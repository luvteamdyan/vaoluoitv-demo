import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SpinsService } from './spins.service';
import { SpinsController } from './spins.controller';
import { Spin, SpinSchema } from '../schemas/spin.schema';
import { DailyMilestoneModule } from '../daily-milestone/daily-milestone.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Spin.name, schema: SpinSchema }]),
    DailyMilestoneModule,
    AuthModule,
  ],
  controllers: [SpinsController],
  providers: [SpinsService],
  exports: [SpinsService],
})
export class SpinsModule {}
