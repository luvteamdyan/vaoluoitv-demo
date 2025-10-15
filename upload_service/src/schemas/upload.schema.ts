import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UploadDocument = Upload & Document;

export enum UploadType {
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENT = 'document',
}

@Schema({ timestamps: true })
export class Upload {
  @Prop({ required: true, unique: true })
  upload_id: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  user_id: Types.ObjectId;

  @Prop({ required: true })
  file_name: string;

  @Prop({ required: true })
  original_name: string;

  @Prop({ required: true })
  mime_type: string;

  @Prop({ required: true })
  file_size: number;

  @Prop({ required: true, enum: UploadType })
  file_type: UploadType;

  @Prop()
  url?: string;

  @Prop({ type: [Object] })
  responsive_variants?: {
    name: string;
    width: number;
    height: number;
    url: string;
    size: number;
    quality?: number;
  }[];
}

export const UploadSchema = SchemaFactory.createForClass(Upload);
