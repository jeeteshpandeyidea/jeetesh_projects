import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'assets' })
export class Asset {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ unique: true, sparse: true, trim: true, uppercase: true })
  code?: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug: string;

  @Prop({ default: '' })
  description?: string;

  @Prop({ required: true })
  imageUrl: string;

  @Prop({ default: '' })
  thumbnailUrl?: string;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  categoryId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'SubCategory' })
  subcategoryId?: Types.ObjectId;

  @Prop({ default: 'FREE', enum: ['FREE', 'PREMIUM', 'ORG_ONLY'] })
  accessLevel: string;

  @Prop({ default: false })
  isPlaceholder: boolean;

  @Prop({ default: 'ACTIVE', enum: ['ACTIVE', 'INACTIVE'] })
  status: string;

  @Prop({ default: 0 })
  sortOrder: number;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ default: 0 })
  usageCount: number;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy?: Types.ObjectId;
}

export type AssetDocument = Asset & Document;

export const AssetSchema = SchemaFactory.createForClass(Asset);
AssetSchema.index({ code: 1 }, { unique: true });
AssetSchema.index({ slug: 1 }, { unique: true });
AssetSchema.index({ categoryId: 1 });
AssetSchema.index({ status: 1 });
