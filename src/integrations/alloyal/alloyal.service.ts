import {
  UserResponseDto,
  CreateGuestUserDto,
  CreateSmartLinkDto,
  GetOrUpdateUserDto,
  GuestUserResponseDto,
  GetOrUpdateGuestUserDto,
  CreateSmartLinkResponseDto,
} from './alloyal.interface';
import { AlloyalApiClient } from './alloyal.client';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AlloyalService {
  private readonly logger = new Logger(AlloyalApiClient.name);

  constructor(private readonly alloyalApiClient: AlloyalApiClient) {}

  async createGuestUser(
    createGuestUserDto: CreateGuestUserDto,
  ): Promise<GuestUserResponseDto> {
    try {
      return this.alloyalApiClient.createGuestUser(createGuestUserDto);
    } catch (error) {
      this.logger.error(`Erro ao criar usuário: ${error.message}`, error.stack);
      throw new Error('Falha ao criar usuário na API Alloyal');
    }
  }

  async getOrUpdateGuestUser(
    getOrUpdateGuestUserDto: GetOrUpdateGuestUserDto,
  ): Promise<GuestUserResponseDto> {
    try {
      return this.alloyalApiClient.getOrUpdateGuestUser(
        getOrUpdateGuestUserDto,
      );
    } catch (error) {
      this.logger.error(
        `Erro ao recuperar ou atualizar usuário convidado: ${error.message}`,
        error.stack,
      );
      throw new Error(
        'Falha ao recuperar ou atualizar usuário convidado na API Alloyal',
      );
    }
  }

  async getOrUpdateUser(
    getOrUpdateUserDto: GetOrUpdateUserDto,
  ): Promise<UserResponseDto> {
    try {
      return this.alloyalApiClient.getOrUpdateUser(getOrUpdateUserDto);
    } catch (error) {
      this.logger.error(
        `Erro ao recuperar ou atualizar usuário: ${error.message}`,
        error.stack,
      );
      throw new Error('Falha ao recuperar ou atualizar usuário na API Alloyal');
    }
  }

  async createSmartLink(
    createSmartLinkDto: CreateSmartLinkDto,
  ): Promise<CreateSmartLinkResponseDto> {
    try {
      return this.alloyalApiClient.createSmartLink(createSmartLinkDto);
    } catch (error) {
      this.logger.error(
        `Erro ao recuperar ou atualizar usuário: ${error.message}`,
        error.stack,
      );
      this.logger.error(
        `Erro ao criar smart link: ${error.message}`,
        error.stack,
      );
      throw new Error('Falha ao criar smart link na API Alloyal');
    }
  }
}
