import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateGameTypeDto {
  @ApiPropertyOptional({
    description: 'Name of the game mode',
    example: 'Arcade',
  })
  name?: string;

  @ApiPropertyOptional({
    description: 'URL-friendly slug for the game mode',
    example: 'arcade',
  })
  slug?: string;

  @ApiPropertyOptional({
    description: 'Description of the game mode',
    example: 'Fast-paced arcade-style games',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Status of the game mode',
    example: 'active',
    enum: ['active', 'inactive'],
  })
  status?: string;
}
