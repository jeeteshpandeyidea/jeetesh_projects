import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFacilityDto {
  @ApiProperty({
    description: 'Name of the facility',
    example: 'Swimming Pool',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'URL-friendly slug for the facility (auto-generated from name if not provided)',
    example: 'swimming-pool',
  })
  slug?: string;

  @ApiPropertyOptional({
    description: 'Description of the facility',
    example: 'Outdoor swimming pool with modern amenities',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Status of the facility',
    example: 'active',
    enum: ['active', 'inactive'],
  })
  status?: string;
}

