import { Module } from '@nestjs/common';
import { OAuthService } from './oauth.service';
import { OAuthController } from './oauth.controller';
import { ClientsModule } from '../clients/clients.module';
import { RedisCacheModule } from 'src/common/services/redis-cache.module';
import { FirebaseService } from 'src/integrations/firebase/firebase.service';
import { PreferencesRepository } from '../preferences/repositories/preferences.repository';

@Module({
  exports: [OAuthService],
  controllers: [OAuthController],
  imports: [ClientsModule, RedisCacheModule],
  providers: [OAuthService, FirebaseService, PreferencesRepository],
})
export class OAuthModule {}
