import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'Unique email address of the user',
    example: 'john.doe@example.com',
  })
  email?: string;

  @ApiPropertyOptional({
    description: 'Unique username of the user',
    example: 'john_doe',
  })
  username?: string;

  @ApiPropertyOptional({
    description: 'User password (plaintext here, should be hashed before saving)',
    example: 'MyStrongP@ssw0rd',
  })
  password?: string;

  @ApiPropertyOptional({
    description: 'List of role IDs or names assigned to the user',
    type: [String],
    example: ['admin', 'editor'],
  })
  roles?: string[];

  @ApiPropertyOptional({
    description: 'Full name of the user',
    example: 'John Doe',
  })
  fullName?: string;

  @ApiPropertyOptional({
    description: 'Phone number of the user',
    example: '+1-555-1234567',
  })
  phone?: string;

  @ApiPropertyOptional({
    description: 'URL of the user profile photo',
    example: 'https://example.com/avatar.jpg',
  })
  profilePhoto?: string;

  @ApiPropertyOptional({
    description: 'Whether the email is verified',
    example: true,
  })
  emailVerified?: boolean;

  @ApiPropertyOptional({
    description: 'Whether the phone is verified',
    example: false,
  })
  phoneVerified?: boolean;

  @ApiPropertyOptional({
    description: 'Soft delete flag',
    example: false,
  })
  is_deleted?: boolean;

  @ApiPropertyOptional({
    description: 'User status',
    example: 'active',
  })
  status?: string;
}


