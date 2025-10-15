import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ChatMessageDocument = ChatMessage & Document;

@Schema({ timestamps: true })
export class ChatMessage {
  @Prop({ required: true })
  matchId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  username: string;

  @Prop()
  display_name?: string;

  @Prop({ required: true })
  message: string;

  @Prop({ default: false })
  isModerated: boolean;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop()
  deletedAt?: Date;

  @Prop()
  deletedBy?: string;

  @Prop({ default: 'user' })
  userType: 'user' | 'moderator' | 'admin';

  @Prop()
  avatar?: string;

  @Prop({ default: Date.now })
  timestamp: Date;
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);

// Indexes for better performance
ChatMessageSchema.index({ matchId: 1, timestamp: -1 });
ChatMessageSchema.index({ userId: 1 });
ChatMessageSchema.index({ isDeleted: 1 });
