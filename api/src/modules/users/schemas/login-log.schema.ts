import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'LoginLogs' })
export class LoginLog {
  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  user_id?: Types.ObjectId;

  @Prop({ required: true, index: true })
  emailAttempted: string;

  @Prop()
  userAgent?: string;

  @Prop({ index: true })
  ipAddress?: string;

  @Prop({ required: true, index: true })
  status: string; // 'success', 'failed', 'blocked'

  @Prop()
  failureReason?: string;

  @Prop()
  deviceName?: string;

  @Prop()
  deviceType?: string; // Mobile, Tablet, Desktop

  @Prop()
  deviceInfo?: string; // Browser on OS

  @Prop()
  location?: string;

  @Prop({ type: Date })
  loginAt?: Date;

  // Indexes for better query performance
  static indexes = [
    { user_id: 1, createdAt: -1 },
    { emailAttempted: 1, createdAt: -1 },
    { status: 1, createdAt: -1 },
    { ipAddress: 1, createdAt: -1 },
  ];
}

export type LoginLogDocument = LoginLog & Document;

export const LoginLogSchema = SchemaFactory.createForClass(LoginLog);


