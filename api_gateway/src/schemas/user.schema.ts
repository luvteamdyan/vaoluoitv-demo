import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  CASTER = 'caster',
  STAFF = 'staff',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: false })
  display_name?: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: false })
  phone_number?: string;

  @Prop({ required: false })
  address?: string;

  @Prop({ default: false })
  sms_verified: boolean;

  @Prop({ default: 0 })
  points: number;

  @Prop({ required: false, unique: true, sparse: true })
  referral_code?: string;

  @Prop({ required: false, unique: true, sparse: true })
  invited_by?: string;

  @Prop({ default: UserRole.USER })
  role: UserRole;

  @Prop({ required: false })
  last_login?: Date;

  @Prop({ default: true })
  is_active: boolean;

  @Prop({ required: false, unique: true, sparse: true })
  external_id?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
