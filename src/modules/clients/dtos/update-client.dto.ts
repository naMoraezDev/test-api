import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsUrl } from 'class-validator';

export class UpdateClientDto {
  @ApiProperty({
    required: false,
    example: 'client-app',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    required: false,
    example: 'https://localhost/callback',
  })
  @IsString()
  @IsOptional()
  redirectUri?: string;

  @ApiProperty({
    required: false,
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
