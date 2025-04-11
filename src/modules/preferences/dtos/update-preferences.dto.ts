import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdatePreferenceDto {
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
    required: false,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  termsAccepted: boolean;

  @ApiProperty({
    required: false,
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  newsletterAccepted: boolean;
}
