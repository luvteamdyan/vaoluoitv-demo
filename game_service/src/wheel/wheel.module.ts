import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WheelController } from './wheel.controller';
import { WheelService } from './wheel.service';
import {
  WheelSegment,
  WheelSegmentSchema,
} from '../schemas/wheel-segment.schema';
import {
  WheelSpinResult,
  WheelSpinResultSchema,
} from '../schemas/wheel-spin-result.schema';
import { PointsModule } from '../points/points.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WheelSegment.name, schema: WheelSegmentSchema },
      { name: WheelSpinResult.name, schema: WheelSpinResultSchema },
    ]),
    PointsModule,
  ],
  controllers: [WheelController],
  providers: [WheelService],
  exports: [WheelService],
})
export class WheelModule {}
