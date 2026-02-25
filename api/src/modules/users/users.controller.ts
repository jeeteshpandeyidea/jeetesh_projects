import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiBody({ type: CreateUserDto })
  create(@Body() dto: CreateUserDto, @Req() req: Request) {
    const body = req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0
      ? req.body
      : (dto as unknown as Record<string, unknown>);
    const email = body?.email != null ? String(body.email).trim() : '';
    const username = body?.username != null ? String(body.username).trim() : '';
    const password = body?.password != null ? String(body.password) : '';
    const fullName = body?.fullName != null ? String(body.fullName).trim() : '';
    if (!email || !username || !password || !fullName) {
      throw new BadRequestException(
        'Request body must be application/json with: email, username, password, fullName (all required). Optional: roles, phone, profilePhoto.',
      );
    }
    return this.usersService.create({
      email,
      username,
      password,
      fullName,
      roles: Array.isArray(body.roles) ? body.roles.map((r: unknown) => String(r)) : [],
      phone: body.phone != null ? String(body.phone).trim() : undefined,
      profilePhoto: body.profilePhoto != null ? String(body.profilePhoto) : undefined,
    });
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}


