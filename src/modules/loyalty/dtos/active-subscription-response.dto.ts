import { ApiProperty } from '@nestjs/swagger';

export class WalletDto {
  balance: number | null;
}

export class ActiveSubscriptionResponseDto {
  @ApiProperty({
    example: 2014,
  })
  business_id: string | null;

  @ApiProperty({
    example: 'Torcedor',
  })
  active_subscription: string | null;

  @ApiProperty({
    example: { balance: 0 },
  })
  wallet: { balance: number };
}
