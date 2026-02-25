import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAssetDto {
  @ApiProperty({ description: 'Title', example: 'Krishna' })
  title: string;

  @ApiPropertyOptional({ description: 'Unique code (e.g. BNG001). Auto-generated if not provided.', example: 'BNG001' })
  code?: string;

  @ApiPropertyOptional({ description: 'Slug (auto-generated from title if not provided)', example: 'krishna' })
  slug?: string;

  @ApiPropertyOptional({ description: 'Description' })
  description?: string;

  @ApiProperty({ description: 'Image URL or path', example: '/uploads/asset.jpg' })
  imageUrl: string;

  @ApiPropertyOptional({ description: 'Thumbnail URL' })
  thumbnailUrl?: string;

  @ApiProperty({ description: 'Category ID', example: '507f1f77bcf86cd799439011' })
  categoryId: string;

  @ApiPropertyOptional({ description: 'Subcategory ID' })
  subcategoryId?: string;

  @ApiPropertyOptional({ description: 'Access level', enum: ['FREE', 'PREMIUM', 'ORG_ONLY'], default: 'FREE' })
  accessLevel?: string;

  @ApiPropertyOptional({ description: 'Is placeholder for custom square', default: false })
  isPlaceholder?: boolean;

  @ApiPropertyOptional({ description: 'Status', enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' })
  status?: string;

  @ApiPropertyOptional({ description: 'Sort order for UI', default: 0 })
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'Tags for search', type: [String] })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Created by user ID' })
  createdBy?: string;
}
