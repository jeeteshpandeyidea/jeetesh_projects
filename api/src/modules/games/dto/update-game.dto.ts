import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateGameDto {
  @ApiPropertyOptional({ description: 'Game name' })
  name?: string;

  @ApiPropertyOptional({ description: 'Event ID (references Events)' })
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

  @ApiPropertyOptional({ description: 'Winning Pattern Type ID (references WinningPatternTypes)' })
  winning_pattern_type_id?: string;

  @ApiPropertyOptional({ description: 'Winning Pattern Type IDs – win when ANY is completed (e.g. Full House or Any Horizontal Line)', type: [String] })
  winning_pattern_type_ids?: string[];

  @ApiPropertyOptional({ description: 'Access control: false = open, true = closed' })
  access_control?: boolean;

  @ApiPropertyOptional({ description: 'Maximum players' })
  max_player?: number;

  @ApiPropertyOptional({ description: 'Game start date (ISO string)' })
  game_start_date?: string;

  @ApiPropertyOptional({ description: 'Game description' })
  description?: string;

  @ApiPropertyOptional({ description: 'Status', enum: ['DRAFT', 'SCHEDULED', 'ACTIVE', 'COMPLETED'] })
  status?: string;

  @ApiPropertyOptional({ description: 'Game mode', enum: ['STANDARD', 'ELIMINATION'] })
  game_mode?: string;

  @ApiPropertyOptional({ description: 'Winner user ID (nullable)', nullable: true })
  winner_id?: string | null;

  @ApiPropertyOptional({ description: 'Player user IDs (joined players)' })
  player_ids?: string[];

  @ApiPropertyOptional({ description: 'Waitlist user IDs (when game is full)' })
  waitlist_ids?: string[];

  @ApiPropertyOptional({ description: 'Eliminated player IDs (ELIMINATION mode)' })
  eliminated_player_ids?: string[];
}
