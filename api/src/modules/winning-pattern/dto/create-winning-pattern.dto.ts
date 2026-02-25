import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsIn } from 'class-validator';

export class CreateWinningPatternDto {
  @ApiProperty({ description: 'Name', example: 'Line' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Slug (auto-generated from name if not provided)', example: 'line' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ description: 'Status', example: 'active', enum: ['active', 'inactive'] })
  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: string;

  @ApiPropertyOptional({ description: 'Pattern type: BASIC (all users) or ADVANCED (premium only)', example: 'BASIC', enum: ['BASIC', 'ADVANCED'] })
  @IsOptional()
  @IsIn(['BASIC', 'ADVANCED'])
  pattern_type?: string;
}
