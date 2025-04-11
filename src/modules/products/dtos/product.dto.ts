import { ApiProperty } from '@nestjs/swagger';

export class ProductDto {
  @ApiProperty({
    example: 'p123456789',
  })
  uid: string;

  @ApiProperty({
    example: 'm987654321',
  })
  mid: string;

  @ApiProperty({
    example: 'SKU12345',
  })
  sku: string;

  @ApiProperty({
    example: 'Premium',
  })
  club: string;

  @ApiProperty({
    example: '129,99',
  })
  price: string;

  @ApiProperty({
    example: 5,
  })
  clubID: number;

  @ApiProperty({
    example: 'link123',
  })
  linkid: string;

  @ApiProperty({
    example: '123456789012',
  })
  upccode: string;

  @ApiProperty({
    example: 'https://exemplo.com.br/produtos/fones-de-ouvido-premium',
  })
  linkurl: string;

  @ApiProperty({
    example: 'Eletrônicos',
  })
  category: string;

  @ApiProperty({
    example: 'https://exemplo.com.br/imagens/fones-de-ouvido-premium.jpg',
  })
  imageurl: string;

  @ApiProperty({
    example: '2023-05-15T10:30:45Z',
  })
  createdon: string;

  @ApiProperty({
    example: '99,99',
  })
  saleprice: string;

  @ApiProperty({
    example: '2023-05-15T10:30:45Z',
  })
  created_at: string;

  @ApiProperty({
    example: 'Fones de Ouvido Sem Fio Premium',
  })
  productname: string;

  @ApiProperty({
    example:
      'Fones de ouvido sem fio de alta qualidade com cancelamento de ruído e bateria com duração de 30 horas.',
  })
  description: string;

  @ApiProperty({
    example: 'AudioTech Brasil',
  })
  merchantname: string;

  @ApiProperty({
    example: 'Clube de Áudio Premium',
  })
  clubRelatedname: string;
}
