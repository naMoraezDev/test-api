import { ApiProperty } from '@nestjs/swagger';

export class CreateClientResponseDto {
  @ApiProperty({
    example: 'client-app',
  })
  name: string;

  @ApiProperty({
    example: 'https://localhost/callback',
  })
  redirectUri: string;

  @ApiProperty({
    example: '8458e330f3054e1e9ed3134eff052f25_client-app@lance.com.br',
  })
  clientId: string;

  @ApiProperty({
    example: 1742179090001,
  })
  createdAt: number;

  @ApiProperty({
    example: 1742179090001,
  })
  updatedAt: number;

  @ApiProperty({
    example: true,
  })
  active: boolean;
}
