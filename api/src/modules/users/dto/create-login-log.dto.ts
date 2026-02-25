import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLoginLogDto {
  @ApiPropertyOptional({
    description: 'User identifier (if user exists)',
    example: '665f1a4b2c3d4e5f6a7b8c9d',
  })
  user_id?: string;

  @ApiProperty({
    description: 'Email address that was used to attempt login',
    example: 'user@example.com',
  })
  emailAttempted: string;

  @ApiPropertyOptional({
    description: 'User agent string of the client',
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...',
  })
  userAgent?: string;

  @ApiPropertyOptional({
    description: 'IP address of the client',
    example: '192.168.1.100',
  })
  ipAddress?: string;

  @ApiProperty({
    description: 'Login attempt status (success, failed, blocked)',
    example: 'success',
  })
  status: string;

  @ApiPropertyOptional({
    description: 'Failure reason if status is not success',
    example: 'Invalid password',
  })
  failureReason?: string;

  @ApiPropertyOptional({
    description: 'Device name',
    example: 'iPhone 13 Pro',
  })
  deviceName?: string;

  @ApiPropertyOptional({
    description: 'Device type (Mobile, Tablet, Desktop)',
    example: 'Mobile',
  })
  deviceType?: string;

  @ApiPropertyOptional({
    description: 'Device information (Browser on OS)',
    example: 'Chrome on Windows 10/11',
  })
  deviceInfo?: string;

  @ApiPropertyOptional({
    description: 'Location information',
    example: 'New York, USA',
  })
  location?: string;

  @ApiPropertyOptional({
    description: 'Login timestamp',
    example: '2025-01-01T10:00:00.000Z',
  })
  loginAt?: Date;
}


