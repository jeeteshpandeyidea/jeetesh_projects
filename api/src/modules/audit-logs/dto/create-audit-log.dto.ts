import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAuditLogDto {
  @ApiProperty({
    description: 'User ID of the actor performing the action',
    example: '665f1a4b2c3d4e5f6a7b8c9d',
  })
  actor_user_id: string;

  @ApiProperty({
    description: 'Type of target affected (e.g. user, role, menu)',
    example: 'user',
  })
  target_type: string;

  @ApiProperty({
    description: 'Action performed',
    example: 'USER_CREATED',
  })
  action: string;

  @ApiPropertyOptional({
    description: 'Human-readable description of the change',
    example: 'User john.doe@example.com was created',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'IP address from which the action was performed',
    example: '192.168.1.100',
  })
  ipAddress?: string;
}


