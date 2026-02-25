import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'RolePermissions' })
export class RolePermission {
  @Prop({ required: true })
  role_id: string;

  @Prop({ required: true })
  module: string;

  @Prop({ required: true })
  permission: string;

  @Prop({ required: true })
  menu_id: string;
}

export type RolePermissionDocument = RolePermission & Document;

export const RolePermissionSchema = SchemaFactory.createForClass(RolePermission);


