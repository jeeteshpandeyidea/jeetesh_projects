import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAchievementCriteriaDto {
  @ApiPropertyOptional({ description: 'Name', example: 'First Win' })
  name?: string;

  @ApiPropertyOptional({ description: 'Slug', example: 'first-win' })
  slug?: string;

  @ApiPropertyOptional({ description: 'Status', example: 'active', enum: ['active', 'inactive'] })
  status?: string;
}
