import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WheelSpinResultDocument = WheelSpinResult & Document;

@Schema({ timestamps: true })
export class WheelSpinResult {
  @Prop({ required: true })
  user_id: string;

  @Prop({ required: true })
  segment_id: string;

  @Prop({ required: true })
  segment_label: string;

  @Prop({ required: true })
  reward_type: string;

  @Prop({ required: true })
  reward_value: number;

  @Prop({ default: false })
  reward_claimed: boolean;

  @Prop({ default: Date.now })
  spun_at: Date;
}

export const WheelSpinResultSchema =
  SchemaFactory.createForClass(WheelSpinResult);
