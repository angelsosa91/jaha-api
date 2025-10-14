import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class LoginDataDto {
  @ApiProperty({
    description: 'JWT authentication token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    description: 'Token expiration date in ISO format',
    example: '2025-10-15T10:30:00Z',
  })
  @IsString()
  @IsNotEmpty()
  expirationDate: string;
}

export class LoginResponseDto {
  @ApiProperty({
    description: 'Indicates if the login was successful',
    example: true,
  })
  @IsBoolean()
  success: boolean;

  @ApiProperty({
    description: 'Login data containing token and expiration',
    type: LoginDataDto,
  })
  @ValidateNested()
  @Type(() => LoginDataDto)
  data: LoginDataDto;
}
