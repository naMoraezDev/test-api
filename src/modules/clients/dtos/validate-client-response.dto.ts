import { ApiProperty } from '@nestjs/swagger';

export class ValidateClientResponseDto {
  @ApiProperty({
    example: true,
  })
  valid: boolean;
}
