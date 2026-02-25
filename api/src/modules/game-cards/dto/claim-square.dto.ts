import { ApiProperty } from '@nestjs/swagger';

export class ClaimSquareDto {
  @ApiProperty({ description: 'Zero-based index of the square to claim' })
  squareIndex: number;

  @ApiProperty({ description: 'User ID claiming the square (card owner)' })
  userId: string;
}
