import {
  Get,
  Param,
  Query,
  HttpCode,
  Controller,
  HttpStatus,
} from '@nestjs/common';
import { ProductDto } from './dtos/product.dto';
import { ProductsService } from './products.service';
import { ProductsQueryDto } from './dtos/products-query.dto';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ProductsResponseDto } from './dtos/products-response.dto';
import { ApiResponseDecorator } from 'src/common/decorators/api-response.decorator';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('/clubs/:id/products')
  @ApiOperation({
    summary: 'Buscar produtos por ID de clube',
    description:
      'Busca a lista de produtos de um clube com base no ID fornecido.',
  })
  @HttpCode(HttpStatus.OK)
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
  })
  @ApiQuery({
    type: Number,
    name: 'limit',
    required: false,
  })
  @ApiResponseDecorator({ type: ProductDto })
  async getProducts(
    @Param('id') id: string,
    @Query() query: ProductsQueryDto,
  ): Promise<ProductsResponseDto> {
    return this.productsService.getProductsByTeam(id, query);
  }
}
