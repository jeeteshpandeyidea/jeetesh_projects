import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Game, GameDocument } from './schemas/game.schema';
import { GamesService } from './games.service';

@Injectable()
export class GamesSchedulerService {
  constructor(
    @InjectModel(Game.name)
    private readonly gameModel: Model<GameDocument>,
    private readonly gamesService: GamesService,
  ) {}

  /** Every minute: auto-start games that are SCHEDULED and game_start_date <= now */
  @Cron('* * * * *')
  async autoStartScheduledGames() {
    const now = new Date();
    const games = await this.gameModel
      .find({
        status: 'SCHEDULED',
        game_start_date: { $lte: now },
      })
      .select('_id')
      .lean()
      .exec();
    for (const g of games) {
      try {
        await this.gamesService.startGame(String((g as { _id: unknown })._id), { adminBypass: true });
      } catch {
        // ignore per-game errors (e.g. no players)
      }
    }
  }
}
