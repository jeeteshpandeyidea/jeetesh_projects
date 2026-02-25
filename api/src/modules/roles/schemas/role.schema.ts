import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
  
@Schema({ timestamps: true, collection: 'Roles' })
export class Role {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop()
  description?: string;

  @Prop({ type: [String], default: [] })
  permissions: string[];
}

export type RoleDocument = Role & Document;

export const RoleSchema = SchemaFactory.createForClass(Role);


