import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { RedisCacheModule } from 'src/common/services/redis-cache.module';

@Module({
  exports: [ProductsService],
  imports: [RedisCacheModule],
  providers: [ProductsService],
  controllers: [ProductsController],
})
export class ProductsModule {}
