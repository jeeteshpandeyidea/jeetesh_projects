import { ApiProperty } from '@nestjs/swagger';

export class CreateInviteDto {
  @ApiProperty({ description: 'Game ID' })
  game_id: string;

  @ApiProperty({ description: 'User ID to invite' })
  invitedUserId: string;

  @ApiProperty({ description: 'User ID of the inviter (creator)' })
  invitedBy: string;
}
