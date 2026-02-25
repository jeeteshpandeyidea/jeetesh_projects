import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({
    description: 'Name of the event',
    example: 'Tech Conference 2024',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'URL-friendly slug for the event (auto-generated from name if not provided)',
    example: 'tech-conference-2024',
  })
  slug?: string;

  @ApiPropertyOptional({
    description: 'Category ID (references Categories)',
    example: '665f1a4b2c3d4e5f6a7b8d0e',
  })
  category_id?: string;

  @ApiProperty({
    description: 'Event Type ID (references EventTypes)',
    example: '665f1a4b2c3d4e5f6a7b8d0e',
  })
  event_type_id: string;

  @ApiPropertyOptional({
    description: 'Start date/time for the event (ISO string)',
    example: '2026-03-01T09:00:00Z',
  })
  start_date?: string;

  @ApiPropertyOptional({
    description: 'End date/time for the event (ISO string)',
    example: '2026-03-01T17:00:00Z',
  })
  end_date?: string;

  @ApiPropertyOptional({
    description: 'Eligibility ID (references Eligibilities)',
    example: '665f1a4b2c3d4e5f6a7b8d0e',
  })
  eligibility_id?: string;

  @ApiPropertyOptional({
    description: 'Winning condition (text input)',
    example: 'First to complete 5 rounds',
  })
  winning_condition?: string;

  @ApiPropertyOptional({
    description: 'Game Type ID (references Game Types)',
    example: '665f1a4b2c3d4e5f6a7b8d0e',
  })
  game_type_id?: string;

  @ApiPropertyOptional({
    description: 'Maximum number of participants',
    example: 100,
  })
  max_participants?: number;

  @ApiPropertyOptional({
    description: 'Reward ID (references Rewards module)',
    example: '665f1a4b2c3d4e5f6a7b8d0e',
  })
  reward_id?: string;

  @ApiPropertyOptional({
    description: 'Reward value (points, amount, etc.)',
    example: 500,
  })
  rewards_value?: number;

  @ApiPropertyOptional({
    description: 'Rewards distribution method',
    example: 'top-3',
  })
  distribution?: string;

  @ApiPropertyOptional({
    description: 'Status of the event',
    example: 'active',
    enum: ['active', 'inactive'],
  })
  status?: string;

  @ApiPropertyOptional({
    description: 'Event description',
    example: 'Annual tech conference',
  })
  description?: string;
}
