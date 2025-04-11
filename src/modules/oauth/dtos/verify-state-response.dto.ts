import { ApiProperty } from '@nestjs/swagger';

export class VerifyStateResponseDto {
  @ApiProperty({
    example: true,
  })
  isValid: boolean;

  @ApiProperty({
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6...',
  })
  idToken: string;
}
