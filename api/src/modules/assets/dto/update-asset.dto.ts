import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAssetDto {
  @ApiPropertyOptional({ description: 'Title' })
  title?: string;

  @ApiPropertyOptional({ description: 'Unique code (e.g. BNG001)' })
  code?: string;

  @ApiPropertyOptional({ description: 'Slug' })
  slug?: string;

  @ApiPropertyOptional({ description: 'Description' })
  description?: string;

  @ApiPropertyOptional({ description: 'Image URL or path' })
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Thumbnail URL' })
  thumbnailUrl?: string;

  @ApiPropertyOptional({ description: 'Category ID' })
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Subcategory ID' })
  subcategoryId?: string;

  @ApiPropertyOptional({ description: 'Access level', enum: ['FREE', 'PREMIUM', 'ORG_ONLY'] })
  accessLevel?: string;

  @ApiPropertyOptional({ description: 'Is placeholder' })
  isPlaceholder?: boolean;

  @ApiPropertyOptional({ description: 'Status', enum: ['ACTIVE', 'INACTIVE'] })
  status?: string;

  @ApiPropertyOptional({ description: 'Sort order' })
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'Tags', type: [String] })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Updated by user ID' })
  updatedBy?: string;
}
