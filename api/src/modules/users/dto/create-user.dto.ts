import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'Unique email address of the user',
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Unique username of the user',
    example: 'john_doe',
  })
  username: string;

  @ApiProperty({
    description: 'User password (plaintext here, should be hashed before saving)',
    example: 'MyStrongP@ssw0rd',
  })
  password: string;

  @ApiPropertyOptional({
    description: 'List of role IDs or names assigned to the user',
    type: [String],
    example: ['admin', 'editor'],
  })
  roles?: string[];

  @ApiProperty({
    description: 'Full name of the user',
    example: 'John Doe',
  })
  fullName: string;

  @ApiPropertyOptional({
    description: 'Phone number of the user (unique when provided; required in admin)',
    example: '+1-555-1234567',
  })
  phone?: string;

  @ApiPropertyOptional({
    description: 'URL of the user profile photo',
    example: 'https://example.com/avatar.jpg',
  })
  profilePhoto?: string;
}


