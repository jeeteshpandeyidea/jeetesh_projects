import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { AchievementCriteriaService } from './achievement-criteria.service';
import { CreateAchievementCriteriaDto } from './dto/create-achievement-criteria.dto';
import { UpdateAchievementCriteriaDto } from './dto/update-achievement-criteria.dto';

@ApiTags('achievement-criteria')
@Controller('achievement-criteria')
export class AchievementCriteriaController {
  constructor(private readonly service: AchievementCriteriaService) {}

  @Post()
  @ApiBody({ type: CreateAchievementCriteriaDto })
  create(@Body() dto: CreateAchievementCriteriaDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateAchievementCriteriaDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
