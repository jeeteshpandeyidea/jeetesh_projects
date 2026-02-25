import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { EventTypesService } from './event-types.service';
import { CreateEventTypeDto } from './dto/create-event-type.dto';
import { UpdateEventTypeDto } from './dto/update-event-type.dto';

@ApiTags('event-types')
@Controller('event-types')
export class EventTypesController {
  constructor(private readonly eventTypesService: EventTypesService) {}

  @Post()
  @ApiBody({ type: CreateEventTypeDto })
  create(@Body() dto: CreateEventTypeDto) {
    return this.eventTypesService.create(dto);
  }

  @Get()
  findAll() {
    return this.eventTypesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventTypesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEventTypeDto) {
    return this.eventTypesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventTypesService.remove(id);
  }
}

