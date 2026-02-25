import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'GameInvites' })
export class GameInvite {
  @Prop({ type: Types.ObjectId, ref: 'Game', required: true })
  game_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  invitedUserId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  invitedBy: Types.ObjectId;

  @Prop({ enum: ['PENDING', 'ACCEPTED', 'REVOKED'], default: 'PENDING' })
  status: string;
}

export type GameInviteDocument = GameInvite & Document;

export const GameInviteSchema = SchemaFactory.createForClass(GameInvite);
GameInviteSchema.index({ game_id: 1, invitedUserId: 1 });
GameInviteSchema.index({ game_id: 1 });
