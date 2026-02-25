import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEligibilityDto {
  @ApiProperty({ description: 'Name of the eligibility', example: 'Adult' })
  name: string;

  @ApiPropertyOptional({
    description: 'URL-friendly slug for the eligibility (auto-generated from name if not provided)',
    example: 'adult',
  })
  slug?: string;

  @ApiPropertyOptional({
    description: 'Status of the eligibility',
    example: 'active',
    enum: ['active', 'inactive'],
  })
  status?: string;
}
