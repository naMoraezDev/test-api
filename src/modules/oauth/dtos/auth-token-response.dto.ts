import { ApiProperty } from '@nestjs/swagger';

export class AuthTokenResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  custom_token: string;

  @ApiProperty({
    example: 'firebaseCustomToken',
  })
  token_type: string;

  @ApiProperty({
    example: 3600,
  })
  expires_in: number;

  @ApiProperty({
    example: false,
  })
  is_new_user?: boolean;
}
