import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { GameInvitesService } from './game-invites.service';
import { CreateInviteDto } from './dto/create-invite.dto';

@ApiTags('game-invites')
@Controller('game-invites')
export class GameInvitesController {
  constructor(private readonly gameInvitesService: GameInvitesService) {}

  @Post()
  @ApiBody({ type: CreateInviteDto })
  create(@Body() dto: CreateInviteDto) {
    return this.gameInvitesService.create(dto);
  }

  @Get('game/:gameId')
  findByGame(@Param('gameId') gameId: string) {
    return this.gameInvitesService.findByGame(gameId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gameInvitesService.findOne(id);
  }

  @Post(':id/accept')
  accept(@Param('id') id: string) {
    return this.gameInvitesService.accept(id);
  }

  @Post(':id/revoke')
  @ApiQuery({ name: 'revokedBy', required: true, description: 'User ID of revoker (must be inviter)' })
  revoke(@Param('id') id: string, @Query('revokedBy') revokedBy: string) {
    return this.gameInvitesService.revoke(id, revokedBy);
  }
}
