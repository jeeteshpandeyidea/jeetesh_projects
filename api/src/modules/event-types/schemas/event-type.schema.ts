import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'EventTypes' })
export class EventType {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  slug: string;

  @Prop()
  description?: string;

  @Prop({ default: 'active' })
  status: string;
}

export type EventTypeDocument = EventType & Document;

export const EventTypeSchema = SchemaFactory.createForClass(EventType);

