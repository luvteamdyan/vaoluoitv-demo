import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AdsConfigDocument = AdsConfig & Document;

@Schema({ timestamps: true })
export class AdsConfig {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ required: true, unique: true })
  position:
    | 'main_ads'
    | 'sub_ads_1'
    | 'sub_ads_2'
    | 'sub_ads_3'
    | 'hero_main'
    | 'hero_left'
    | 'hero_right';

  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop()
  media_url?: string;

  @Prop()
  media_type: 'image' | 'video';

  @Prop()
  upload_id?: string; // Reference to upload document

  @Prop()
  link_url?: string;

  @Prop({ default: true })
  is_active: boolean;

  @Prop({ default: 0 })
  click_count: number;

  @Prop()
  alt_text?: string;

  @Prop()
  target_audience?: string;

  @Prop()
  start_date?: Date;

  @Prop()
  end_date?: Date;

  @Prop({ default: 1 })
  priority: number;

  @Prop({ type: Object })
  custom_data?: Record<string, any>;

  createdAt?: Date;
  updatedAt?: Date;
}

export const AdsConfigSchema = SchemaFactory.createForClass(AdsConfig);
