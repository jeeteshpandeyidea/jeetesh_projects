import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { GameCard, GameCardDocument } from './schemas/game-card.schema';
import { Game, GameDocument } from '../games/schemas/game.schema';
import { GridSize, GridSizeDocument } from '../grid-sizes/schemas/grid-size.schema';
import { Asset, AssetDocument } from '../assets/schemas/asset.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { WinningPattern, WinningPatternDocument } from '../winning-pattern/schemas/winning-pattern.schema';
import { WinningPatternType, WinningPatternTypeDocument } from '../winning-pattern-types/schemas/winning-pattern-type.schema';
import { GamesService } from '../games/games.service';
import { GenerateCardDto } from './dto/generate-card.dto';
import { UpdateCardSquaresDto } from './dto/update-card-squares.dto';
import { checkWinningPattern } from './winning-pattern-engine';

function parseGridDimensions(slug: string, name: string): { rows: number; cols: number } {
  const str = (slug || name || '').toLowerCase();
  const match = str.match(/(\d+)\s*[x×\-]\s*(\d+)/);
  if (match) {
    const rows = Math.min(10, Math.max(1, parseInt(match[1], 10)));
    const cols = Math.min(15, Math.max(1, parseInt(match[2], 10)));
    return { rows, cols };
  }
  if (/tambola|housie|bingo/i.test(str)) return { rows: 3, cols: 9 };
  return { rows: 3, cols: 9 };
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

@Injectable()
export class GameCardsService {
  constructor(
    @InjectModel(GameCard.name)
    private readonly gameCardModel: Model<GameCardDocument>,
    @InjectModel(Game.name)
    private readonly gameModel: Model<GameDocument>,
    @InjectModel(GridSize.name)
    private readonly gridSizeModel: Model<GridSizeDocument>,
    @InjectModel(Asset.name)
    private readonly assetModel: Model<AssetDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(WinningPattern.name)
    private readonly winningPatternModel: Model<WinningPatternDocument>,
    @InjectModel(WinningPatternType.name)
    private readonly winningPatternTypeModel: Model<WinningPatternTypeDocument>,
    private readonly gamesService: GamesService,
  ) {}

  private async getGridDimensionsFromGridSize(gridSizeId: string): Promise<{ rows: number; cols: number }> {
    const gs = await this.gridSizeModel.findById(gridSizeId).select('slug name').lean().exec();
    if (!gs) throw new NotFoundException('Grid size not found');
    const slug = (gs as { slug?: string }).slug ?? '';
    const name = (gs as { name?: string }).name ?? '';
    return parseGridDimensions(slug, name);
  }

  /** Fetch eligible assets by category + subscription (FREE for all, PREMIUM only if user is_premium). */
  private async getEligibleAssets(categoryId: Types.ObjectId | undefined, isPremium: boolean): Promise<{ _id: Types.ObjectId; imageUrl: string; isPlaceholder?: boolean }[]> {
    const accessFilter = isPremium ? { $in: ['FREE', 'PREMIUM'] } : 'FREE';
    const query: Record<string, unknown> = { status: 'ACTIVE', accessLevel: accessFilter };
    if (categoryId) query.categoryId = categoryId;
    const assets = await this.assetModel
      .find(query)
      .select('_id imageUrl isPlaceholder')
      .lean()
      .exec();
    return assets as { _id: Types.ObjectId; imageUrl: string; isPlaceholder?: boolean }[];
  }

  /** Generate card: random grid (no duplicates where possible), optional custom slots. */
  async generateCard(dto: GenerateCardDto) {
    const game = await this.gameModel.findById(dto.game_id).select('category_id grid_size_id').lean().exec();
    if (!game) throw new NotFoundException('Game not found');

    const gridSizeId = (game as { grid_size_id?: Types.ObjectId }).grid_size_id;
    if (!gridSizeId) throw new BadRequestException('Game has no grid size');

    const { rows, cols } = await this.getGridDimensionsFromGridSize(gridSizeId.toString());
    const totalSquares = rows * cols;

    let isPremium = false;
    if (dto.user_id) {
      const user = await this.userModel.findById(dto.user_id).select('is_premium').lean().exec();
      isPremium = !!(user as { is_premium?: boolean } | null)?.is_premium;
    }

    const categoryId = (game as { category_id?: Types.ObjectId }).category_id;
    const eligible = await this.getEligibleAssets(categoryId, isPremium);
    const shuffled = shuffle(eligible);

    const squares: { asset_id: Types.ObjectId | null; isCustom: boolean; customText: string; claimed: boolean; claimedAt: Date | null }[] = [];
    for (let i = 0; i < totalSquares; i++) {
      if (shuffled.length > 0) {
        const asset = shuffled[i % shuffled.length];
        squares.push({
          asset_id: asset._id,
          isCustom: false,
          customText: '',
          claimed: false,
          claimedAt: null,
        });
      } else {
        squares.push({
          asset_id: null,
          isCustom: true,
          customText: 'Your Custom Idea',
          claimed: false,
          claimedAt: null,
        });
      }
    }

    const card = new this.gameCardModel({
      game_id: new Types.ObjectId(dto.game_id),
      user_id: dto.user_id ? new Types.ObjectId(dto.user_id) : null,
      gridsize_id: gridSizeId,
      squares,
    });
    const saved = await card.save();
    return this.gameCardModel
      .findById(saved._id)
      .populate('gridsize_id', 'name slug')
      .populate('squares.asset_id', 'title imageUrl thumbnailUrl isPlaceholder')
      .lean()
      .exec()
      .then((doc) => doc || saved);
  }

  /** Regenerate card: replace squares with new random set (same logic as generate). */
  async regenerateCard(cardId: string) {
    const card = await this.gameCardModel.findById(cardId).exec();
    if (!card) throw new NotFoundException('Game card not found');

    const game = await this.gameModel.findById(card.game_id).select('category_id grid_size_id').lean().exec();
    if (!game) throw new NotFoundException('Game not found');

    const gridSizeId = (game as { grid_size_id?: Types.ObjectId }).grid_size_id;
    if (!gridSizeId) throw new BadRequestException('Game has no grid size');

    const { rows, cols } = await this.getGridDimensionsFromGridSize(gridSizeId.toString());
    const totalSquares = rows * cols;

    let isPremium = false;
    if (card.user_id) {
      const user = await this.userModel.findById(card.user_id).select('is_premium').lean().exec();
      isPremium = !!(user as { is_premium?: boolean } | null)?.is_premium;
    }

    const categoryId = (game as { category_id?: Types.ObjectId }).category_id;
    const eligible = await this.getEligibleAssets(categoryId, isPremium);
    const shuffled = shuffle(eligible);

    const squares: { asset_id: Types.ObjectId | null; isCustom: boolean; customText: string; claimed: boolean; claimedAt: Date | null }[] = [];
    for (let i = 0; i < totalSquares; i++) {
      if (shuffled.length > 0) {
        const asset = shuffled[i % shuffled.length];
        squares.push({
          asset_id: asset._id,
          isCustom: false,
          customText: '',
          claimed: false,
          claimedAt: null,
        });
      } else {
        squares.push({
          asset_id: null,
          isCustom: true,
          customText: 'Your Custom Idea',
          claimed: false,
          claimedAt: null,
        });
      }
    }

    card.squares = squares;
    const saved = await card.save();
    return this.gameCardModel
      .findById(saved._id)
      .populate('gridsize_id', 'name slug')
      .populate('squares.asset_id', 'title imageUrl thumbnailUrl isPlaceholder')
      .lean()
      .exec()
      .then((doc) => doc || saved);
  }

  async findOne(cardId: string) {
    const card = await this.gameCardModel
      .findById(cardId)
      .populate('game_id', 'name game_code status')
      .populate('gridsize_id', 'name slug')
      .populate('user_id', 'fullName email')
      .populate('squares.asset_id', 'title imageUrl thumbnailUrl isPlaceholder')
      .exec();
    if (!card) throw new NotFoundException('Game card not found');
    return card;
  }

  async findByGameAndUser(gameId: string, userId?: string) {
    const query: Record<string, unknown> = { game_id: new Types.ObjectId(gameId) };
    if (userId) query.user_id = new Types.ObjectId(userId);
    else query.user_id = null;
    return this.gameCardModel
      .find(query)
      .populate('gridsize_id', 'name slug')
      .populate('squares.asset_id', 'title imageUrl thumbnailUrl isPlaceholder')
      .sort({ createdAt: -1 })
      .exec();
  }

  async updateSquares(cardId: string, dto: UpdateCardSquaresDto) {
    const card = await this.gameCardModel.findById(cardId).exec();
    if (!card) throw new NotFoundException('Game card not found');
    const game = await this.gameModel.findById(card.game_id).select('status').lean().exec();
    if (game && (game as { status?: string }).status === 'ACTIVE') {
      throw new BadRequestException('Cannot edit squares during active game; use claim only');
    }
    if (dto.squares != null) {
      card.squares = dto.squares.map((s) => ({
        asset_id: s.asset_id ? new Types.ObjectId(s.asset_id) : null,
        isCustom: s.isCustom ?? false,
        customText: s.customText ?? '',
        claimed: s.claimed ?? false,
        claimedAt: s.claimedAt ? new Date(s.claimedAt) : null,
      }));
    }
    return card.save();
  }

  /** Claim a square: validate card belongs to user, cannot unclaim, then auto-check winning pattern. */
  async claimSquare(cardId: string, squareIndex: number, userId: string) {
    const card = await this.gameCardModel.findById(cardId).exec();
    if (!card) throw new NotFoundException('Game card not found');
    const uid = new Types.ObjectId(userId);
    if (!card.user_id || !card.user_id.equals(uid))
      throw new BadRequestException('This card does not belong to you');
    const game = await this.gameModel
      .findById(card.game_id)
      .select('status winning_patt_id winning_pattern_type_id winning_pattern_type_ids')
      .lean()
      .exec();
    if (!game) throw new NotFoundException('Game not found');
    if ((game as { status?: string }).status !== 'ACTIVE')
      throw new BadRequestException('Game is not active');
    const squares = card.squares ?? [];
    if (squareIndex < 0 || squareIndex >= squares.length)
      throw new BadRequestException('Invalid square index');
    const sq = squares[squareIndex];
    if (sq.claimed) throw new BadRequestException('Square already claimed; cannot unclaim');
    sq.claimed = true;
    sq.claimedAt = new Date();
    await card.save();

    const { rows, cols } = await this.getGridDimensionsFromGridSize(card.gridsize_id.toString());
    const claimedSet = new Set<number>();
    squares.forEach((s, i) => {
      if (s.claimed) claimedSet.add(i);
    });

    const gameDoc = game as {
      winning_pattern_type_id?: Types.ObjectId;
      winning_pattern_type_ids?: Types.ObjectId[];
      winning_patt_id?: Types.ObjectId;
    };
    const patternSlugs: string[] = [];
    if (gameDoc.winning_pattern_type_ids && gameDoc.winning_pattern_type_ids.length > 0) {
      const wpts = await this.winningPatternTypeModel
        .find({ _id: { $in: gameDoc.winning_pattern_type_ids } })
        .select('slug')
        .lean()
        .exec();
      wpts.forEach((w) => {
        if ((w as { slug?: string }).slug) patternSlugs.push((w as { slug: string }).slug);
      });
    }
    if (patternSlugs.length === 0 && gameDoc.winning_pattern_type_id) {
      const wpt = await this.winningPatternTypeModel.findById(gameDoc.winning_pattern_type_id).select('slug').lean().exec();
      if (wpt && (wpt as { slug?: string }).slug) patternSlugs.push((wpt as { slug: string }).slug);
    }
    if (patternSlugs.length === 0 && gameDoc.winning_patt_id) {
      const wp = await this.winningPatternModel.findById(gameDoc.winning_patt_id).select('slug').lean().exec();
      if (wp && (wp as { slug?: string }).slug) patternSlugs.push((wp as { slug: string }).slug);
    }
    if (patternSlugs.length === 0) patternSlugs.push('row');
    const isWin = patternSlugs.some((patternSlug) => checkWinningPattern(rows, cols, claimedSet, patternSlug));
    if (isWin) {
      await this.gamesService.completeGameWithWinner(card.game_id.toString(), userId);
      return { claimed: true, won: true, message: 'You won!' };
    }
    return { claimed: true, won: false, message: 'Square claimed' };
  }
}
