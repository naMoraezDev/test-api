import {
  Logger,
  Injectable,
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { SmartLinkDto } from './dtos/smart-link.dto';
import { getFirebaseAuth } from 'src/config/firebase.config';
import { AlloyalService } from 'src/integrations/alloyal/alloyal.service';
import { RedisCacheService } from 'src/common/services/redis-cache.service';
import { PreferenceDocument } from '../preferences/models/preferences.model';
import { PreferencesRepository } from 'src/modules/preferences/repositories/preferences.repository';

interface UserData {
  cpf: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  loyaltyUserId?: number;
}

@Injectable()
export class LoyaltyService {
  private readonly logger = new Logger(LoyaltyService.name);

  constructor(
    private readonly alloyalService: AlloyalService,
    private readonly redisCacheService: RedisCacheService,
    private readonly preferencesRepository: PreferencesRepository,
  ) {}

  public async registerUserToLoyalty(
    uid: string,
  ): Promise<Partial<PreferenceDocument>> {
    try {
      const userData = await this.fetchUserData(uid);

      this.validateUserForRegistration(userData);

      const newUser = await this.registerUserInLoyaltySystem(uid, userData);

      await this.generateSmartLink(newUser.loyaltyUserId || 0);

      return this.normalizePreference(newUser);
    } catch (error) {
      return this.handleLoyaltyError(error, 'registro de fidelidade');
    }
  }

  public async createSmartLink(
    uid: string,
    redirectTo?: string,
  ): Promise<SmartLinkDto> {
    try {
      const { loyaltyUserId } = await this.preferencesRepository.get(uid);

      if (!loyaltyUserId) {
        throw new BadRequestException(
          'Usuário não cadastrado no serviço de loyalty',
        );
      }

      return await this.generateSmartLink(loyaltyUserId, redirectTo);
    } catch (error) {
      return this.handleLoyaltyError(error, 'geração de SmartLink');
    }
  }

  public async registerUserToLoyaltyAndCreateSmartLink(
    uid: string,
    redirectTo?: string,
  ): Promise<SmartLinkDto> {
    try {
      const userData = await this.fetchUserData(uid);

      this.validateUserForRegistration(userData);

      const newUser = await this.registerUserInLoyaltySystem(uid, userData);

      return await this.generateSmartLink(
        newUser.loyaltyUserId || 0,
        redirectTo,
      );
    } catch (error) {
      return this.handleLoyaltyError(error, 'registro de fidelidade');
    }
  }

  private async fetchUserData(uid: string): Promise<UserData> {
    try {
      const [firebaseUser, preferences] = await Promise.all([
        getFirebaseAuth().getUser(uid),
        this.preferencesRepository.get(uid),
      ]);

      return {
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || '',
        cpf: preferences.cpf || '',
        phoneNumber: preferences.phoneNumber || '',
        loyaltyUserId: preferences.loyaltyUserId || 0,
      };
    } catch (error) {
      this.logger.error(
        `Erro ao buscar dados do usuário: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private validateUserForRegistration(userData: UserData): void {
    if (!this.isValidCpf(userData.cpf) || !userData.displayName) {
      throw new BadRequestException(
        'Usuário não possui CPF ou nome registrado',
      );
    }
  }

  private isValidCpf(cpf: string): boolean {
    return Boolean(cpf) && Boolean(cpf.length) && cpf !== 'N/A';
  }

  private async registerUserInLoyaltySystem(
    uid: string,
    userData: UserData,
  ): Promise<PreferenceDocument> {
    try {
      const newUser = await this.alloyalService.createGuestUser({
        cpf: userData.cpf,
        email: userData.email,
        name: userData.displayName,
        phone: userData.phoneNumber,
      });

      const updated = await this.preferencesRepository.update(uid, {
        loyaltyUserId: newUser.id,
        loyaltyActiveSubscription: 'Torcedor',
      });

      return updated;
    } catch (error) {
      this.logger.error(
        `Erro ao registrar usuário na Alloyal: ${error.message}`,
        error.stack,
      );
      throw new ServiceUnavailableException(
        'O registro na api da Alloyal está indisponível no momento',
      );
    }
  }

  private async generateSmartLink(
    userId: number,
    redirectTo?: string,
  ): Promise<SmartLinkDto> {
    try {
      const user = await this.alloyalService.getOrUpdateGuestUser({
        userId: userId,
      });
      return await this.alloyalService.createSmartLink({
        redirectTo,
        cpf: user.taxpayer_number,
      });
    } catch (error) {
      this.logger.error(
        `Erro ao gerar SmartLink: ${error.message}`,
        error.stack,
      );
      throw new ServiceUnavailableException(
        'A geração de SmartLink na api da Alloyal está indisponível no momento',
      );
    }
  }

  public async getActiveSubscription(uid: string): Promise<any> {
    /* const cacheKey = `${uid}:loyalty:subscription`; */

    try {
      const userData = await this.fetchUserData(uid);

      if (!userData.loyaltyUserId) {
        throw new BadRequestException(
          'Usuário não registrado no programa de fidelidade',
        );
      }

      /* const cached = await this.redisCacheService.get(cacheKey);

      if (cached) return cached; */

      const loyaltyGuestUser = await this.alloyalService.getOrUpdateGuestUser({
        userId: userData.loyaltyUserId || 0,
      });

      const loyaltyUser = await this.alloyalService.getOrUpdateUser({
        cpf: loyaltyGuestUser.taxpayer_number,
      });

      await this.preferencesRepository.update(uid, {
        loyaltyActiveSubscription:
          this.getSubscriptionName(loyaltyUser.business_id) || '',
      });

      const subscriptionData = {
        business_id: loyaltyUser?.business_id || null,
        active_subscription:
          this.getSubscriptionName(loyaltyUser.business_id) || null,
        wallet: {
          balance: loyaltyUser.wallet.balance || 0,
        },
      };

      /* await this.redisCacheService.set(cacheKey, subscriptionData, 300); */

      return subscriptionData;
    } catch (error) {
      this.logger.error(
        `Erro inesperado na obtenção da inscrição ativa: ${error.message}`,
        error.stack,
      );

      throw new ServiceUnavailableException(
        `O serviço de loyalty está indisponível no momento`,
      );
    }
  }

  private getSubscriptionName(businessId: number) {
    switch (businessId) {
      case 2014:
        return 'Torcedor';
      case 2015:
        return 'Titular';
      case 2054:
        return 'Craque';
      default:
        return null;
    }
  }

  private handleLoyaltyError(error: any, operationType: string): never {
    if (
      error instanceof BadRequestException ||
      error instanceof ServiceUnavailableException
    ) {
      throw error;
    }

    this.logger.error(
      `Erro inesperado na ${operationType}: ${error.message}`,
      error.stack,
    );

    throw new ServiceUnavailableException(
      `O serviço de loyalty está indisponível no momento`,
    );
  }

  private normalizePreference(
    preference: Partial<PreferenceDocument>,
  ): Partial<PreferenceDocument> {
    const toNull = (value: any) =>
      value === undefined || value === '' ? null : value;

    return {
      uid: toNull(preference.uid),
      loyaltyUserId: toNull(preference.loyaltyUserId),
      termsAccepted: preference.termsAccepted ?? false,
      newsletterAccepted: preference.newsletterAccepted ?? false,
      team: toNull(preference.team),
      likedPosts: preference.likedPosts ?? [],
      cpf: toNull(preference.cpf),
      phoneNumber: toNull(preference.phoneNumber),
      createdAt: toNull(preference.createdAt),
      updatedAt: toNull(preference.updatedAt),
    };
  }
}
