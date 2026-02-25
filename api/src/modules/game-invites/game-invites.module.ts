import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GameInvite, GameInviteSchema } from './schemas/game-invite.schema';
import { Game, GameSchema } from '../games/schemas/game.schema';
import { GameInvitesService } from './game-invites.service';
import { GameInvitesController } from './game-invites.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GameInvite.name, schema: GameInviteSchema },
      { name: Game.name, schema: GameSchema },
    ]),
  ],
  providers: [GameInvitesService],
  controllers: [GameInvitesController],
  exports: [GameInvitesService],
})
export class GameInvitesModule {}
