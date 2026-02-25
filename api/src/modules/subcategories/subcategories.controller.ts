import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { SubCategoriesService } from './subcategories.service';
import { CreateSubCategoryDto } from './dto/create-subcategory.dto';
import { UpdateSubCategoryDto } from './dto/update-subcategory.dto';

@ApiTags('subcategories')
@Controller('subcategories')
export class SubCategoriesController {
  constructor(private readonly subCategoriesService: SubCategoriesService) {}

    @Post()
    @ApiBody({ type: CreateSubCategoryDto })
    create(@Body() dto: CreateSubCategoryDto) {
      console.log('Received DTO:', dto); // Debug log to check the incoming data
      return this.subCategoriesService.create(dto);
    }

  @Get()
  findAll() {
    return this.subCategoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subCategoriesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSubCategoryDto) {
    return this.subCategoriesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subCategoriesService.remove(id);
  }
}
