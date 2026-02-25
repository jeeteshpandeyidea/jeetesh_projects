import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsMongoId, IsIn } from 'class-validator';

export class CreateWinningPatternTypeDto {
  @ApiProperty({ description: 'Winning pattern ID', example: '65f1c2a4b1234567890abcd1' })
  @IsMongoId()
  @IsNotEmpty()
  winning_pattern_id: string;

  @ApiProperty({ description: 'Name', example: 'Line' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Slug (auto-generated from name if not provided)', example: 'line' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ description: 'Description', example: 'Single line win' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Status', example: 'active', enum: ['active', 'inactive'] })
  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: string;
}
