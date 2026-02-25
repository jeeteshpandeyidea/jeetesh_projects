import { ApiPropertyOptional } from '@nestjs/swagger';

class SquareItemDto {
  @ApiPropertyOptional() asset_id?: string | null;
  @ApiPropertyOptional() isCustom?: boolean;
  @ApiPropertyOptional() customText?: string;
  @ApiPropertyOptional() claimed?: boolean;
  @ApiPropertyOptional() claimedAt?: string | null;
}

export class UpdateCardSquaresDto {
  @ApiPropertyOptional({ type: [SquareItemDto], description: 'Full or partial squares array (by index)' })
  squares?: SquareItemDto[];
}
