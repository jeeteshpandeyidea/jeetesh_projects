import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types} from 'mongoose';

@Schema({ timestamps: true, collection: 'SubCategories' })
export class SubCategory {
  @Prop({ required: true })
  name: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  })
  slug: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'Category',
    required: true,
  })
  category_id: Types.ObjectId;

  @Prop()
  description?: string;

  @Prop({ default: 'active' })
  status: string;
}

export type SubCategoryDocument = SubCategory & Document;

export const SubCategorySchema = SchemaFactory.createForClass(SubCategory);