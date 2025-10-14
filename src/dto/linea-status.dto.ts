import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsNotEmpty } from 'class-validator';

export class LineaStatusDto {
  @ApiProperty({
    description: 'Company ID',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  idEmpresa: number;

  @ApiProperty({
    description: 'Line ID',
    example: 5,
  })
  @IsNumber()
  @IsNotEmpty()
  idLinea: number;

  @ApiProperty({
    description: 'Company name',
    example: 'Transportes ABC',
  })
  @IsString()
  @IsNotEmpty()
  nombreEmpresa: string;

  @ApiProperty({
    description: 'Line name',
    example: 'Ruta 101',
  })
  @IsString()
  @IsNotEmpty()
  nombreLinea: string;

  @ApiProperty({
    description: 'Bus unit number',
    example: 42,
  })
  @IsNumber()
  @IsNotEmpty()
  unidad: number;

  @ApiProperty({
    description: 'Latitude coordinate',
    example: '-17.3895',
  })
  @IsString()
  @IsNotEmpty()
  lat: string;

  @ApiProperty({
    description: 'Longitude coordinate',
    example: '-66.1568',
  })
  @IsString()
  @IsNotEmpty()
  lng: string;

  @ApiProperty({
    description: 'Route path/trajectory',
    example: 'Centro - Villa Tunari',
  })
  @IsString()
  @IsNotEmpty()
  recorrido: string;
}
