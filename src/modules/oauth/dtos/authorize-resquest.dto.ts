import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsIn } from 'class-validator';

export class AuthorizeRequestDto {
  @ApiProperty({
    required: true,
    example: 'code',
  })
  @IsNotEmpty()
  @IsString()
  @IsIn(['code'])
  response_type: 'code';

  @ApiProperty({
    required: true,
    example: '8c23a3b87bda42d4a7cd5c417a4c9dac_client-app@lance.com.br',
  })
  @IsNotEmpty()
  @IsString()
  client_id: string;

  @ApiProperty({
    required: true,
    example: 'https://localhost/callback',
  })
  @IsNotEmpty()
  @IsString()
  redirect_uri: string;

  @ApiProperty({
    required: true,
    example: 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk',
  })
  @IsNotEmpty()
  @IsString()
  code_challenge: string;

  @ApiProperty({
    required: false,
    example: 'S256',
  })
  @IsOptional()
  @IsString()
  @IsIn(['S256', 'plain'])
  code_challenge_method?: string;

  @ApiProperty({
    required: false,
    example: 'true',
  })
  @IsOptional()
  @IsString()
  @IsIn(['true', 'false'])
  required_loyalty?: 'true' | 'false';

  @ApiProperty({
    required: false,
    example: 'false',
  })
  @IsOptional()
  @IsString()
  @IsIn(['false'])
  redirect_to_lp?: 'false';

  @ApiProperty({
    required: false,
    example: '/sign-in',
  })
  @IsOptional()
  @IsString()
  @IsIn(['/sign-in', '/sign-up'])
  path?: '/sign-in' | '/sign-up';
}
