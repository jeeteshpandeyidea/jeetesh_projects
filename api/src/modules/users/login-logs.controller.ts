import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { LoginLogsService } from './login-logs.service';
import { CreateLoginLogDto } from './dto/create-login-log.dto';
import { UpdateLoginLogDto } from './dto/update-login-log.dto';

@ApiTags('login-logs')
@Controller('login-logs')
export class LoginLogsController {
  constructor(private readonly loginLogsService: LoginLogsService) {}

  @Post()
  @ApiBody({ type: CreateLoginLogDto })
  create(@Body() dto: CreateLoginLogDto) {
    return this.loginLogsService.create(dto);
  }

  @Get()
  findAll() {
    return this.loginLogsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.loginLogsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLoginLogDto) {
    return this.loginLogsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.loginLogsService.remove(id);
  }
}


