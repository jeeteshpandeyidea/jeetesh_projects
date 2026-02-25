import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'Events' })
export class Event {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug: string;

  @Prop({ type: Types.ObjectId, ref: 'Category' })
  category_id?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'EventType', required: true })
  event_type_id: Types.ObjectId;

  @Prop({ type: Date })
  start_date?: Date;

  @Prop({ type: Date })
  end_date?: Date;

  @Prop({ type: Types.ObjectId, ref: 'Eligibility' })
  eligibility_id?: Types.ObjectId;

  @Prop()
  winning_condition?: string;

  @Prop({ type: Types.ObjectId, ref: 'GameType' })
  game_type_id?: Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  max_participants?: number;

  @Prop({ type: Types.ObjectId, ref: 'Reward' })
  reward_id?: Types.ObjectId;

  @Prop({ type: Number })
  rewards_value?: number;

  @Prop()
  distribution?: string;

  @Prop({ default: 'active' })
  status: string;

  @Prop()
  description?: string;
}

export type EventDocument = Event & Document;

export const EventSchema = SchemaFactory.createForClass(Event);
