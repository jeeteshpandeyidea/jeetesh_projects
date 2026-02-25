import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMenuRouteDto {
  @ApiProperty({
    description: 'Display name of the menu route',
    example: 'Dashboard',
  })
  name: string;

  @ApiProperty({
    description: 'URL or path this route points to',
    example: '/dashboard',
  })
  url: string;

  @ApiProperty({
    description: 'Menu ID this route belongs to',
    example: '507f1f77bcf86cd799439011',
  })
  menu_id: string;

  @ApiPropertyOptional({
    description: 'Status of the route',
    example: 'active',
  })
  status?: string;
}


