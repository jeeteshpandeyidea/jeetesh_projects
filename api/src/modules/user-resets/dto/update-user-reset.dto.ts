import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserResetDto {
  @ApiPropertyOptional({
    description: 'User identifier (e.g. User document ID)',
    example: '665f1a4b2c3d4e5f6a7b8c9d',
  })
  user_id?: string;

  @ApiPropertyOptional({
    description: 'Reset code or token',
    example: '123456',
  })
  code?: string;

  @ApiPropertyOptional({
    description: 'Type of reset (e.g. password, email-verification)',
    example: 'password',
  })
  type?: string;

  @ApiPropertyOptional({
    description: 'When this reset link/code expires',
    example: '2025-12-31T23:59:59.000Z',
  })
  expiresAt?: Date;

  @ApiPropertyOptional({
    description: 'Link sent to the user to perform the reset',
    example: 'https://example.com/reset?token=abc123',
  })
  link?: string;
}


