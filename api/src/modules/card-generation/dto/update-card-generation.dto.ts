import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCardGenerationDto {
  @ApiPropertyOptional({ description: 'Name', example: 'Standard' })
  name?: string;

  @ApiPropertyOptional({ description: 'Slug', example: 'standard' })
  slug?: string;

  @ApiPropertyOptional({ description: 'Status', example: 'active', enum: ['active', 'inactive'] })
  status?: string;
}
