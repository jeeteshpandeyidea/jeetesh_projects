import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateGridSizeDto {
  @ApiPropertyOptional({ description: 'Name of the grid size', example: 'Small' })
  name?: string;

  @ApiPropertyOptional({ description: 'URL-friendly slug for the grid size', example: 'small' })
  slug?: string;

  @ApiPropertyOptional({ description: 'Status', example: 'active', enum: ['active', 'inactive'] })
  status?: string;
}
