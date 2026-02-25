import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'UserResets' })
export class UserReset {
  @Prop({ required: true })
  user_id: string;

  @Prop({ required: true })
  code: string;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ required: true })
  link: string;
}

export type UserResetDocument = UserReset & Document;

export const UserResetSchema = SchemaFactory.createForClass(UserReset);


