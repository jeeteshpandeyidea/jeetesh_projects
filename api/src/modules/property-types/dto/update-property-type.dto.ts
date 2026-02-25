import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePropertyTypeDto {
  @ApiPropertyOptional({
    description: 'Name of the property type',
    example: 'Apartment',
  })
  name?: string;

  @ApiPropertyOptional({
    description: 'URL-friendly slug for the property type (auto-generated from name if name is updated)',
    example: 'apartment',
  })
  slug?: string;

  @ApiPropertyOptional({
    description: 'Description of the property type',
    example: 'Residential apartment units',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Status of the property type',
    example: 'active',
    enum: ['active', 'inactive'],
  })
  status?: string;
}

