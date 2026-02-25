import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'UserSessions' })
export class UserSession {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  user_id: Types.ObjectId;

 
  @Prop({ required: true, unique: true, index: true })
  accessToken: string;

  @Prop({ required: true })
  refreshToken: string;

  @Prop({ required: true })
  deviceId: string;

  @Prop()
  deviceInfo?: string;


  @Prop({ required: false })
  deviceName?: string;

  @Prop({ required: false })
  deviceType?: string; // Mobile, Tablet, Desktop

  @Prop({ required: false })
  userAgent?: string;

  @Prop()
  location?: string; 

  // createdAt will be set by timestamps, but included here for typing
  @Prop()
  createdAt?: Date; 

  @Prop({ required: false })
  ipAddress?: string;

  @Prop({ type: Date, required: true })
  expiresAt: Date;  

  @Prop({ type: Date, required: true })
  refreshExpiresAt: Date;

  @Prop({ default: true })
  declare isActive: boolean;

  @Prop({ type: Date, default: Date.now })
  lastUsedAt: Date;

  @Prop({ type: Date })
  revokedAt?: Date;

  @Prop({ required: false })
  revokedBy?: string; // Reason for revocation

  // Indexes for better query performance
  static indexes = [
    { userId: 1, deviceId: 1 },
    { accessToken: 1 },
    { refreshToken: 1 },
    { expiresAt: 1 },
    { isActive: 1 },
  ];
}

export type UserSessionDocument = UserSession & Document;

export const UserSessionSchema = SchemaFactory.createForClass(UserSession);


