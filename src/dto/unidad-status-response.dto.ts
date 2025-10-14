import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { LineaStatusDto } from './linea-status.dto';

export class UnidadStatusResponseDto {
  @ApiProperty({
    description: 'Indicates if the request was successful',
    example: true,
  })
  @IsBoolean()
  success: boolean;

  @ApiProperty({
    description: 'Unit status information',
    type: LineaStatusDto,
  })
  @ValidateNested()
  @Type(() => LineaStatusDto)
  data: LineaStatusDto;
}
