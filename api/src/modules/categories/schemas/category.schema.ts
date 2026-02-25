import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'Categories' })
export class Category {
  @Prop({ required: true })
  name: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  })
  slug: string;

  @Prop()
  description?: string;

  @Prop({ default: 'active' })
  status: string;

  @Prop({ enum: ['FREE', 'PREMIUM', 'ORG_ONLY'], default: 'FREE' })
  visibility_type: string;
}

export type CategoryDocument = Category & Document;

export const CategorySchema = SchemaFactory.createForClass(Category);
