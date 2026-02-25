import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { CardGenerationService } from './card-generation.service';
import { CreateCardGenerationDto } from './dto/create-card-generation.dto';
import { UpdateCardGenerationDto } from './dto/update-card-generation.dto';

@ApiTags('card-generation-type')
@Controller('card-generation-type')
export class CardGenerationController {
  constructor(private readonly service: CardGenerationService) {}

  @Post()
  @ApiBody({ type: CreateCardGenerationDto })
  create(@Body() dto: CreateCardGenerationDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateCardGenerationDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
