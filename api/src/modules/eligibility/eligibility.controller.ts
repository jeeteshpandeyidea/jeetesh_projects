import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { EligibilityService } from './eligibility.service';
import { CreateEligibilityDto } from './dto/create-eligibility.dto';
import { UpdateEligibilityDto } from './dto/update-eligibility.dto';

@ApiTags('eligibility')
@Controller('eligibility')
export class EligibilityController {
  constructor(private readonly eligibilityService: EligibilityService) {}

  @Post()
  @ApiBody({ type: CreateEligibilityDto })
  create(@Body() dto: CreateEligibilityDto) {
    return this.eligibilityService.create(dto);
  }

  @Get()
  findAll() {
    return this.eligibilityService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eligibilityService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEligibilityDto) {
    return this.eligibilityService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eligibilityService.remove(id);
  }
}
