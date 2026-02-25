import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { MenuRouteService } from './menu-route.service';
import { CreateMenuRouteDto } from './dto/create-menu-route.dto';
import { UpdateMenuRouteDto } from './dto/update-menu-route.dto';

@ApiTags('menu-routes')
@Controller('menu-routes')
export class MenuRouteController {
  constructor(private readonly menuRouteService: MenuRouteService) {}

  @Post()
  @ApiBody({ type: CreateMenuRouteDto })
  create(@Body() dto: CreateMenuRouteDto) {
    return this.menuRouteService.create(dto);
  }

  @Get()
  findAll() {
    return this.menuRouteService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.menuRouteService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMenuRouteDto) {
    return this.menuRouteService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.menuRouteService.remove(id);
  }
}


