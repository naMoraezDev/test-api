import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyStateRequestDto {
  @ApiProperty({
    example: 'jK8pQr5NyGzA3wXcDe7FvB9s2H4tL6mV',
  })
  @IsNotEmpty()
  @IsString()
  state: string;
}
