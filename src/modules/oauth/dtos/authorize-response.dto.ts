import { ApiProperty } from '@nestjs/swagger';

export class AuthorizeResponseDto {
  @ApiProperty({
    example:
      'https://auth-provider.com/sign-in?response_type=code&client_id=aBCdefGHIjklmnOPQRsTuVwXYZ&redirect_uri=http://localhost:3000&state=p2s5v8y1B4dR7gL0qT3fX6jM9nZ2wP5dK8eA3hJ7mQ0rU4yO6bC9vF2xE5sN1iZ',
  })
  authorization_url: string;

  @ApiProperty({
    example: 'p2s5v8y1B4dR7gL0qT3fX6jM9nZ2wP5dK8eA3hJ7mQ0rU4yO6bC9vF2xE5sN1iZ',
  })
  state: string;
}
