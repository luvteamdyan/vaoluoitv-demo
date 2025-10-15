import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MatchDocument = Match & Document;

export enum MatchStatus {
  SCHEDULED = 'scheduled',
  LIVE = 'live',
  FINISHED = 'finished',
  CANCELLED = 'cancelled',
  NOT_STARTED = 'not_started', // Thêm status này dựa trên "Chưa bắt đầu"
}

export enum MatchType {
  LEAGUE = 'league',
  CUP = 'cup',
  FRIENDLY = 'friendly',
  CHAMPIONSHIP = 'championship',
  INTERNATIONAL = 'international', // Cho các trận giao hữu quốc tế
}

@Schema({ _id: false })
export class Team {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  logo: string;

  @Prop()
  link?: string;

  @Prop()
  coach?: string;

  @Prop()
  slug?: string;
}

@Schema({ _id: false })
export class League {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  logo: string;

  @Prop()
  color?: string;

  @Prop()
  code?: string;
}

@Schema({ timestamps: true })
export class Match {
  @Prop({ required: true, type: Team })
  home_team: Team;

  @Prop({ required: true, type: Team })
  away_team: Team;

  @Prop({ required: true, type: League })
  league: League;

  @Prop({ required: true })
  match_time: string; // Giờ thi đấu từ API

  @Prop({ required: true })
  match_date: string; // Ngày thi đấu

  @Prop({ required: true })
  status: MatchStatus;

  @Prop()
  status_code?: string; // Mã trạng thái từ API (NS, LIVE, etc.)

  @Prop({ default: MatchType.LEAGUE })
  type: MatchType;

  // Score information
  @Prop({ default: 0 })
  home_score: number;

  @Prop({ default: 0 })
  away_score: number;

  // System fields
  @Prop()
  venue?: string;

  @Prop({ default: true })
  is_active: boolean;

  @Prop({ default: false })
  is_featured: boolean;

  @Prop({ default: '' })
  description: string;

  @Prop({ default: [] })
  tags: string[];

  // Stream Key Reference
  @Prop({ type: Types.ObjectId, ref: 'StreamKey', default: null })
  stream_key_id?: Types.ObjectId;
}

export const MatchSchema = SchemaFactory.createForClass(Match);

// Tạo indexes
MatchSchema.index({ match_date: 1 });
MatchSchema.index({ status: 1 });
MatchSchema.index({ is_active: 1 });
MatchSchema.index({ 'league.id': 1 });
MatchSchema.index({ 'home_team.id': 1, 'away_team.id': 1 });
MatchSchema.index({ stream_key_id: 1 }); // Index cho stream key lookup
// Compound index để đảm bảo tính duy nhất cho match
MatchSchema.index(
  { 'home_team.id': 1, 'away_team.id': 1, match_date: 1 },
  { unique: true },
);
