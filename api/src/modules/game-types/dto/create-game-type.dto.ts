import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGameTypeDto {
  @ApiProperty({
    description: 'Name of the game mode',
    example: 'Arcade',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'URL-friendly slug for the game mode (auto-generated from name if not provided)',
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
