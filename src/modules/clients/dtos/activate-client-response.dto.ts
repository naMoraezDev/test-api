import { ApiProperty } from '@nestjs/swagger';

export class ActivateClientResponseDto {
  @ApiProperty({
    example: true,
  })
  active: boolean;

  @ApiProperty({
    example: '8c23a3b87bda42d4a7cd5c417a4c9dac_client-app@lance.com.br',
  })
  clientId: string;

  @ApiProperty({
    example: '2025-03-17T02:36:16.764Z',
  })
  updatedAt: string;
}
