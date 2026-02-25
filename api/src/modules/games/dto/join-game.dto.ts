import { ApiProperty } from '@nestjs/swagger';

export class JoinGameDto {
  @ApiProperty({ description: 'Game code (e.g. GM001)' })
  gameCode: string;

  @ApiProperty({ description: 'User ID joining the game' })
  userId: string;
}
