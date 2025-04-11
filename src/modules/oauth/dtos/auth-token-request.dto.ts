import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AuthTokenRequestDto {
  @ApiProperty({
    example: 'authorization_code',
  })
  @IsNotEmpty()
  @IsString()
  @IsIn(['authorization_code', 'google_identity_token'])
  grant_type: string;

  @ApiProperty({
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6...',
  })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({
    example: 'aBCdefGHIjklmnOPQRsTuVwXYZ',
  })
  @IsNotEmpty()
  @IsString()
  client_id: string;

  @ApiProperty({
    example: 'http://localhost:3000/callback',
  })
  @IsNotEmpty()
  @IsString()
  redirect_uri: string;

  @ApiProperty({
    example: 'jK8pQr5NyGzA3wXcDe7FvB9s2H4tL6mV',
  })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({
    example: 'p2s5v8y1B4dR7gL0qT3fX6jM9nZ2wP5dK8eA3hJ7mQ0rU4yO6bC9vF2xE5sN1iZ',
  })
  @IsOptional()
  @IsString()
  code_verifier?: string;
}
