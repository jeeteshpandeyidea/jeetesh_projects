import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { GridSizesService } from './grid-sizes.service';
import { CreateGridSizeDto } from './dto/create-grid-size.dto';
import { UpdateGridSizeDto } from './dto/update-grid-size.dto';

@ApiTags('grid-sizes')
@Controller('grid-sizes')
export class GridSizesController {
  constructor(private readonly service: GridSizesService) {}

  @Post()
  @ApiBody({ type: CreateGridSizeDto })
  create(@Body() dto: CreateGridSizeDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateGridSizeDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
