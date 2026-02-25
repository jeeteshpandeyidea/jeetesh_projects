import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Name of the category',
    example: 'Lodging',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Short description of the category',
    example: 'Accommodation and lodging facilities',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Status of the category',
    example: 'active',
    enum: ['active', 'inactive'],
  })
  status?: string;

  @ApiPropertyOptional({
    description: 'Visibility type of the category',
    example: 'FREE',
    enum: ['FREE', 'PREMIUM', 'ORG_ONLY'],
  })
  visibility_type?: string;
}
