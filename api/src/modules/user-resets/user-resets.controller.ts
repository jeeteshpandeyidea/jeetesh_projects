import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { UserResetsService } from './user-resets.service';
import { CreateUserResetDto } from './dto/create-user-reset.dto';
import { UpdateUserResetDto } from './dto/update-user-reset.dto';

@ApiTags('user-resets')
@Controller('user-resets')
export class UserResetsController {
  constructor(private readonly userResetsService: UserResetsService) {}

  @Post()
  @ApiBody({ type: CreateUserResetDto })
  create(@Body() dto: CreateUserResetDto) {
    return this.userResetsService.create(dto);
  }

  @Get()
  findAll() {
    return this.userResetsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userResetsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserResetDto) {
    return this.userResetsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userResetsService.remove(id);
  }
}


