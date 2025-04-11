import {
  UserResponseDto,
  TokenResponseDto,
  CreateSmartLinkDto,
  CreateGuestUserDto,
  GetOrUpdateUserDto,
  GuestUserResponseDto,
  GetOrUpdateGuestUserDto,
  CreateSmartLinkResponseDto,
} from './alloyal.interface';
import { Injectable } from '@nestjs/common';
import { RedisCacheService } from 'src/common/services/redis-cache.service';
import { httpClientFactory } from 'src/common/utils/http/http-client.factory';

@Injectable()
export class AlloyalApiClient {
  private readonly alloyalApiBaseUrl: string;
  private readonly alloyalEmployeeEmail: string;
  private readonly alloyalMainBusinessId: string;
  private readonly alloyalEmployeePassword: string;
  private readonly alloyalMainSessionToken: string;
  private readonly alloyalFreemiumBusinessId: string;
  private readonly alloyalFreemiumSessionToken: string;

  constructor(private readonly redisCacheService: RedisCacheService) {
    this.alloyalFreemiumBusinessId =
      process.env.ALLOYAL_FREEMIUM_BUSINESS_ID || '';
    this.alloyalFreemiumSessionToken =
      process.env.ALLOYAL_FREEMIUM_SESSION_TOKEN || '';
    this.alloyalApiBaseUrl = process.env.ALLOYAL_API_BASE_URL || '';
    this.alloyalEmployeeEmail = process.env.ALLOYAL_EMPLOYEE_EMAIL || '';
    this.alloyalMainBusinessId = process.env.ALLOYAL_MAIN_BUSINESS_ID || '';
    this.alloyalEmployeePassword = process.env.ALLOYAL_EMPLOYEE_PASSWORD || '';
    this.alloyalMainSessionToken = process.env.ALLOYAL_MAIN_SESSION_TOKEN || '';
  }

  async getToken(): Promise<string> {
    const cachedToken =
      await this.redisCacheService.get<string>('alloyal_api_token');

    if (cachedToken) {
      return cachedToken;
    }

    const url = `${this.alloyalApiBaseUrl}/sign_in`;
    const options = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Session-Token': this.alloyalMainSessionToken,
      },
      body: JSON.stringify({
        email: this.alloyalEmployeeEmail,
        password: this.alloyalEmployeePassword,
      }),
    };

    const { auth_token } = await httpClientFactory().request<TokenResponseDto>({
      input: url,
      init: options,
    });

    await this.redisCacheService.set('alloyal_api_token', auth_token, 3600);

    return auth_token;
  }

  public async createGuestUser(
    createUserDto: CreateGuestUserDto,
  ): Promise<GuestUserResponseDto> {
    const token = await this.getToken();
    const url = `${this.alloyalApiBaseUrl}/businesses/${this.alloyalFreemiumBusinessId}/authorized_users`;

    const options = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'X-ClientEmployee-Token': token,
        'Content-Type': 'application/json',
        'X-Session-Token': this.alloyalFreemiumSessionToken,
        'X-ClientEmployee-Email': this.alloyalEmployeeEmail,
      },
      body: JSON.stringify(createUserDto),
    };

    return await httpClientFactory().request<GuestUserResponseDto>({
      input: url,
      init: options,
    });
  }

  public async getOrUpdateGuestUser(
    getOrUpdateUserDto: GetOrUpdateGuestUserDto,
  ): Promise<GuestUserResponseDto> {
    const isUpdate = Boolean(getOrUpdateUserDto.payload);

    const token = await this.getToken();
    const url = `${this.alloyalApiBaseUrl}/businesses/${this.alloyalMainBusinessId}/authorized_users/${getOrUpdateUserDto.userId.toString()}`;

    const options = {
      method: isUpdate ? 'PATCH' : 'GET',
      headers: {
        Accept: 'application/json',
        'X-ClientEmployee-Token': token,
        'Content-Type': 'application/json',
        'X-Session-Token': this.alloyalMainSessionToken,
        'X-ClientEmployee-Email': this.alloyalEmployeeEmail,
      },
      body: isUpdate ? JSON.stringify(getOrUpdateUserDto.payload) : undefined,
    };

    return await httpClientFactory().request<GuestUserResponseDto>({
      input: url,
      init: options,
    });
  }

  public async getOrUpdateUser(
    getOrUpdateUserDto: GetOrUpdateUserDto,
  ): Promise<UserResponseDto> {
    const isUpdate = Boolean(getOrUpdateUserDto.payload);

    const token = await this.getToken();
    const url = `${this.alloyalApiBaseUrl}/businesses/${this.alloyalMainBusinessId}/users/${getOrUpdateUserDto.cpf.replace(/[^0-9]/g, '')}`;

    const options = {
      method: isUpdate ? 'PATCH' : 'GET',
      headers: {
        Accept: 'application/json',
        'X-ClientEmployee-Token': token,
        'Content-Type': 'application/json',
        'X-Session-Token': this.alloyalMainSessionToken,
        'X-ClientEmployee-Email': this.alloyalEmployeeEmail,
      },
      body: isUpdate ? JSON.stringify(getOrUpdateUserDto.payload) : undefined,
    };

    return await httpClientFactory().request<UserResponseDto>({
      input: url,
      init: options,
    });
  }

  public async createSmartLink(
    createSmartLinkDto: CreateSmartLinkDto,
  ): Promise<CreateSmartLinkResponseDto> {
    const token = await this.getToken();
    const url = `${this.alloyalApiBaseUrl}/businesses/${this.alloyalMainBusinessId}/users/${createSmartLinkDto.cpf.replace(/[^0-9]/g, '')}/smart_link${createSmartLinkDto.redirectTo ? `?redirect_to=${createSmartLinkDto.redirectTo}` : ''}`;

    const options = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'X-ClientEmployee-Token': token,
        'Content-Type': 'application/json',
        'X-Session-Token': this.alloyalMainSessionToken,
        'X-ClientEmployee-Email': this.alloyalEmployeeEmail,
      },
    };

    return await httpClientFactory().request<CreateSmartLinkResponseDto>({
      input: url,
      init: options,
    });
  }
}
