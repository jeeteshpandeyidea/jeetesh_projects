import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'Rewards' })
export class Reward {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug: string;

  @Prop({ type: Number })
  value?: number;

  @Prop({ default: 'active' })
  status: string;
}

export type RewardDocument = Reward & Document;

export const RewardSchema = SchemaFactory.createForClass(Reward);
