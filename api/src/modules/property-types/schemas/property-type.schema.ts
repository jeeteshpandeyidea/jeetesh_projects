import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'PropertyTypes' })
export class PropertyType {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  slug: string;

  @Prop()
  description?: string;

  @Prop({ default: 'active' })
  status: string;
}

export type PropertyTypeDocument = PropertyType & Document;

export const PropertyTypeSchema = SchemaFactory.createForClass(PropertyType);

