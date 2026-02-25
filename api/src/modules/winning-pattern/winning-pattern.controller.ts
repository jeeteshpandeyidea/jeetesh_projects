import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { WinningPatternService } from './winning-pattern.service';
import { CreateWinningPatternDto } from './dto/create-winning-pattern.dto';
import { UpdateWinningPatternDto } from './dto/update-winning-pattern.dto';

@ApiTags('winning-pattern')
@Controller('winning-pattern')
export class WinningPatternController {
  constructor(private readonly service: WinningPatternService) {}

  @Post()
  @ApiBody({ type: CreateWinningPatternDto })
  create(@Body() dto: CreateWinningPatternDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateWinningPatternDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
