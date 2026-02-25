import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { GameInvite, GameInviteDocument } from './schemas/game-invite.schema';
import { Game, GameDocument } from '../games/schemas/game.schema';
import { CreateInviteDto } from './dto/create-invite.dto';

@Injectable()
export class GameInvitesService {
  constructor(
    @InjectModel(GameInvite.name)
    private readonly inviteModel: Model<GameInviteDocument>,
    @InjectModel(Game.name)
    private readonly gameModel: Model<GameDocument>,
  ) {}

  async create(dto: CreateInviteDto) {
    const game = await this.gameModel.findById(dto.game_id).select('access_control status player_ids max_player').lean().exec();
    if (!game) throw new NotFoundException('Game not found');
    if (!(game as { access_control?: boolean }).access_control)
      throw new BadRequestException('Game is open; use join by code instead');
    const status = (game as { status?: string }).status;
    if (status !== 'DRAFT' && status !== 'SCHEDULED')
      throw new BadRequestException('Cannot invite after game has started');
    const existing = await this.inviteModel
      .findOne({ game_id: new Types.ObjectId(dto.game_id), invitedUserId: new Types.ObjectId(dto.invitedUserId) })
      .exec();
    if (existing) throw new BadRequestException('User already invited');
    const invite = new this.inviteModel({
      game_id: new Types.ObjectId(dto.game_id),
      invitedUserId: new Types.ObjectId(dto.invitedUserId),
      invitedBy: new Types.ObjectId(dto.invitedBy),
      status: 'PENDING',
    });
    return invite.save();
  }

  findByGame(gameId: string) {
    return this.inviteModel
      .find({ game_id: new Types.ObjectId(gameId) })
      .populate('invitedUserId', 'fullName email')
      .populate('invitedBy', 'fullName email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string) {
    const invite = await this.inviteModel
      .findById(id)
      .populate('game_id', 'name game_code status')
      .populate('invitedUserId', 'fullName email')
      .populate('invitedBy', 'fullName email')
      .exec();
    if (!invite) throw new NotFoundException('Invite not found');
    return invite;
  }

  /** Accept invite: add user to game player_ids, set invite status ACCEPTED. Only if game not started. */
  async accept(inviteId: string) {
    const invite = await this.inviteModel.findById(inviteId).exec();
    if (!invite) throw new NotFoundException('Invite not found');
    if (invite.status !== 'PENDING')
      throw new BadRequestException('Invite is not pending');
    const game = await this.gameModel.findById(invite.game_id).exec();
    if (!game) throw new NotFoundException('Game not found');
    const status = game.status;
    if (status !== 'DRAFT' && status !== 'SCHEDULED')
      throw new BadRequestException('Cannot join: game already started or completed');
    const playerIds = game.player_ids ?? [];
    const uid = invite.invitedUserId as Types.ObjectId;
    if (playerIds.some((id) => id.equals(uid))) throw new BadRequestException('Already in game');
    const maxPlayer = game.max_player;
    if (maxPlayer != null && playerIds.length >= maxPlayer)
      throw new BadRequestException('Game is full');
    playerIds.push(uid);
    await this.gameModel.updateOne({ _id: invite.game_id }, { $set: { player_ids: playerIds } }).exec();
    invite.status = 'ACCEPTED';
    return invite.save();
  }

  /** Revoke invite. Only creator (invitedBy) can revoke before acceptance. */
  async revoke(inviteId: string, revokedByUserId: string) {
    const invite = await this.inviteModel.findById(inviteId).exec();
    if (!invite) throw new NotFoundException('Invite not found');
    if (invite.status !== 'PENDING') throw new BadRequestException('Only pending invites can be revoked');
    const invitedBy = invite.invitedBy as Types.ObjectId;
    if (!invitedBy.equals(new Types.ObjectId(revokedByUserId)))
      throw new BadRequestException('Only the inviter can revoke');
    invite.status = 'REVOKED';
    return invite.save();
  }
}
