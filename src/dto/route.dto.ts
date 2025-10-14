import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsNotEmpty } from 'class-validator';

export class RouteDto {
  @ApiProperty({
    description: 'Route ID',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @ApiProperty({
    description: 'Route name',
    example: 'Ruta Norte',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}
