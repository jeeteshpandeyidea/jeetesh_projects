import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'Games' })
export class Game {
  @Prop({ required: true, trim: true, default: '' })
  name: string;

  @Prop({ trim: true, uppercase: true, sparse: true })
  game_code?: string;

  @Prop({ trim: true, lowercase: true, sparse: true })
  slug?: string;

  @Prop({ type: Types.ObjectId, ref: 'Event' })
  event_id?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Category' })
  category_id?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'GridSize' })
  grid_size_id?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'CardGeneration' })
  card_gen_id?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'GameType' })
  game_type_id?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'WinningPattern' })
  winning_patt_id?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'WinningPatternType' })
  winning_pattern_type_id?: Types.ObjectId;

  /** When set, player wins by completing ANY of these pattern types (e.g. Full House OR Any Horizontal Line). */
  @Prop({ type: [Types.ObjectId], ref: 'WinningPatternType', default: undefined })
  winning_pattern_type_ids?: Types.ObjectId[];

  @Prop({ type: Boolean, default: false })
  access_control: boolean; // 0 = open, 1 = closed

  @Prop({ type: Number })
  max_player?: number;

  @Prop({ type: Date })
  game_start_date?: Date;

  @Prop({ default: '' })
  description?: string;

  @Prop({ enum: ['DRAFT', 'SCHEDULED', 'ACTIVE', 'COMPLETED'], default: 'DRAFT' })
  status: string;

  /** STANDARD = end at first winner; ELIMINATION = continue until only 1 player left */
  @Prop({ enum: ['STANDARD', 'ELIMINATION'], default: 'STANDARD' })
  game_mode: string;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  winner_id?: Types.ObjectId | null;

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  player_ids: Types.ObjectId[];

  /** For ELIMINATION mode: players eliminated (no pattern when someone else won round) */
  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  eliminated_player_ids: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  waitlist_ids: Types.ObjectId[];
}

export type GameDocument = Game & Document;

export const GameSchema = SchemaFactory.createForClass(Game);
GameSchema.index({ game_code: 1 }, { unique: true, sparse: true });
GameSchema.index({ slug: 1 }, { unique: true, sparse: true });
