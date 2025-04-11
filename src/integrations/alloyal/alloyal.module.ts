import { Module } from '@nestjs/common';
import { AlloyalService } from './alloyal.service';
import { AlloyalApiClient } from './alloyal.client';
import { RedisCacheModule } from 'src/common/services/redis-cache.module';

@Module({
  exports: [AlloyalService],
  imports: [RedisCacheModule],
  providers: [AlloyalService, AlloyalApiClient],
})
export class AlloyalModule {}
