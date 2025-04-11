import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class ValidateFieldRequestDto {
  @ApiProperty({
    example: 'cpf',
  })
  @IsIn(['email', 'cpf', 'phoneNumber'])
  fieldType: string;

  @ApiProperty({
    example: '123.456.789-10',
  })
  @IsString()
  @IsNotEmpty()
  value: string;
}
