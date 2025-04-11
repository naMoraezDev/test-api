import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ServiceUnavailableException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { jwtDecode } from 'jwt-decode';
import { verifyToken } from 'src/lib/jwt';
import { base64UrlEncode } from 'src/common/utils/pkce';
import { AuthorizeRequestDto } from './dtos/authorize-resquest.dto';
import { AuthTokenRequestDto } from './dtos/auth-token-request.dto';
import { AuthorizeResponseDto } from './dtos/authorize-response.dto';
import { AuthTokenResponseDto } from './dtos/auth-token-response.dto';
import { VerifyStateRequestDto } from './dtos/verify-state-request.dto';
import { VerifyStateResponseDto } from './dtos/verify-state-response.dto';
import { CreateStateResponseDto } from './dtos/create-state-response.dto';
import { RedisCacheService } from 'src/common/services/redis-cache.service';
import { FirebaseService } from 'src/integrations/firebase/firebase.service';
import { GoogleJwtPayload } from './interfaces/google-jwt-payload.interface';
import { PreferencesRepository } from '../preferences/repositories/preferences.repository';

const USER_NOT_FOUND_ERROR = 'auth/user-not-found';

@Injectable()
export class OAuthService {
  private readonly googleClientId: string;

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly redisCacheService: RedisCacheService,
    private readonly preferencesRepository: PreferencesRepository,
  ) {
    this.googleClientId = process.env.GOOGLE_CLIENT_ID || '';
  }

  async buildAuthorizationResponse(
    authorizeRequestDto: AuthorizeRequestDto,
  ): Promise<AuthorizeResponseDto> {
    const state = crypto.randomBytes(32).toString('hex');

    const key = `pkce:${state}`;

    const stored = await this.redisCacheService.set(
      key,
      {
        code_challenge: authorizeRequestDto.code_challenge,
        code_challenge_method:
          authorizeRequestDto.code_challenge_method ?? 'S256',
      },
      600,
    );

    if (!stored) {
      throw new ServiceUnavailableException(
        'Não foi possível armazenar os dados da requisição. Tente novamente mais tarde.',
      );
    }

    const path = authorizeRequestDto.path || '/sign-in';
    const authUrl = new URL(path, process.env.AUTH_PROVIDER_URL);

    authUrl.searchParams.append(
      'response_type',
      authorizeRequestDto.response_type,
    );
    authUrl.searchParams.append('client_id', authorizeRequestDto.client_id);
    authUrl.searchParams.append(
      'redirect_uri',
      authorizeRequestDto.redirect_uri,
    );
    authUrl.searchParams.append('state', state);
    if (authorizeRequestDto.required_loyalty) {
      authUrl.searchParams.append(
        'required_loyalty',
        authorizeRequestDto.required_loyalty,
      );
    }
    if (authorizeRequestDto.redirect_to_lp) {
      authUrl.searchParams.append(
        'redirect_to_lp',
        authorizeRequestDto.redirect_to_lp,
      );
    }

    return { authorization_url: authUrl.toString(), state: state };
  }

  async verifyPkce(state: string, codeVerifier: string): Promise<boolean> {
    const storedData = await this.redisCacheService.get<{
      code_challenge: string;
      code_challenge_method: string;
    }>(`pkce:${state}`);

    await this.redisCacheService.delete(`pkce:${state}`);

    if (!storedData) {
      throw new UnauthorizedException('Estado inválido ou expirado');
    }

    const { code_challenge, code_challenge_method } = storedData;

    let calculatedChallenge: string;

    if (code_challenge_method === 'S256') {
      const hash = crypto.createHash('sha256').update(codeVerifier).digest();
      calculatedChallenge = base64UrlEncode(hash);
    } else {
      calculatedChallenge = codeVerifier;
    }

    return calculatedChallenge === code_challenge;
  }

  async exchangeCode(
    tokenRequestDto: AuthTokenRequestDto,
  ): Promise<AuthTokenResponseDto> {
    if (tokenRequestDto.state && tokenRequestDto.code_verifier) {
      const isValid = await this.verifyPkce(
        tokenRequestDto.state,
        tokenRequestDto.code_verifier,
      );

      if (!isValid) {
        throw new UnauthorizedException('Falha na verificação PKCE');
      }
    }

    const decodedToken = verifyToken(tokenRequestDto.code);

    if (!decodedToken || !decodedToken.data || !decodedToken?.valid) {
      throw new UnauthorizedException('Token inválido ou expirado');
    }

    const customToken = await this.firebaseService.createCustomToken(
      decodedToken.data.uid,
    );

    return {
      custom_token: customToken,
      token_type: 'firebaseCustomToken',
      expires_in: 3600,
    };
  }

  async processGoogleOneTap(token: string): Promise<AuthTokenResponseDto> {
    const payload = this.decodeGoogleToken(token);
    this.validateGooglePayload(payload);

    let customToken: string;
    let isNewUser = false;

    try {
      const userRecord = await this.firebaseService.getUserByEmail(
        payload.email,
      );

      customToken = await this.firebaseService.createCustomToken(
        userRecord.uid,
      );
    } catch (error) {
      if (error.code === USER_NOT_FOUND_ERROR) {
        const newUser = await this.firebaseService.createUser({
          email: payload.email,
          photoURL: payload.picture,
          displayName: payload.name,
        });

        const preferenceData = {
          cpf: 'N/A',
          likedPosts: [],
          uid: newUser.uid,
          termsAccepted: true,
          newsletterAccepted: false,
        };

        await Promise.all([
          this.preferencesRepository.create(preferenceData),
          await this.firebaseService.updateUser(newUser.uid, {
            providerToLink: {
              uid: payload.sub,
              providerId: 'google.com',
            },
          }),
        ]);

        customToken = await this.firebaseService.createCustomToken(newUser.uid);

        isNewUser = true;
      } else {
        throw error;
      }
    }

    return {
      custom_token: customToken,
      token_type: 'firebaseCustomToken',
      expires_in: 3600,
      is_new_user: isNewUser,
    };
  }

  async createState(idToken: string): Promise<CreateStateResponseDto> {
    const state = crypto.randomBytes(32).toString('hex');

    const key = `user:state:${state}`;

    const stored = await this.redisCacheService.set(
      key,
      {
        state,
        idToken,
      },
      300,
    );

    if (!stored) {
      throw new ServiceUnavailableException(
        'Não foi possível armazenar os dados da requisição. Tente novamente mais tarde.',
      );
    }

    return { state };
  }

  async verifyState(
    verifyStateRequestDto: VerifyStateRequestDto,
  ): Promise<VerifyStateResponseDto> {
    const key = `user:state:${verifyStateRequestDto.state}`;

    const storedData = await this.redisCacheService.get<{
      state: string;
      idToken: string;
    }>(key);

    await this.redisCacheService.delete(key);

    if (!storedData) {
      throw new UnauthorizedException('Estado inválido ou expirado');
    }

    return { isValid: true, idToken: storedData.idToken };
  }

  private decodeGoogleToken(token: string): GoogleJwtPayload {
    if (!token) {
      throw new BadRequestException('Token não fornecido');
    }

    try {
      return jwtDecode<GoogleJwtPayload>(token);
    } catch (error) {
      throw new UnauthorizedException('Token JWT malformado ou inválido');
    }
  }

  private validateGooglePayload(payload: GoogleJwtPayload): void {
    if (payload.aud !== this.googleClientId) {
      throw new UnauthorizedException(
        `Token inválido: o cliente ID (${payload.aud}) não corresponde ao cliente ID esperado`,
      );
    }

    if (!payload.email_verified) {
      throw new BadRequestException('Email não verificado pelo Google');
    }
  }
}
