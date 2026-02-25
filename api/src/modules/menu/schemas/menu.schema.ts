import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'Menus' })
export class Menu {
  @Prop({ required: true })
  name: string;

  @Prop({ default: 'active' })
  status: string;
}

export type MenuDocument = Menu & Document;

export const MenuSchema = SchemaFactory.createForClass(Menu);


