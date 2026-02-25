import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { GameTypesService } from './game-types.service';
import { CreateGameTypeDto } from './dto/create-game-type.dto';
import { UpdateGameTypeDto } from './dto/update-game-type.dto';

@ApiTags('game-type')
@Controller('game-type')
export class GameTypesController {
  constructor(private readonly gameTypesService: GameTypesService) {}

  @Post()
  @ApiBody({ type: CreateGameTypeDto })
  create(@Body() dto: CreateGameTypeDto) {
    return this.gameTypesService.create(dto);
  }

  @Get()
  findAll() {
    return this.gameTypesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gameTypesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateGameTypeDto) {
    return this.gameTypesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.gameTypesService.remove(id);
  }
}
