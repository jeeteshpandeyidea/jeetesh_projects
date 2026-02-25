import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateEligibilityDto {
  @ApiPropertyOptional({ description: 'Name of the eligibility', example: 'Adult' })
  name?: string;

  @ApiPropertyOptional({ description: 'URL-friendly slug for the eligibility', example: 'adult' })
  slug?: string;

  @ApiPropertyOptional({
    description: 'Status of the eligibility',
    example: 'active',
    enum: ['active', 'inactive'],
  })
  status?: string;
}
