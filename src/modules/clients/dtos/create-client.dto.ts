import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUrl } from 'class-validator';

export class CreateClientDto {
  @ApiProperty({
    required: true,
    example: 'client-app',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    required: true,
    example: 'https://localhost/callback',
  })
  @IsString()
  redirectUri: string;
}
