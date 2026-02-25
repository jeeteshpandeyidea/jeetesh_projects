import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCardGenerationDto {
  @ApiProperty({ description: 'Name', example: 'Standard' })
  name: string;

  @ApiPropertyOptional({ description: 'Slug (auto-generated from name if not provided)', example: 'standard' })
  slug?: string;

  @ApiPropertyOptional({ description: 'Status', example: 'active', enum: ['active', 'inactive'] })
  status?: string;
}
