import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WheelSegmentDocument = WheelSegment & Document;

@Schema({ timestamps: true })
export class WheelSegment {
  @Prop({ required: true })
  segment_id: string;

  @Prop({ required: true })
  label: string;

  @Prop({ required: true })
  color: string;

  @Prop({ required: true, min: 0, max: 100 })
  weight: number; // Xác suất từ 0-100%

  @Prop({ required: true })
  reward_type: string; // 'points', 'coins', 'item', etc.

  @Prop({ required: true })
  reward_value: number;

  @Prop({ default: true })
  is_active: boolean;

  @Prop({ default: 0 })
  order: number; // Thứ tự hiển thị trên wheel
}

export const WheelSegmentSchema = SchemaFactory.createForClass(WheelSegment);
