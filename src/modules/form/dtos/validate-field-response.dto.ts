import { ApiProperty } from '@nestjs/swagger';

export class ValidateFieldResponseDto {
  @ApiProperty({
    example: true,
  })
  isValid: boolean;

  @ApiProperty({
    example: 'email',
  })
  fieldType: string;
}
