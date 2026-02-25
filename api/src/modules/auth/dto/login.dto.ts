import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'User email for login',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'MyStrongP@ssw0rd',
  })
  password: string;
}


