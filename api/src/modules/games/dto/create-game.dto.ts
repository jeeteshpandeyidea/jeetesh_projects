import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGameDto {
  @ApiProperty({ description: 'Game name', example: 'Weekend Bingo' })
  name: string;

  @ApiPropertyOptional({ description: 'Event ID (references Events)', example: '665f1a4b2c3d4e5f6a7b8d0e' })
  event_id?: string;

  @ApiPropertyOptional({ description: 'Category ID (references Categories)' })
  category_id?: string;

  @ApiPropertyOptional({ description: 'Grid Size ID (references GridSizes)' })
  grid_size_id?: string;

  @ApiPropertyOptional({ description: 'Card Generation Type ID (references CardGenerationTypes)' })
  card_gen_id?: string;

  @ApiPropertyOptional({ description: 'Game Type ID (references Game Types)' })
  game_type_id?: string;

  @ApiPropertyOptional({ description: 'Winning Pattern ID (references WinningPatterns)' })
  winning_patt_id?: string;

  @ApiPropertyOptional({ description: 'Winning Pattern Type ID (references WinningPatternTypes, must belong to winning_patt_id)' })
  winning_pattern_type_id?: string;

  @ApiPropertyOptional({ description: 'Access control: false = open, true = closed', default: false })
  access_control?: boolean;

  @ApiPropertyOptional({ description: 'Maximum players', example: 10 })
  max_player?: number;

  @ApiPropertyOptional({ description: 'Game start date (ISO string)', example: '2026-03-01T09:00:00Z' })
  game_start_date?: string;

  @ApiPropertyOptional({ description: 'Game description' })
  description?: string;

  @ApiPropertyOptional({ description: 'Status', example: 'DRAFT', enum: ['DRAFT', 'SCHEDULED', 'ACTIVE', 'COMPLETED'] })
  status?: string;

  @ApiPropertyOptional({ description: 'Game mode: STANDARD = first winner ends; ELIMINATION = until 1 left', enum: ['STANDARD', 'ELIMINATION'], default: 'STANDARD' })
  game_mode?: string;

  @ApiPropertyOptional({ description: 'Winner user ID (nullable)', nullable: true })
  winner_id?: string | null;

  @ApiPropertyOptional({ description: 'User ID creating the game (for premium/ADVANCED checks). Omit for admin bypass.' })
  created_by?: string;
}
