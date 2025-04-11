import { Module, OnModuleInit } from '@nestjs/common';
import { PreferencesService } from './preferences.service';
import { setupDynamoDB } from '../../config/dynamodb.config';
import { PreferencesController } from './preferences.controller';
import { NewsletterModule } from '../newsletter/newsletter.module';
import { AlloyalModule } from 'src/integrations/alloyal/alloyal.module';
import { FirebaseService } from 'src/integrations/firebase/firebase.service';
import { PreferencesRepository } from './repositories/preferences.repository';

@Module({
  exports: [PreferencesService],
  controllers: [PreferencesController],
  imports: [NewsletterModule, AlloyalModule],
  providers: [PreferencesService, PreferencesRepository, FirebaseService],
})
export class PreferencesModule implements OnModuleInit {
  onModuleInit() {
    setupDynamoDB();
  }
}
