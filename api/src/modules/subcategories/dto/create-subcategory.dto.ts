import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsMongoId, IsIn } from 'class-validator';

export class CreateSubCategoryDto {

  @ApiProperty({
    description: 'Name of the sub category',
    example: 'Lodging',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Short description of the sub category',
    example: 'Accommodation and lodging facilities',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Status of the sub category',
    example: 'active',
    enum: ['active', 'inactive'],
  })
  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: string;

  @ApiProperty({
    description: 'Category ID from categories collection',
    example: '65f1c2a4b1234567890abcd1',
  })
  @IsMongoId()
  @IsNotEmpty()
  category_id: string;
}
