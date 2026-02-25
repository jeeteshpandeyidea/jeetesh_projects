import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'GridSizes' })
export class GridSize {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ default: 'active' })
  status: string;
}

export type GridSizeDocument = GridSize & Document;

export const GridSizeSchema = SchemaFactory.createForClass(GridSize);
// Ensure index on slug for uniqueness at the DB level
GridSizeSchema.index({ slug: 1 }, { unique: true });
