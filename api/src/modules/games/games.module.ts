import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Game, GameSchema } from './schemas/game.schema';
import { GamesService } from './games.service';
import { GamesController } from './games.controller';
import { GamesSchedulerService } from './games-scheduler.service';
import { CategoriesModule } from '../categories/categories.module';
import { WinningPatternModule } from '../winning-pattern/winning-pattern.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Game.name, schema: GameSchema }]),
    CategoriesModule,
    WinningPatternModule,
    UsersModule,
  ],
  providers: [GamesService, GamesSchedulerService],
  controllers: [GamesController],
  exports: [MongooseModule, GamesService],
})
export class GamesModule {}
