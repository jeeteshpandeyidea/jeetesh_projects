import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserSessionDto {
  @ApiProperty({
    description: 'User identifier (e.g. User document ID)',
    example: '665f1a4b2c3d4e5f6a7b8c9d',
  })
  user_id: string;

  @ApiProperty({
    description: 'Access token value',
    example: 'access-token-jwt',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Refresh token value',
    example: 'refresh-token-uuid-or-jwt',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'Unique device identifier',
    example: 'device-uuid-12345',
  })
  deviceId: string;

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
    description: 'User agent string',
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  })
  userAgent?: string;

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

  @ApiProperty({
    description: 'Access token expiry date/time',
    example: '2025-12-31T23:59:59.000Z',
  })
  expiresAt: Date;

  @ApiProperty({
    description: 'Refresh token expiry date/time',
    example: '2026-01-31T23:59:59.000Z',
  })
  refreshExpiresAt: Date;
}


