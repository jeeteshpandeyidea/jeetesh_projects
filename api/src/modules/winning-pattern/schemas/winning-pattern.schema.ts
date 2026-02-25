import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'WinningPatterns' })
export class WinningPattern {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug: string;

  @Prop({ default: 'active' })
  status: string;

  @Prop({ enum: ['BASIC', 'ADVANCED'], default: 'BASIC' })
  pattern_type: string;
}

export type WinningPatternDocument = WinningPattern & Document;

export const WinningPatternSchema = SchemaFactory.createForClass(WinningPattern);
