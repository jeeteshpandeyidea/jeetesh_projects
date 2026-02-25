import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'GameTypes' })
export class GameType {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  slug: string;

  @Prop()
  description?: string;

  @Prop({ default: 'active' })
  status: string;
}

export type GameTypeDocument = GameType & Document;

export const GameTypeSchema = SchemaFactory.createForClass(GameType);
