import { ApiProperty } from '@nestjs/swagger';

export class LeaveGameDto {
  @ApiProperty({ description: 'User ID leaving the game' })
  userId: string;
}