import {
  Post,
  Body,
  UseGuards,
  Controller,
  HttpStatus,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { OAuthService } from './oauth.service';
import { ClientsService } from '../clients/clients.service';
import { AuthTokenRequestDto } from './dtos/auth-token-request.dto';
import { AuthorizeRequestDto } from './dtos/authorize-resquest.dto';
import { AuthorizeResponseDto } from './dtos/authorize-response.dto';
import {
  ApiTags,
  ApiResponse,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { VerifyStateRequestDto } from './dtos/verify-state-request.dto';
import { CurrentIdToken } from 'src/common/decorators/id-token.decorator';
import { CreateStateResponseDto } from './dtos/create-state-response.dto';
import { VerifyStateResponseDto } from './dtos/verify-state-response.dto';
import { FirebaseAuthGuard } from 'src/integrations/firebase/firebase.guard';
import { ApiResponseDecorator } from 'src/common/decorators/api-response.decorator';
import { AuthTokenResponseDto } from 'src/modules/oauth/dtos/auth-token-response.dto';

@ApiTags('oauth flow')
@Controller('oauth')
export class OAuthController {
  constructor(
    private readonly authService: OAuthService,
    private readonly clientsService: ClientsService,
  ) {}

  @Post('authorize')
  @ApiOperation({
    summary: 'Iniciar fluxo de autorização',
    description:
      'Inicia o fluxo de autenticação redirecionando para as telas do provedor de autenticação.',
  })
  @ApiResponseDecorator({ type: AuthorizeResponseDto })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Parâmetros inválidos ou cliente não autorizado',
  })
  async authorize(@Body() authorizeRequestDto: AuthorizeRequestDto) {
    const isValidClient = await this.clientsService.validateClient(
      authorizeRequestDto.client_id,
      authorizeRequestDto.redirect_uri,
    );

    if (!isValidClient) {
      throw new BadRequestException('Cliente inválido ou não autorizado');
    }

    return await this.authService.buildAuthorizationResponse(
      authorizeRequestDto,
    );
  }

  @Post('token')
  @ApiOperation({
    summary: 'Trocar token de autorização por token de acesso',
    description:
      'Troca um token de autorização temporário por um token de acesso. O token de acesso é gerado pelo firebase como customToken e é de utilização única.',
  })
  @ApiResponseDecorator({ type: AuthTokenResponseDto })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Credenciais inválidas',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cliente inválido ou URL de redirecionamento não permitida',
  })
  async getToken(
    @Body() tokenRequestDto: AuthTokenRequestDto,
  ): Promise<AuthTokenResponseDto> {
    try {
      const isValidClient = await this.clientsService.validateClient(
        tokenRequestDto.client_id,
        tokenRequestDto.redirect_uri,
      );

      if (!isValidClient) {
        throw new Error('Cliente inválido ou não autorizado');
      }

      if (tokenRequestDto.grant_type === 'authorization_code') {
        if (!tokenRequestDto.state || !tokenRequestDto.code_verifier)
          throw new BadRequestException(
            "Os campos 'state' e 'code_verifier' são obrigatórios para grant_type='authorization_code'.",
          );
        return this.authService.exchangeCode(tokenRequestDto);
      } else if (tokenRequestDto.grant_type === 'google_identity_token') {
        return this.authService.processGoogleOneTap(tokenRequestDto.code);
      } else {
        throw new BadRequestException('Tipo de concessão não suportado');
      }
    } catch (error) {
      throw new UnauthorizedException('Autenticação falhou: ' + error.message);
    }
  }

  @Post('state/create')
  @ApiBearerAuth()
  @UseGuards(FirebaseAuthGuard)
  @ApiOperation({
    summary: 'Gerar state para um usuário',
    description:
      'Gera um valor de state que pode ser verificado apenas uma vez, sendo invalidado na sequência.',
  })
  @ApiResponseDecorator({ type: CreateStateResponseDto })
  async createState(
    @CurrentIdToken() idToken: string,
  ): Promise<CreateStateResponseDto> {
    try {
      return await this.authService.createState(idToken);
    } catch (error) {
      throw new UnauthorizedException(
        'Geração de state falhou: ' + error.message,
      );
    }
  }

  @Post('state/verify')
  @ApiOperation({
    summary: 'Verificar state',
    description: 'Verifica o valor de um state, o invalidando na sequência.',
  })
  @ApiResponseDecorator({ type: VerifyStateResponseDto })
  async verifyState(
    @Body() verifyStateRequestDto: VerifyStateRequestDto,
  ): Promise<VerifyStateResponseDto> {
    try {
      return await this.authService.verifyState(verifyStateRequestDto);
    } catch (error) {
      throw new UnauthorizedException(
        'Geração de state falhou: ' + error.message,
      );
    }
  }
}
