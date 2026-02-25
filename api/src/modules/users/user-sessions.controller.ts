import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { UserSessionsService } from './user-sessions.service';
import { CreateUserSessionDto } from './dto/create-user-session.dto';
import { UpdateUserSessionDto } from './dto/update-user-session.dto';

@ApiTags('user-sessions')
@Controller('user-sessions')
export class UserSessionsController {
  constructor(private readonly userSessionsService: UserSessionsService) {}

  @Post()
  @ApiBody({ type: CreateUserSessionDto })
  create(@Body() dto: CreateUserSessionDto) {
    return this.userSessionsService.create(dto);
  }

  @Get()
  findAll() {
    return this.userSessionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userSessionsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserSessionDto) {
    return this.userSessionsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userSessionsService.remove(id);
  }
}


