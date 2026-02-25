import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { FacilitiesService } from './facilities.service';
import { CreateFacilityDto } from './dto/create-facility.dto';
import { UpdateFacilityDto } from './dto/update-facility.dto';

@ApiTags('facilities')
@Controller('facilities')
export class FacilitiesController {
  constructor(private readonly facilitiesService: FacilitiesService) {}

  @Post()
  @ApiBody({ type: CreateFacilityDto })
  create(@Body() dto: CreateFacilityDto) {
    return this.facilitiesService.create(dto);
  }

  @Get()
  findAll() {
    return this.facilitiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.facilitiesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateFacilityDto) {
    return this.facilitiesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.facilitiesService.remove(id);
  }
}

