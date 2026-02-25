import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAchievementCriteriaDto {
  @ApiProperty({ description: 'Name', example: 'First Win' })
  name: string;

  @ApiPropertyOptional({ description: 'Slug (auto-generated from name if not provided)', example: 'first-win' })
  slug?: string;

  @ApiPropertyOptional({ description: 'Status', example: 'active', enum: ['active', 'inactive'] })
  status?: string;
}
