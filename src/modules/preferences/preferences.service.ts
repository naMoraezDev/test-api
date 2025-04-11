import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { CpfValidator } from './utils/cpf-validator';
import { UpdateLikesDto } from './dtos/update-likes.dto';
import { PreferenceDocument } from './models/preferences.model';
import { CreatePreferenceDto } from './dtos/create-preferences.dto';
import { UpdatePreferenceDto } from './dtos/update-preferences.dto';
import { AlloyalService } from 'src/integrations/alloyal/alloyal.service';
import { FirebaseService } from 'src/integrations/firebase/firebase.service';
import { PreferencesRepository } from './repositories/preferences.repository';
import { NewsletterService } from 'src/modules/newsletter/newsletter.service';

@Injectable()
export class PreferencesService {
  constructor(
    private readonly alloyalService: AlloyalService,
    private readonly firebaseService: FirebaseService,
    private readonly newsletterService: NewsletterService,
    private readonly preferencesRepository: PreferencesRepository,
  ) {}

  async createPreference(
    uid: string,
    email?: string,
    createPreferenceDto?: CreatePreferenceDto,
  ): Promise<Partial<PreferenceDocument>> {
    if (!createPreferenceDto) {
      throw new BadRequestException('Dados de preferência ausentes');
    }

    const formattedCpf = await this.validateAndFormatCpf(
      createPreferenceDto.cpf,
    );

    const preferenceData = {
      uid,
      likedPosts: [],
      cpf: formattedCpf,
      team: createPreferenceDto.team,
      phoneNumber: createPreferenceDto.phoneNumber,
      termsAccepted: Boolean(createPreferenceDto.termsAccepted),
      newsletterAccepted: Boolean(createPreferenceDto.newsletterAccepted),
    };

    const [newPreference] = await Promise.all([
      this.preferencesRepository.create(preferenceData),
      this.processPhoneUpdate(uid, preferenceData.phoneNumber),
      this.processNewsletterSubscription(
        email,
        preferenceData.newsletterAccepted,
      ),
    ]);

    return this.normalizePreference(newPreference as any as PreferenceDocument);
  }

  async updatePreference(
    uid: string,
    email?: string,
    displayName?: string,
    updatePreferenceDto?: UpdatePreferenceDto,
  ): Promise<Partial<PreferenceDocument>> {
    if (!updatePreferenceDto) {
      throw new BadRequestException('Dados de atualização ausentes');
    }

    const [currentUser, formattedCpf] = await Promise.all([
      this.getPreferenceOrFail(uid),
      updatePreferenceDto.cpf !== undefined
        ? this.validateAndFormatCpf(updatePreferenceDto.cpf, uid)
        : Promise.resolve(undefined),
    ]);

    const updateData: Partial<PreferenceDocument> = this.buildUpdateData(
      updatePreferenceDto,
      formattedCpf,
    );

    const loyaltyUpdatePromise = this.processLoyaltyUpdate(
      currentUser,
      updatePreferenceDto,
      displayName,
    );

    const phoneUpdatePromise = this.processPhoneUpdate(
      uid,
      updatePreferenceDto.phoneNumber,
    );

    const newsletterPromise = this.processNewsletterSubscription(
      email,
      updatePreferenceDto.newsletterAccepted,
    );

    await Promise.all([
      loyaltyUpdatePromise,
      phoneUpdatePromise,
      newsletterPromise,
    ]);

    const updatedPreference = await this.preferencesRepository.update(
      uid,
      updateData,
    );
    return this.normalizePreference(updatedPreference);
  }

  async getPreference(uid: string): Promise<Partial<PreferenceDocument>> {
    try {
      const preference = await this.preferencesRepository.get(uid);
      return this.normalizePreference(preference);
    } catch (error) {
      const preferenceData = {
        uid,
        cpf: 'N/A',
        likedPosts: [],
        termsAccepted: true,
        newsletterAccepted: false,
      };

      const mewPreference =
        await this.preferencesRepository.create(preferenceData);

      return this.normalizePreference(mewPreference);
    }
  }

  async updateLikes(
    uid: string,
    updateLikesDto: UpdateLikesDto,
  ): Promise<Partial<PreferenceDocument>> {
    const preference = await this.getPreferenceOrFail(uid);
    const updatedLikedPosts = this.calculateUpdatedLikes(
      preference.likedPosts || [],
      updateLikesDto,
    );

    const updatedPreference = await this.preferencesRepository.update(uid, {
      likedPosts: updatedLikedPosts,
    });

    return this.normalizePreference(updatedPreference);
  }

  private normalizePreference(
    preference: Partial<PreferenceDocument>,
  ): Partial<PreferenceDocument> {
    const toNull = (value: any) =>
      value === undefined || value === '' ? null : value;

    return {
      uid: toNull(preference.uid),
      loyaltyUserId: toNull(preference.loyaltyUserId),
      loyaltyActiveSubscription: toNull(preference.loyaltyActiveSubscription),
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

  private formatToE164(phoneNumber: string): string {
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    return '+55' + digitsOnly;
  }

  private async getPreferenceOrFail(uid: string): Promise<any> {
    try {
      return await this.preferencesRepository.get(uid);
    } catch (error) {
      throw new NotFoundException('Preferências não encontradas');
    }
  }

  private async validateAndFormatCpf(
    cpf: string,
    currentUid?: string,
  ): Promise<string> {
    const formattedCpf = CpfValidator.validate(cpf);

    if (formattedCpf === 'N/A') {
      return formattedCpf;
    }

    try {
      const result = await this.preferencesRepository.query(
        'cpf',
        formattedCpf,
      );

      if (result.count > 0 && (!currentUid || result[0].uid !== currentUid)) {
        throw new BadRequestException('CPF já cadastrado');
      }

      return formattedCpf;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      return formattedCpf;
    }
  }

  private calculateUpdatedLikes(
    currentLikedPosts: string[],
    updateLikesDto: UpdateLikesDto,
  ): string[] {
    let updatedLikedPosts = [...currentLikedPosts];

    if (updateLikesDto.addLikedPosts?.length) {
      const newPosts = updateLikesDto.addLikedPosts.filter(
        (postId) => !updatedLikedPosts.includes(postId),
      );
      updatedLikedPosts.push(...newPosts);
    }

    if (updateLikesDto.deleteLikedPosts?.length) {
      updatedLikedPosts = updatedLikedPosts.filter(
        (postId) => !updateLikesDto.deleteLikedPosts?.includes(postId),
      );
    }

    return updatedLikedPosts;
  }

  private async processPhoneUpdate(
    uid: string,
    phoneNumber?: string,
  ): Promise<void> {
    if (phoneNumber === undefined) {
      return;
    }

    try {
      if (phoneNumber) {
        const formattedPhone = this.formatToE164(phoneNumber);
        await this.firebaseService.updateUserPhoneNumber(uid, formattedPhone);
      }
    } catch (error) {
      throw new BadRequestException(
        'Este número de telefone já está cadastrado em outra conta',
      );
    }
  }

  private async processNewsletterSubscription(
    email?: string,
    newsletterAccepted?: boolean,
  ): Promise<void> {
    if (newsletterAccepted && email) {
      try {
        await this.newsletterService.subscribe(email);
      } catch (error) {
        console.error('Erro ao registrar email na newsletter:', error);
      }
    }
  }

  private async processLoyaltyUpdate(
    currentUser: any,
    updateDto: UpdatePreferenceDto,
    displayName?: string,
  ): Promise<void> {
    const needsLoyaltyUpdate =
      currentUser.loyaltyUserId && updateDto.phoneNumber !== undefined;

    if (!needsLoyaltyUpdate) {
      return;
    }

    const updateLoyaltyUser: Partial<{
      name?: string;
      email?: string;
      phone?: string | null;
    }> = {};

    if (displayName) {
      updateLoyaltyUser.name = displayName;
    }

    if (updateDto.phoneNumber !== undefined) {
      updateLoyaltyUser.phone =
        updateDto.phoneNumber === '' ? null : updateDto.phoneNumber;
    }

    try {
      await this.alloyalService.getOrUpdateGuestUser({
        userId: currentUser.loyaltyUserId,
        payload: updateLoyaltyUser as any,
      });
    } catch {
      throw new ServiceUnavailableException(
        'O sistema está enfrentando instabilidade. Tente novamente mais tarde.',
      );
    }
  }

  private buildUpdateData(
    updateDto: UpdatePreferenceDto,
    formattedCpf?: string,
  ): Partial<PreferenceDocument> {
    const updateData: Partial<PreferenceDocument> = {};

    if (updateDto.team !== undefined) {
      updateData.team = updateDto.team;
    }

    if (formattedCpf !== undefined) {
      updateData.cpf = formattedCpf;
    }

    if (updateDto.phoneNumber !== undefined) {
      updateData.phoneNumber = updateDto.phoneNumber;
    }

    if (updateDto.termsAccepted !== undefined) {
      if (updateDto.termsAccepted !== true) {
        throw new BadRequestException('O campo termsAccepted deve ser true');
      }
      updateData.termsAccepted = true;
    }

    if (updateDto.newsletterAccepted !== undefined) {
      updateData.newsletterAccepted = updateDto.newsletterAccepted;
    }

    return updateData;
  }
}
