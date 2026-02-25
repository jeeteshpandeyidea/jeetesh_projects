import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'Facilities' })
export class Facility {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  slug: string;

  @Prop()
  description?: string;

  @Prop({ default: 'active' })
  status: string;
}

export type FacilityDocument = Facility & Document;

export const FacilitySchema = SchemaFactory.createForClass(Facility);

