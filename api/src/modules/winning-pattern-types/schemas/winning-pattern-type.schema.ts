import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'WinningPatternTypes' })
export class WinningPatternType {
  @Prop({ type: Types.ObjectId, ref: 'WinningPattern', required: true })
  winning_pattern_id: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ default: 'active' })
  status: string;
}

export type WinningPatternTypeDocument = WinningPatternType & Document;

export const WinningPatternTypeSchema = SchemaFactory.createForClass(WinningPatternType);
WinningPatternTypeSchema.index({ winning_pattern_id: 1 });
WinningPatternTypeSchema.index({ slug: 1 }, { unique: true });
WinningPatternTypeSchema.index({ name: 1 }, { unique: true });
