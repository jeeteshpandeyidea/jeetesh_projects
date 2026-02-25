import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateCardDto {
  @ApiProperty({ description: 'Game ID', example: '507f1f77bcf86cd799439011' })
  game_id: string;

  @ApiPropertyOptional({ description: 'User ID (for subscription/eligible assets). Omit for admin.' })
  user_id?: string;
}
