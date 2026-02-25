import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GameCard, GameCardSchema } from './schemas/game-card.schema';
import { GameCardsService } from './game-cards.service';
import { GameCardsController } from './game-cards.controller';
import { GamesModule } from '../games/games.module';
import { GridSizesModule } from '../grid-sizes/grid-sizes.module';
import { AssetsModule } from '../assets/assets.module';
import { UsersModule } from '../users/users.module';
import { WinningPatternModule } from '../winning-pattern/winning-pattern.module';
import { WinningPatternType, WinningPatternTypeSchema } from '../winning-pattern-types/schemas/winning-pattern-type.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GameCard.name, schema: GameCardSchema },
      { name: WinningPatternType.name, schema: WinningPatternTypeSchema },
    ]),
    GamesModule,
    GridSizesModule,
    AssetsModule,
    UsersModule,
    WinningPatternModule,
  ],
  providers: [GameCardsService],
  controllers: [GameCardsController],
  exports: [GameCardsService],
})
export class GameCardsModule {}
