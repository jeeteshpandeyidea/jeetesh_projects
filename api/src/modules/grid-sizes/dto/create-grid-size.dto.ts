import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGridSizeDto {
  @ApiProperty({ description: 'Name of the grid size', example: 'Small' })
  name: string;

  @ApiPropertyOptional({
    description: 'URL-friendly slug for the grid size (auto-generated from name if not provided)',
    example: 'small',
  })
  slug?: string;

  @ApiPropertyOptional({ description: 'Status', example: 'active', enum: ['active', 'inactive'] })
  status?: string;
}
