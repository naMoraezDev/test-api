import { ApiProperty } from '@nestjs/swagger';

export class PreferencesResponseDto {
  @ApiProperty({
    example: 'ABC123XYZ789',
  })
  uid: string;

  @ApiProperty({
    example: 123456,
  })
  loyaltyUserId: number;

  @ApiProperty({
    example: 'Torcedor',
  })
  loyaltyActiveSubscription: string;

  @ApiProperty({
    example: true,
  })
  termsAccepted: boolean;

  @ApiProperty({
    example: true,
  })
  newsletterAccepted: boolean;

  @ApiProperty({
    example: 'Flamengo',
  })
  team: string;

  @ApiProperty({
    example: [],
  })
  likedPosts: string[];

  @ApiProperty({
    example: '123.456.789-00',
  })
  cpf: string;

  @ApiProperty({
    example: '(51) 12345-6789',
  })
  phoneNumber: string;

  @ApiProperty({
    example: '2025-03-01T12:00:00.000Z',
  })
  createdAt: string;

  @ApiProperty({
    example: '2025-03-01T12:00:00.000Z',
  })
  updatedAt: string;
}
