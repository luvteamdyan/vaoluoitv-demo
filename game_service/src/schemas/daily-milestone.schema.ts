import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DailyMilestoneDocument = DailyMilestone & Document;

@Schema({ timestamps: true })
export class DailyMilestone {
  @Prop({ required: true })
  user_id: string;

  @Prop({ required: true })
  game_type: string; // '2048', 'flappy', etc.

  @Prop({ required: true })
  date: string; // YYYY-MM-DD format

  @Prop({ type: [Number], default: [] })
  achieved_milestones: number[]; // Array of milestone values achieved today

  @Prop({ default: 0 })
  total_spins_earned: number; // Total spins earned today
}

export const DailyMilestoneSchema =
  SchemaFactory.createForClass(DailyMilestone);

// Create compound index for efficient queries
DailyMilestoneSchema.index(
  { user_id: 1, game_type: 1, date: 1 },
  { unique: true },
);
