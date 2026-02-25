import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateWinningPatternDto {
  @ApiPropertyOptional({ description: 'Name', example: 'Line' })
  name?: string;

  @ApiPropertyOptional({ description: 'Slug', example: 'line' })
  slug?: string;

  @ApiPropertyOptional({ description: 'Status', example: 'active', enum: ['active', 'inactive'] })
  status?: string;

  @ApiPropertyOptional({ description: 'Pattern type: BASIC or ADVANCED', enum: ['BASIC', 'ADVANCED'] })
  pattern_type?: string;
}
