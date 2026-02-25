import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Game, GameDocument } from './schemas/game.schema';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { WinningPattern, WinningPatternDocument } from '../winning-pattern/schemas/winning-pattern.schema';
import { Category, CategoryDocument } from '../categories/schemas/category.schema';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class GamesService {
  constructor(
    @InjectModel(Game.name)
    private readonly gameModel: Model<GameDocument>,
    @InjectModel(WinningPattern.name)
    private readonly winningPatternModel: Model<WinningPatternDocument>,
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  private slugify(text: string): string {
    return (
      text
        .toLowerCase()
        .trim()
        .replace(/[\s_]+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '') || 'game'
    );
  }

  private async ensureUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
    let slug = baseSlug;
    let n = 0;
    while (true) {
      const query: Record<string, unknown> = { slug };
      if (excludeId) query._id = { $ne: excludeId };
      const exists = await this.gameModel.findOne(query).select('_id').lean().exec();
      if (!exists) return slug;
      n += 1;
      slug = `${baseSlug}-${n}`;
    }
  }

  private async generateNextGameCode(): Promise<string> {
    const prefix = 'GM';
    const docs = await this.gameModel
      .find({ game_code: new RegExp(`^${prefix}\\d+$`, 'i') })
      .select('game_code')
      .lean()
      .exec();
    let max = 0;
    for (const d of docs) {
      const code = (d as { game_code?: string }).game_code;
      const n = parseInt(code?.replace(prefix, '') || '0', 10);
      if (n > max) max = n;
    }
    return `${prefix}${String(max + 1).padStart(3, '0')}`;
  }

  /** Business rule: ADVANCED pattern only for premium users; free users cannot use premium category. */
  private async validateCreateRules(dto: CreateGameDto): Promise<void> {
    if (!dto.created_by) return; // admin or no user context: skip
    const user = await this.userModel.findById(dto.created_by).select('is_premium').lean().exec();
    if (!user) throw new BadRequestException('Creator user not found');
    const isPremium = !!(user as { is_premium?: boolean }).is_premium;

    if (dto.winning_patt_id) {
      const pattern = await this.winningPatternModel.findById(dto.winning_patt_id).select('pattern_type').lean().exec();
      if (pattern && (pattern as { pattern_type?: string }).pattern_type === 'ADVANCED' && !isPremium)
        throw new BadRequestException('ADVANCED pattern is only for premium users');
    }

    if (dto.category_id) {
      const category = await this.categoryModel.findById(dto.category_id).select('visibility_type').lean().exec();
      if (category && (category as { visibility_type?: string }).visibility_type === 'PREMIUM' && !isPremium)
        throw new BadRequestException('Free users cannot use premium category');
    }
  }

  async create(dto: CreateGameDto) {
    await this.validateCreateRules(dto);
    const baseSlug = this.slugify(dto.name);
    const slug = await this.ensureUniqueSlug(baseSlug);
    const game_code = await this.generateNextGameCode(); // always auto-generated
    const created = new this.gameModel({
      name: dto.name,
      slug,
      game_code,
      ...(dto.event_id && { event_id: new Types.ObjectId(dto.event_id) }),
      category_id: dto.category_id,
      grid_size_id: dto.grid_size_id,
      card_gen_id: dto.card_gen_id,
      game_type_id: dto.game_type_id,
      winning_patt_id: dto.winning_patt_id,
      winning_pattern_type_id: dto.winning_pattern_type_id,
      access_control: dto.access_control ?? false,
      max_player: dto.max_player,
      game_start_date: dto.game_start_date ? new Date(dto.game_start_date) : undefined,
      description: dto.description ?? '',
      status: dto.status ?? 'DRAFT',
      game_mode: dto.game_mode ?? 'STANDARD',
      winner_id: dto.winner_id ?? null,
      player_ids: [],
      waitlist_ids: [],
      eliminated_player_ids: [],
    });
    return created.save();
  }

  findAll() {
    return this.gameModel
      .find()
      .populate('event_id', 'name slug')
      .populate('category_id', 'name slug')
      .populate('grid_size_id', 'name slug')
      .populate('card_gen_id', 'name slug')
      .populate('game_type_id', 'name slug')
      .populate('winning_patt_id', 'name slug')
      .populate('winning_pattern_type_id', 'name slug')
      .populate('winner_id', 'name email')
      .populate('player_ids', 'fullName email')
      .populate('waitlist_ids', 'fullName email')
      .populate('eliminated_player_ids', 'fullName email')
      .sort({ createdAt: -1 })
      .exec();
  }

  /** Browse open games: access_control false, status SCHEDULED or ACTIVE */
  findOpen() {
    return this.gameModel
      .find({ access_control: false, status: { $in: ['SCHEDULED', 'ACTIVE'] } })
      .populate('event_id', 'name slug')
      .populate('category_id', 'name slug')
      .populate('grid_size_id', 'name slug')
      .populate('card_gen_id', 'name slug')
      .populate('game_type_id', 'name slug')
      .populate('winning_patt_id', 'name slug')
      .populate('winning_pattern_type_id', 'name slug')
      .populate('winner_id', 'name email')
      .populate('player_ids', 'fullName email')
      .populate('waitlist_ids', 'fullName email')
      .populate('eliminated_player_ids', 'fullName email')
      .sort({ createdAt: -1 })
      .exec();
  }

  /** My games: games where the user has joined (player_ids contains userId) */
  findMyGames(userId: string) {
    if (!userId?.trim()) throw new BadRequestException('userId is required for My Games');
    const uid = new Types.ObjectId(userId);
    return this.gameModel
      .find({ player_ids: uid })
      .populate('event_id', 'name slug')
      .populate('category_id', 'name slug')
      .populate('grid_size_id', 'name slug')
      .populate('card_gen_id', 'name slug')
      .populate('game_type_id', 'name slug')
      .populate('winning_patt_id', 'name slug')
      .populate('winning_pattern_type_id', 'name slug')
      .populate('winner_id', 'name email')
      .populate('player_ids', 'fullName email')
      .populate('waitlist_ids', 'fullName email')
      .populate('eliminated_player_ids', 'fullName email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string) {
    const game = await this.gameModel
      .findById(id)
      .populate('event_id', 'name slug')
      .populate('category_id', 'name slug')
      .populate('grid_size_id', 'name slug')
      .populate('card_gen_id', 'name slug')
      .populate('game_type_id', 'name slug')
      .populate('winning_patt_id', 'name slug')
      .populate('winning_pattern_type_id', 'name slug')
      .populate('winning_pattern_type_ids', 'name slug')
      .populate('winner_id', 'name email')
      .populate('player_ids', 'fullName email')
      .populate('waitlist_ids', 'fullName email')
      .populate('eliminated_player_ids', 'fullName email')
      .exec();
    if (!game) throw new NotFoundException('Game not found');
    return game;
  }

  /** Open game: join by gameCode. Enforce maxPlayers; if full → waitlist. */
  async joinByCode(gameCode: string, userId: string) {
    if (!gameCode?.trim() || !userId?.trim())
      throw new BadRequestException('gameCode and userId are required');
    const game = await this.gameModel.findOne({ game_code: gameCode.toUpperCase().trim() }).exec();
    if (!game) throw new NotFoundException('Game not found');
    if (game.access_control)
      throw new BadRequestException('Game is closed; join via invite only');
    const status = game.status;
    if (status !== 'DRAFT' && status !== 'SCHEDULED')
      throw new BadRequestException('Game is not joinable');
    const uid = new Types.ObjectId(userId);
    const playerIds = game.player_ids ?? [];
    const waitlistIds = game.waitlist_ids ?? [];
    if (playerIds.some((id) => id.equals(uid)))
      return { joined: true, onWaitlist: false, message: 'Already in game' };
    if (waitlistIds.some((id) => id.equals(uid)))
      return { joined: false, onWaitlist: true, message: 'Already on waitlist' };
    const maxPlayer = game.max_player;
    if (maxPlayer != null && playerIds.length >= maxPlayer) {
      await this.gameModel
        .updateOne({ _id: game._id }, { $push: { waitlist_ids: uid } })
        .exec();
      return { joined: false, onWaitlist: true, message: 'Game full; added to waitlist' };
    }
    await this.gameModel
      .updateOne({ _id: game._id }, { $push: { player_ids: uid } })
      .exec();
    return { joined: true, onWaitlist: false, message: 'Joined game' };
  }

  /** Leave game. Only before start (DRAFT or SCHEDULED). */
  async leaveGame(gameId: string, userId: string) {
    if (!gameId?.trim() || !userId?.trim())
      throw new BadRequestException('gameId and userId are required');
    const game = await this.gameModel.findById(gameId).exec();
    if (!game) throw new NotFoundException('Game not found');
    if (game.status !== 'DRAFT' && game.status !== 'SCHEDULED')
      throw new BadRequestException('Cannot leave after game has started');
    const uid = new Types.ObjectId(userId);
    const playerIds = (game.player_ids ?? []).filter((id) => !id.equals(uid));
    const waitlistIds = (game.waitlist_ids ?? []).filter((id) => !id.equals(uid));
    await this.gameModel
      .updateOne(
        { _id: gameId },
        { $set: { player_ids: playerIds, waitlist_ids: waitlistIds } },
      )
      .exec();
    return { left: true, message: 'Left game' };
  }

  private canEditGameDetails(status: string | undefined): boolean {
    return status === 'DRAFT' || status === 'SCHEDULED';
  }

  /** Business rule: cannot start game if no players joined (unless admin bypass). */
  async update(id: string, dto: UpdateGameDto, options?: { adminBypass?: boolean }) {
    const existing = await this.gameModel.findById(id).exec();
    if (!existing) throw new NotFoundException('Game not found');

    if (dto.status === 'ACTIVE' && existing.status !== 'ACTIVE') {
      const playerIds = (existing as GameDocument & { player_ids?: unknown[] }).player_ids ?? [];
      if (playerIds.length === 0 && !options?.adminBypass)
        throw new BadRequestException('Cannot start game if no players joined');
    }

    const beforeStart = this.canEditGameDetails(existing.status);

    const updateData: Record<string, unknown> = beforeStart
      ? {
          ...(dto.name !== undefined && { name: dto.name }),
          ...(dto.event_id !== undefined && { event_id: dto.event_id }),
          ...(dto.name !== undefined && { slug: await this.ensureUniqueSlug(this.slugify(dto.name), id) }),
          ...(dto.category_id !== undefined && { category_id: dto.category_id }),
          ...(dto.grid_size_id !== undefined && { grid_size_id: dto.grid_size_id }),
          ...(dto.card_gen_id !== undefined && { card_gen_id: dto.card_gen_id }),
          ...(dto.game_type_id !== undefined && { game_type_id: dto.game_type_id }),
          ...(dto.winning_patt_id !== undefined && { winning_patt_id: dto.winning_patt_id }),
          ...(dto.winning_pattern_type_id !== undefined && { winning_pattern_type_id: dto.winning_pattern_type_id }),
          ...(dto.winning_pattern_type_ids !== undefined && {
            winning_pattern_type_ids: dto.winning_pattern_type_ids.map((id) => new Types.ObjectId(id)),
          }),
          ...(dto.access_control !== undefined && { access_control: dto.access_control }),
          ...(dto.max_player !== undefined && { max_player: dto.max_player }),
          ...(dto.game_start_date !== undefined && { game_start_date: new Date(dto.game_start_date) }),
          ...(dto.description !== undefined && { description: dto.description }),
          ...(dto.status !== undefined && { status: dto.status }),
          ...(dto.game_mode !== undefined && { game_mode: dto.game_mode }),
          ...(dto.winner_id !== undefined && { winner_id: dto.winner_id ?? null }),
          ...(dto.player_ids !== undefined && { player_ids: dto.player_ids.map((id) => new Types.ObjectId(id)) }),
          ...(dto.waitlist_ids !== undefined && { waitlist_ids: dto.waitlist_ids.map((id) => new Types.ObjectId(id)) }),
          ...(dto.eliminated_player_ids !== undefined && { eliminated_player_ids: dto.eliminated_player_ids.map((id) => new Types.ObjectId(id)) }),
        }
      : {
          ...(dto.status !== undefined && { status: dto.status }),
          ...(dto.winner_id !== undefined && { winner_id: dto.winner_id ?? null }),
          ...(dto.game_mode !== undefined && { game_mode: dto.game_mode }),
          ...(dto.eliminated_player_ids !== undefined && { eliminated_player_ids: dto.eliminated_player_ids.map((id) => new Types.ObjectId(id)) }),
        };

    return this.gameModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .populate('event_id', 'name slug')
      .populate('category_id', 'name slug')
      .populate('grid_size_id', 'name slug')
      .populate('card_gen_id', 'name slug')
      .populate('game_type_id', 'name slug')
      .populate('winning_patt_id', 'name slug')
      .populate('winning_pattern_type_id', 'name slug')
      .populate('winning_pattern_type_ids', 'name slug')
      .populate('winner_id', 'name email')
      .populate('player_ids', 'fullName email')
      .populate('waitlist_ids', 'fullName email')
      .populate('eliminated_player_ids', 'fullName email')
      .exec();
  }

  async remove(id: string) {
    const deleted = await this.gameModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Game not found');
    return { deleted: true };
  }

  /** Start game: set status to ACTIVE. Used by manual start and by scheduler. */
  async startGame(id: string, options?: { adminBypass?: boolean }) {
    const game = await this.gameModel.findById(id).exec();
    if (!game) throw new NotFoundException('Game not found');
    if (game.status !== 'SCHEDULED' && game.status !== 'DRAFT')
      throw new BadRequestException('Game can only be started when status is DRAFT or SCHEDULED');
    const playerIds = game.player_ids ?? [];
    if (playerIds.length === 0 && !options?.adminBypass)
      throw new BadRequestException('Cannot start game if no players joined');
    game.status = 'ACTIVE';
    return game.save();
  }

  /** Set winner and mark game COMPLETED. STANDARD: first winner ends. ELIMINATION: others marked eliminated, then winner set. */
  async completeGameWithWinner(gameId: string, winnerUserId: string) {
    const game = await this.gameModel.findById(gameId).exec();
    if (!game) throw new NotFoundException('Game not found');
    if (game.status !== 'ACTIVE')
      throw new BadRequestException('Game is not active');
    const uid = new Types.ObjectId(winnerUserId);
    game.winner_id = uid;
    game.status = 'COMPLETED';
    if (game.game_mode === 'ELIMINATION') {
      const playerIds = game.player_ids ?? [];
      game.eliminated_player_ids = playerIds.filter((id) => !id.equals(uid));
    }
    return game.save();
  }
}
