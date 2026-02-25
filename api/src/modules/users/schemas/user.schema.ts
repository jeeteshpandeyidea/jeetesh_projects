import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'Users' })
export class User {
  @Prop({ default: false })
  is_deleted: boolean;

  @Prop({ default: 'active' })
  status: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: [String], default: [] })
  roles: string[];

  @Prop({ required: true })
  fullName: string;

  @Prop({ trim: true })
  phone?: string;

  @Prop()
  profilePhoto?: string;

  @Prop({ default: false })
  emailVerified: boolean;

  @Prop({ default: false })
  phoneVerified: boolean;

  @Prop({ default: false })
  is_premium: boolean;
}

export type UserDocument = User & Document;

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ phone: 1 }, { unique: true, sparse: true });


