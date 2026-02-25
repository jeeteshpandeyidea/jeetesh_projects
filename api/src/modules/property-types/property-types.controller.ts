import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { PropertyTypesService } from './property-types.service';
import { CreatePropertyTypeDto } from './dto/create-property-type.dto';
import { UpdatePropertyTypeDto } from './dto/update-property-type.dto';

@ApiTags('property-types')
@Controller('property-types')
export class PropertyTypesController {
  constructor(private readonly propertyTypesService: PropertyTypesService) {}

  @Post()
  @ApiBody({ type: CreatePropertyTypeDto })
  create(@Body() dto: CreatePropertyTypeDto) {
    return this.propertyTypesService.create(dto);
  }

  @Get()
  findAll() {
    return this.propertyTypesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.propertyTypesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePropertyTypeDto) {
    return this.propertyTypesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.propertyTypesService.remove(id);
  }
}

