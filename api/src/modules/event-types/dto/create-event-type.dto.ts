import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEventTypeDto {
  @ApiProperty({
    description: 'Name of the event type',
    example: 'Conference',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'URL-friendly slug for the event type (auto-generated from name if not provided)',
    example: 'conference',
  })
  slug?: string;

  @ApiPropertyOptional({
    description: 'Description of the event type',
    example: 'Business conferences and seminars',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Status of the event type',
    example: 'active',
    enum: ['active', 'inactive'],
  })
  status?: string;
}

