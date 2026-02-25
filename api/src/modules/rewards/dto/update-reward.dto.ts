import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateRewardDto {
  @ApiPropertyOptional({ description: 'Name', example: 'Gold Trophy' })
  name?: string;

  @ApiPropertyOptional({ description: 'Slug', example: 'gold-trophy' })
  slug?: string;

  @ApiPropertyOptional({ description: 'Value', example: 100 })
  value?: number;

  @ApiPropertyOptional({ description: 'Status', example: 'active', enum: ['active', 'inactive'] })
  status?: string;
}
