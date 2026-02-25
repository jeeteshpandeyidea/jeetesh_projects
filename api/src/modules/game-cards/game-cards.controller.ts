import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { GameCardsService } from './game-cards.service';
import { GenerateCardDto } from './dto/generate-card.dto';
import { UpdateCardSquaresDto } from './dto/update-card-squares.dto';
import { ClaimSquareDto } from './dto/claim-square.dto';

@ApiTags('game-cards')
@Controller('game-cards')
export class GameCardsController {
  constructor(private readonly gameCardsService: GameCardsService) {}

  @Post('generate')
  @ApiBody({ type: GenerateCardDto })
  generate(@Body() dto: GenerateCardDto) {
    return this.gameCardsService.generateCard(dto);
  }

  @Post(':id/regenerate')
  regenerate(@Param('id') id: string) {
    return this.gameCardsService.regenerateCard(id);
  }

  @Get()
  @ApiQuery({ name: 'gameId', required: true })
  @ApiQuery({ name: 'userId', required: false })
  findByGame(@Query('gameId') gameId: string, @Query('userId') userId?: string) {
    return this.gameCardsService.findByGameAndUser(gameId, userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gameCardsService.findOne(id);
  }

  @Patch(':id/squares')
  @ApiBody({ type: UpdateCardSquaresDto })
  updateSquares(@Param('id') id: string, @Body() dto: UpdateCardSquaresDto) {
    return this.gameCardsService.updateSquares(id, dto);
  }

  @Post(':id/claim')
  @ApiBody({ type: ClaimSquareDto })
  claimSquare(@Param('id') id: string, @Body() dto: ClaimSquareDto) {
    return this.gameCardsService.claimSquare(id, dto.squareIndex, dto.userId);
  }
}
