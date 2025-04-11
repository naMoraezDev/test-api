import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ValidateClientDto {
  @ApiProperty({
    required: true,
    example: '8c23a3b87bda42d4a7cd5c417a4c9dac_client-app@lance.com.br',
  })
  @IsString()
  @IsNotEmpty()
  clientId: string;

  @ApiProperty({
    required: true,
    example: 'http://localhost:3000/callback',
  })
  @IsString()
  redirectUri: string;
}
