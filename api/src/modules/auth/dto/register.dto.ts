import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'User email for registration',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Unique username',
    example: 'john_doe',
  })
  username: string;

  @ApiProperty({
    description: 'Password (will be hashed before saving)',
    example: 'MyStrongP@ssw0rd',
  })
  password: string;

  @ApiProperty({
    description: 'Full name of the user',
    example: 'John Doe',
  })
  fullName: string;

  @ApiPropertyOptional({
    description: 'Optional phone number',
    example: '+1-555-1234567',
  })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Optional profile photo URL',
    example: 'https://example.com/avatar.jpg',
  })
  profilePhoto?: string;

  @ApiPropertyOptional({
    description: 'Initial roles for the user',
    type: [String],
    example: ['user'],
  })
  roles?: string[];
}


