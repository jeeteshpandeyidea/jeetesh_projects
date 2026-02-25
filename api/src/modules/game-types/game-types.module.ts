import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GameType, GameTypeSchema } from './schemas/game-type.schema';
import { GameTypesService } from './game-types.service';
import { GameTypesController } from './game-types.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: GameType.name, schema: GameTypeSchema }]),
  ],
  providers: [GameTypesService],
  controllers: [GameTypesController],
  exports: [GameTypesService],
})
export class GameTypesModule {}
