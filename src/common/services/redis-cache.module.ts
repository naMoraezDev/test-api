import { Module } from '@nestjs/common';
import { RedisCacheService } from './redis-cache.service';

@Module({
  exports: [RedisCacheService],
  providers: [RedisCacheService],
})
export class RedisCacheModule {}
