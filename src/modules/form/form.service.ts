import { Injectable } from '@nestjs/common';
import { ValidateFieldRequestDto } from './dtos/validate-field.request.dto';
import { FirebaseService } from 'src/integrations/firebase/firebase.service';
import { PreferencesRepository } from '../preferences/repositories/preferences.repository';
import { ValidateFieldResponseDto } from 'src/modules/form/dtos/validate-field-response.dto';

@Injectable()
export class FormService {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly preferencesRepository: PreferencesRepository,
  ) {}

  async validateField(
    field: ValidateFieldRequestDto,
  ): Promise<ValidateFieldResponseDto> {
    const { fieldType, value } = field;

    switch (fieldType) {
      case 'email':
        const emailResult = await this.checkEmail(value);
        return {
          isValid: !emailResult,
          fieldType: 'email',
        };

      case 'cpf':
        const cpfResult = await this.checkCpf(value);
        return {
          isValid: !cpfResult,
          fieldType: 'cpf',
        };

      case 'phoneNumber':
        const phoneResult = await this.checkPhoneNumber(value);
        return {
          isValid: !phoneResult,
          fieldType: 'phoneNumber',
        };

      default:
        throw new Error(`Tipo de campo não suportado: ${fieldType}`);
    }
  }

  private async checkEmail(email: string): Promise<boolean> {
    try {
      await this.firebaseService.getUserByEmail(email);
      return true;
    } catch (error) {
      return false;
    }
  }

  private async checkCpf(cpf: string): Promise<boolean> {
    const result = await this.preferencesRepository.query('cpf', cpf);
    if (result.count > 0) return true;

    return false;
  }

  private async checkPhoneNumber(phoneNumber: string): Promise<boolean> {
    try {
      await this.firebaseService.getUserByPhoneNumber(phoneNumber);
      return true;
    } catch (error) {
      return false;
    }
  }
}
