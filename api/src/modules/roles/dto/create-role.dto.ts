import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({
    description: 'Unique role name',
    example: 'Admin',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Optional description of the role',
    example: 'Has full access to all resources',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'List of permission identifiers',
    type: [String],
    example: ['user.read', 'user.write'],
  })
  permissions?: string[];
}


