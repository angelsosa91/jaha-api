import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty } from 'class-validator';

export class SetRouteRequestDto {
  @ApiProperty({
    description: 'Unit ID',
    example: 42,
  })
  @IsNumber()
  @IsNotEmpty()
  unidadId: number;

  @ApiProperty({
    description: 'Line ID',
    example: 5,
  })
  @IsNumber()
  @IsNotEmpty()
  lineaId: number;

  @ApiProperty({
    description: 'Route ID to assign',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  routeId: number;

  @ApiProperty({
    description: 'Traffic ID to assign',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  trafficId: number;
}
