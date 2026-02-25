import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'AuditLogs' })
export class AuditLog {
  @Prop({ required: true })
  actor_user_id: string;

  @Prop({ required: true })
  target_type: string;

  @Prop({ required: true })
  action: string;

  @Prop()
  description?: string;

  @Prop()
  ipAddress?: string;
}

export type AuditLogDocument = AuditLog & Document;

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);


