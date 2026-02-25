import { ApiProperty } from '@nestjs/swagger';

export class CreateRolePermissionDto {
  @ApiProperty({
    description: 'Role identifier (e.g. Role document ID)',
    example: '665f1a4b2c3d4e5f6a7b8c9d',
  })
  role_id: string;

  @ApiProperty({
    description: 'Module name this permission applies to',
    example: 'users',
  })
  module: string;

  @ApiProperty({
    description: 'Permission key or action',
    example: 'users.read',
  })
  permission: string;

  @ApiProperty({
    description: 'Menu identifier this permission is linked to (e.g. MenuRoute ID)',
    example: '665f1a4b2c3d4e5f6a7b8d0e',
  })
  menu_id: string;
}


