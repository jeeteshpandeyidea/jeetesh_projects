import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'Eligibilities' })
export class Eligibility {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ default: 'active' })
  status: string;
}

export type EligibilityDocument = Eligibility & Document;

export const EligibilitySchema = SchemaFactory.createForClass(Eligibility);
