import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class LoginCredentialsDto {
  @ApiProperty({
    description: 'Username for authentication',
    example: 'admin',
  })
  @IsString()
  @IsNotEmpty()
  userName: string;

  @ApiProperty({
    description: 'Password for authentication',
    example: 'password123',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
