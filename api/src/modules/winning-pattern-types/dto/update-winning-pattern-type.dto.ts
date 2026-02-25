import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsMongoId, IsIn } from 'class-validator';

export class UpdateWinningPatternTypeDto {
  @ApiPropertyOptional({ description: 'Winning pattern ID' })
  @IsOptional()
  @IsMongoId()
  winning_pattern_id?: string;

  @ApiPropertyOptional({ description: 'Name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Slug' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Status', enum: ['active', 'inactive'] })
  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: string;
}
