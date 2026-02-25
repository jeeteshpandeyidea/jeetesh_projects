import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { WinningPatternTypesService } from './winning-pattern-types.service';
import { CreateWinningPatternTypeDto } from './dto/create-winning-pattern-type.dto';
import { UpdateWinningPatternTypeDto } from './dto/update-winning-pattern-type.dto';

@ApiTags('winning-pattern-types')
@Controller('winning-pattern-types')
export class WinningPatternTypesController {
  constructor(private readonly service: WinningPatternTypesService) {}

  @Post()
  @ApiBody({ type: CreateWinningPatternTypeDto })
  create(@Body() dto: CreateWinningPatternTypeDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiQuery({ name: 'winning_pattern_id', required: false, description: 'Filter by winning pattern ID' })
  findAll(@Query('winning_pattern_id') winningPatternId?: string) {
    if (winningPatternId?.trim()) return this.service.findByWinningPatternId(winningPatternId.trim());
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateWinningPatternTypeDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
