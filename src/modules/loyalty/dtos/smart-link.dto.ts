import { ApiProperty } from '@nestjs/swagger';

export class SmartLinkDto {
  @ApiProperty({
    example: 'XyZ123AbC456',
  })
  smart_token: string;

  @ApiProperty({
    example: 'https://web.seuclubedevantagens.com.br/login?token=XyZ123AbC456',
  })
  web_smart_link: string;

  @ApiProperty({
    example: 'https://app.seuclubedevantagens.com.br/login?token=XyZ123AbC456',
  })
  app_smart_link: string;
}
