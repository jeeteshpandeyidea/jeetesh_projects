import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { AuditLogsService } from './audit-logs.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { UpdateAuditLogDto } from './dto/update-audit-log.dto';

@ApiTags('audit-logs')
@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Post()
  @ApiBody({ type: CreateAuditLogDto })
  create(@Body() dto: CreateAuditLogDto) {
    return this.auditLogsService.create(dto);
  }

  @Get()
  findAll() {
    return this.auditLogsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.auditLogsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAuditLogDto) {
    return this.auditLogsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.auditLogsService.remove(id);
  }
}


