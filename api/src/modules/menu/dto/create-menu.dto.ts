import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMenuDto {
  @ApiProperty({
    description: 'Display name of the menu item',
    example: 'Dashboard',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Status of the menu item',
    example: 'active',
  })
  status?: string;
}


