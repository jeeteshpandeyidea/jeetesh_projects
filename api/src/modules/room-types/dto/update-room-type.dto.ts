import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateRoomTypeDto {
  @ApiPropertyOptional({
    description: 'Name of the room type',
    example: 'Deluxe Suite',
  })
  name?: string;

  @ApiPropertyOptional({
    description: 'URL-friendly slug for the room type (auto-generated from name if name is updated)',
    example: 'deluxe-suite',
  })
  slug?: string;

  @ApiPropertyOptional({
    description: 'Description of the room type',
    example: 'Spacious room with premium amenities',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Status of the room type',
    example: 'active',
    enum: ['active', 'inactive'],
  })
  status?: string;
}

