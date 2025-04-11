import { ProductDto } from './product.dto';
import { ApiProperty } from '@nestjs/swagger';

export class ProductsResponseDto {
  @ApiProperty({
    type: [ProductDto],
    example: [
      {
        uid: 'p123456789',
        mid: 'm987654321',
        sku: 'SKU12345',
        club: 'Premium',
        price: '129,99',
        clubID: 5,
        linkid: 'link123',
        upccode: '123456789012',
        linkurl: 'https://exemplo.com.br/produtos/fones-de-ouvido-premium',
        category: 'Eletrônicos',
        imageurl: 'https://exemplo.com.br/imagens/fones-de-ouvido-premium.jpg',
        createdon: '2023-05-15T10:30:45Z',
        saleprice: '99,99',
        created_at: '2023-05-15T10:30:45Z',
        productname: 'Fones de Ouvido Sem Fio Premium',
        description:
          'Fones de ouvido sem fio de alta qualidade com cancelamento de ruído e bateria com duração de 30 horas.',
        merchantname: 'AudioTech Brasil',
        clubRelatedname: 'Clube de Áudio Premium',
      },
    ],
  })
  data: ProductDto[];

  @ApiProperty({
    example: 1,
  })
  pg: number;

  @ApiProperty({
    example: 5,
  })
  pgs: number;

  @ApiProperty({
    example: 23,
  })
  items: number;
}
