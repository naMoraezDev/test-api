import getObject from 'src/config/s3/s3.actions';
import { Injectable, Logger } from '@nestjs/common';
import { ProductsQueryDto } from './dtos/products-query.dto';
import { ProductsResponseDto } from './dtos/products-response.dto';
import { RedisCacheService } from 'src/common/services/redis-cache.service';

interface Product {
  club: string;
  clubID: number;
  [key: string]: any;
  productname: string;
  clubRelatedname?: string;
}

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(private readonly redisCacheService: RedisCacheService) {}

  public async getProductsByTeam(
    id: string,
    { limit = '10', page = '1' }: ProductsQueryDto,
  ): Promise<ProductsResponseDto> {
    const products = await this.getProducts();
    return this.filterProductsByTeam(
      products,
      id,
      parseInt(page),
      parseInt(limit),
    );
  }

  private async getProducts(): Promise<Product[]> {
    try {
      return await this.redisCacheService.getOrSet<Product[]>(
        'products',
        async () => await this.getProductsFromS3(),
        86400,
      );
    } catch (error) {
      this.logger.error(`Erro ao buscar produtos: ${error.message}`);
      return this.getProductsFromS3();
    }
  }

  private async getProductsFromS3(): Promise<Product[]> {
    try {
      this.logger.debug('Buscando produtos do S3');
      const result = await getObject('/products.json');
      return JSON.parse(result);
    } catch (error) {
      this.logger.error(`Erro ao buscar produtos do S3: ${error.message}`);
      return [];
    }
  }

  private filterProductsByTeam(
    products: Product[],
    clubID: string,
    page: number,
    limit: number,
  ): ProductsResponseDto {
    let filteredProducts = products.filter((product: Product) => {
      if (
        product.clubID === Number(clubID) &&
        product.productname.includes(` ${product.club} `)
      ) {
        return true;
      }

      if (
        product.clubID === Number(clubID) &&
        product.clubRelatedname &&
        product.productname.includes(` ${product.clubRelatedname} `)
      ) {
        return true;
      }

      return false;
    });

    if (!filteredProducts.length) {
      filteredProducts = products.filter(
        (product: Product) => product.club === 'Suplementos',
      );
    }

    const uniqueProducts = Array.from(
      new Map(
        filteredProducts.map((item) => [item.productname, item]),
      ).values(),
    );

    const totalPages = Math.ceil(uniqueProducts.length / limit);
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedProducts = uniqueProducts.slice(start, end);

    return {
      data: paginatedProducts as any,
      items: uniqueProducts.length,
      pg: page,
      pgs: totalPages,
    };
  }
}
