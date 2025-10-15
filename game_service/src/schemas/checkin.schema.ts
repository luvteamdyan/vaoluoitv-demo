import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CheckInDocument = CheckIn & Document;

@Schema({ timestamps: true })
export class CheckIn {
  @Prop({ required: true, unique: true })
  user_id: string;

  @Prop({ required: true })
  username: string;

  @Prop({ default: 0, min: 0 })
  currentStreak: number;

  @Prop({ required: true })
  lastCheckinAt: Date;

  @Prop({ default: 0, min: 0 })
  lastRewardedStreak: number;

  @Prop({ default: 0, min: 0 })
  totalCheckins: number;
}

export const CheckInSchema = SchemaFactory.createForClass(CheckIn);
