import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { RoomTypesService } from './room-types.service';
import { CreateRoomTypeDto } from './dto/create-room-type.dto';
import { UpdateRoomTypeDto } from './dto/update-room-type.dto';

@ApiTags('room-types')
@Controller('room-types')
export class RoomTypesController {
  constructor(private readonly roomTypesService: RoomTypesService) {}

  @Post()
  @ApiBody({ type: CreateRoomTypeDto })
  create(@Body() dto: CreateRoomTypeDto) {
    return this.roomTypesService.create(dto);
  }

  @Get()
  findAll() {
    return this.roomTypesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roomTypesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRoomTypeDto) {
    return this.roomTypesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roomTypesService.remove(id);
  }
}

