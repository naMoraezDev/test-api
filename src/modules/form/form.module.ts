import { Module } from '@nestjs/common';
import { FormService } from './form.service';
import { FormController } from './form.controller';
import { FirebaseService } from 'src/integrations/firebase/firebase.service';
import { PreferencesRepository } from '../preferences/repositories/preferences.repository';

@Module({
  exports: [FormService],
  controllers: [FormController],
  providers: [FormService, FirebaseService, PreferencesRepository],
})
export class FormModule {}
