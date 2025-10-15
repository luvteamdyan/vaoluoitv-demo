import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type StreamKeyDocument = StreamKey & Document;

@Schema({ timestamps: true })
export class StreamKey {
  @Prop({ required: true, type: String, unique: true })
  key_value: string; // Fixed key value, manually entered

  @Prop({ required: true, type: Types.ObjectId, ref: 'User', unique: true })
  user_id: Types.ObjectId; // 1 user chỉ có 1 stream key

  @Prop({
    required: false,
    type: [{ type: Types.ObjectId, ref: 'Match' }],
    default: [],
  })
  matches: Types.ObjectId[]; // 1 stream key có thể có nhiều matches (lên lịch)

  @Prop({
    type: String,
    default: 'rtmp://entrypoint-livebong.cdnfastest.com/vaoluoitv/',
  })
  rtmp_url: string;

  @Prop({ default: Date.now })
  created_at: Date;

  @Prop({ type: Date, default: null })
  revoked_at: Date | null;

  @Prop({ type: String, default: null })
  description?: string; // Optional description for the stream key
}

export const StreamKeySchema = SchemaFactory.createForClass(StreamKey);

// Note: key_value và user_id đã có unique index từ @Prop decorator
// Không cần khai báo lại để tránh duplicate index warning

// Index for user queries (compound index)
StreamKeySchema.index({ user_id: 1, revoked_at: 1 });

// Index for match queries
StreamKeySchema.index({ matches: 1, revoked_at: 1 });
