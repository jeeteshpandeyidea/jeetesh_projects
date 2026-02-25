import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateEventTypeDto {
  @ApiPropertyOptional({
    description: 'Name of the event type',
    example: 'Conference',
  })
  name?: string;

  @ApiPropertyOptional({
    description: 'URL-friendly slug for the event type',
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

