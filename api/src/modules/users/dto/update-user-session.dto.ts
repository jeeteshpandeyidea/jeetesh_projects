import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserSessionDto {
  @ApiPropertyOptional({
    description: 'User identifier (e.g. User document ID)',
    example: '665f1a4b2c3d4e5f6a7b8c9d',
  })
  user_id?: string;

  @ApiPropertyOptional({
    description: 'Refresh token value',
    example: 'refresh-token-uuid-or-jwt',
  })
  refreshToken?: string;

  @ApiPropertyOptional({
    description: 'Access token value',
    example: 'access-token-jwt',
  })
  accessToken?: string;

  @ApiPropertyOptional({
    description: 'Information about the device (agent, OS, etc.)',
    example: 'Chrome on Windows 11',
  })
  deviceInfo?: string;

  @ApiPropertyOptional({
    description: 'Device name or description',
    example: 'iPhone 13 Pro',
  })
  deviceName?: string;

  @ApiPropertyOptional({
    description: 'Device type (Mobile, Tablet, Desktop)',
    example: 'Mobile',
  })
  deviceType?: string;

  @ApiPropertyOptional({
    description: 'IP address of the client',
    example: '192.168.1.100',
  })
  ipAddress?: string;

  @ApiPropertyOptional({
    description: 'Location information (city, country, etc.)',
    example: 'New York, USA',
  })
  location?: string;

  @ApiPropertyOptional({
    description: 'Session expiry date/time',
    example: '2025-12-31T23:59:59.000Z',
  })
  expiresAt?: Date;

  @ApiPropertyOptional({
    description: 'When the session was created',
    example: '2025-01-01T10:00:00.000Z',
  })
  createdAt?: Date;

  @ApiPropertyOptional({
    description: 'When the session was revoked',
    example: '2025-01-02T10:00:00.000Z',
  })
  revokedAt?: Date;
}


