import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'CardGenerations' })
export class CardGeneration {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug: string;

  @Prop({ default: 'active' })
  status: string;
}

export type CardGenerationDocument = CardGeneration & Document;

export const CardGenerationSchema = SchemaFactory.createForClass(CardGeneration);
CardGenerationSchema.index({ slug: 1 }, { unique: true });
