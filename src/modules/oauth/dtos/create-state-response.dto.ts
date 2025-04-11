import { ApiProperty } from '@nestjs/swagger';

export class CreateStateResponseDto {
  @ApiProperty({
    example: 'jK8pQr5NyGzA3wXcDe7FvB9s2H4tL6mV',
  })
  state: string;
}
