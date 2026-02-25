import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'AchievementCriteria' })
export class AchievementCriteria {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug: string;

  @Prop({ default: 'active' })
  status: string;
}

export type AchievementCriteriaDocument = AchievementCriteria & Document;

export const AchievementCriteriaSchema = SchemaFactory.createForClass(AchievementCriteria);
