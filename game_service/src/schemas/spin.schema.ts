import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SpinDocument = Spin & Document;

@Schema({ timestamps: true })
export class Spin {
  @Prop({ required: true, unique: true })
  user_id: string;

  @Prop({ required: true })
  username: string;

  @Prop({ default: 0, min: 0 })
  count: number;

  @Prop({ required: false })
  external_id?: string;
}

export const SpinSchema = SchemaFactory.createForClass(Spin);
