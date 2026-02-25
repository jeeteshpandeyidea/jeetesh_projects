import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export const PLACEHOLDER_IMAGE_URL = '/placeholder-square.png';

const SquareSchema = new MongooseSchema(
  {
    asset_id: { type: MongooseSchema.Types.ObjectId, ref: 'Asset', default: null },
    isCustom: { type: Boolean, default: false },
    customText: { type: String, default: '' },
    claimed: { type: Boolean, default: false },
    claimedAt: { type: Date, default: null },
  },
  { _id: false },
);

@Schema({ timestamps: true, collection: 'GameCards' })
export class GameCard {
  @Prop({ type: Types.ObjectId, ref: 'Game', required: true })
  game_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  user_id: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'GridSize', required: true })
  gridsize_id: Types.ObjectId;

  @Prop({ type: [SquareSchema], default: [] })
  squares: {
    asset_id: Types.ObjectId | null;
    isCustom: boolean;
    customText: string;
    claimed: boolean;
    claimedAt: Date | null;
  }[];
}

export type GameCardDocument = GameCard & Document;

export const GameCardSchema = SchemaFactory.createForClass(GameCard);
GameCardSchema.index({ game_id: 1, user_id: 1 });
GameCardSchema.index({ game_id: 1 });
