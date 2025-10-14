import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { RouteDto } from './route.dto';

export class RoutesResponseDto {
  @ApiProperty({
    description: 'Indicates if the request was successful',
    example: true,
  })
  @IsBoolean()
  success: boolean;

  @ApiProperty({
    description: 'Array of available routes',
    type: [RouteDto],
    isArray: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RouteDto)
  data: RouteDto[];
}
