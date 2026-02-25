import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'RoomTypes' })
export class RoomType {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  slug: string;

  @Prop()
  description?: string;

  @Prop({ default: 'active' })
  status: string;
}

export type RoomTypeDocument = RoomType & Document;

export const RoomTypeSchema = SchemaFactory.createForClass(RoomType);

