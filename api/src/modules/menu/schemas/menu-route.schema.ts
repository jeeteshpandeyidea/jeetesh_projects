import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'MenuRoutes' })
export class MenuRoute {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  url: string;

  @Prop()
  key: string;

  @Prop({ required: true })
  menu_id: string;

  @Prop({ default: 'active' })
  status: string;
}

export type MenuRouteDocument = MenuRoute & Document;

export const MenuRouteSchema = SchemaFactory.createForClass(MenuRoute);


