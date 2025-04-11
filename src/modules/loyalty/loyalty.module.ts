import { Module } from '@nestjs/common';
import { LoyaltyService } from './loyalty.service';
import { LoyaltyController } from './loyalty.controller';
import { AlloyalModule } from 'src/integrations/alloyal/alloyal.module';
import { RedisCacheService } from 'src/common/services/redis-cache.service';
import { FirebaseService } from 'src/integrations/firebase/firebase.service';
import { PreferencesRepository } from 'src/modules/preferences/repositories/preferences.repository';

@Module({
  imports: [AlloyalModule],
  exports: [LoyaltyService],
  controllers: [LoyaltyController],
  providers: [
    LoyaltyService,
    FirebaseService,
    RedisCacheService,
    PreferencesRepository,
  ],
})
export class LoyaltyModule {}
