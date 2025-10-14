import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SetRouteDataDto {
  @ApiProperty({
    description: 'Success or error message',
    example: 'Route assigned successfully',
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}

export class SetRouteResponseDto {
  @ApiProperty({
    description: 'Indicates if the route assignment was successful',
    example: true,
  })
  @IsBoolean()
  success: boolean;

  @ApiProperty({
    description: 'Response data with message',
    type: SetRouteDataDto,
  })
  @ValidateNested()
  @Type(() => SetRouteDataDto)
  data: SetRouteDataDto;

  @ApiProperty({
    description: 'Error message if the operation failed',
    example: true,
  })
  @IsString()
  message: string;
}
