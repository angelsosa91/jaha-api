import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { LineaStatusDto } from './linea-status.dto';

export class LineaStatusResponseDto {
  @ApiProperty({
    description: 'Indicates if the request was successful',
    example: true,
  })
  @IsBoolean()
  success: boolean;

  @ApiProperty({
    description: 'Array of line statuses',
    type: [LineaStatusDto],
    isArray: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LineaStatusDto)
  data: LineaStatusDto[];
}
