import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRewardDto {
  @ApiProperty({ description: 'Name', example: 'Gold Trophy' })
  name: string;

  @ApiPropertyOptional({ description: 'Slug (auto-generated from name if not provided)', example: 'gold-trophy' })
  slug?: string;

  @ApiPropertyOptional({ description: 'Value (e.g. points, amount)', example: 100 })
  value?: number;

  @ApiPropertyOptional({ description: 'Status', example: 'active', enum: ['active', 'inactive'] })
  status?: string;
}
