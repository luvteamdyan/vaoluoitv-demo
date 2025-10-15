import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DailyMilestoneService } from './daily-milestone.service';
import {
  DailyMilestone,
  DailyMilestoneSchema,
} from '../schemas/daily-milestone.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DailyMilestone.name, schema: DailyMilestoneSchema },
    ]),
  ],
  providers: [DailyMilestoneService],
  exports: [DailyMilestoneService],
})
export class DailyMilestoneModule {}
