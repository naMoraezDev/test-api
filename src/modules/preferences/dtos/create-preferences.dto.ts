import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsNotEmpty } from 'class-validator';

export class CreatePreferenceDto {
  @ApiProperty({
    required: false,
    example: 'Flamengo',
  })
  @IsOptional()
  @IsString()
  team: string;

  @ApiProperty({
    required: false,
    example: '123.456.789-00',
  })
  @IsOptional()
  @IsString()
  cpf: string;

  @ApiProperty({
    required: false,
    example: '(51) 12345-6789',
  })
  @IsOptional()
  @IsString()
  phoneNumber: string;

  @ApiProperty({
    required: true,
    example: true,
  })
  @IsNotEmpty()
  @IsBoolean()
  termsAccepted: boolean;

  @ApiProperty({
    required: false,
    default: false,
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  newsletterAccepted: boolean;
}
