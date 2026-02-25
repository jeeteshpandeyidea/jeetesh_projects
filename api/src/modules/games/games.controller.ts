import { Body, Controller, Delete, Get, Headers, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBody, ApiHeader, ApiQuery, ApiTags } from '@nestjs/swagger';
import { GamesService } from './games.service';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { JoinGameDto } from './dto/join-game.dto';
import { LeaveGameDto } from './dto/leave-game.dto';

@ApiTags('games')
@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Post()
  @ApiBody({ type: CreateGameDto })
  create(@Body() dto: CreateGameDto) {
    return this.gamesService.create(dto);
  }

  @Get()
  findAll() {
    return this.gamesService.findAll();
  }

  @Get('open')
  findOpen() {
    return this.gamesService.findOpen();
  }

  @Get('my')
  @ApiQuery({ name: 'userId', required: true, description: 'Current user ID (or set via auth)' })
  findMyGames(@Query('userId') userId: string) {
    return this.gamesService.findMyGames(userId);
  }

  @Post('join')
  @ApiBody({ type: JoinGameDto })
  joinByCode(@Body() dto: JoinGameDto) {
    return this.gamesService.joinByCode(dto.gameCode, dto.userId);
  }

  @Post(':id/leave')
  @ApiBody({ type: LeaveGameDto })
  leave(@Param('id') id: string, @Body() dto: LeaveGameDto) {
    return this.gamesService.leaveGame(id, dto.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gamesService.findOne(id);
  }

  @Post(':id/start')
  @ApiHeader({ name: 'X-Admin-Bypass', required: false, description: 'Set to true to start with no players (admin only)' })
  startGame(@Param('id') id: string, @Headers('x-admin-bypass') adminBypass?: string) {
    const options = adminBypass === 'true' || adminBypass === '1' ? { adminBypass: true } : undefined;
    return this.gamesService.startGame(id, options);
  }

  @Patch(':id')
  @ApiHeader({ name: 'X-Admin-Bypass', required: false, description: 'Set to true to bypass "cannot start if no players" (admin only)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateGameDto,
    @Headers('x-admin-bypass') adminBypass?: string,
  ) {
    const options = adminBypass === 'true' || adminBypass === '1' ? { adminBypass: true } : undefined;
    return this.gamesService.update(id, dto, options);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.gamesService.remove(id);
  }
}
