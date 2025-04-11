import {
  Get,
  Post,
  Query,
  HttpCode,
  UseGuards,
  HttpStatus,
  Controller,
} from '@nestjs/common';
import {
  ApiTags,
  ApiQuery,
  ApiResponse,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { LoyaltyService } from './loyalty.service';
import { SmartLinkDto } from './dtos/smart-link.dto';
import { SmartLinkQueryDto } from './dtos/smart-link-query.dto';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { FirebaseUser } from 'src/integrations/firebase/firebase.interface';
import { FirebaseAuthGuard } from 'src/integrations/firebase/firebase.guard';
import { ApiResponseDecorator } from 'src/common/decorators/api-response.decorator';
import { PreferencesResponseDto } from '../preferences/dtos/preferences-response.dto';
import { ActiveSubscriptionResponseDto } from './dtos/active-subscription-response.dto';

@ApiTags('loyalty')
@Controller('user/loyalty')
@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard)
export class LoyaltyController {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  @Post('register')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Registrar usuário no programa de fidelidade',
    description:
      'Realiza o registro do usuário autenticado no programa de fidelidade.',
  })
  @ApiResponseDecorator({ type: PreferencesResponseDto })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Requisição inválida',
  })
  @ApiResponse({
    description: 'Serviço indisponível',
    status: HttpStatus.SERVICE_UNAVAILABLE,
  })
  async registerToLoyalty(@CurrentUser() user: FirebaseUser) {
    return await this.loyaltyService.registerUserToLoyalty(user.uid);
  }

  @Post('smartlink')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Gerar SmartLink para usuário registrado no programa de fidelidade',
    description:
      'Cria um link para redirecionamento e autenticação automáticos na plataforma do programa de fidelidade. O usuário deve estar previamente registrado no programa de fidelidade para que o link seja gerado. Este link permite acesso direto à plataforma de fidelidade sem necessidade de login adicional, utilizando Single Sign-On (SSO) entre a aplicação e o programa de fidelidade.',
  })
  @ApiResponseDecorator({ type: SmartLinkDto })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Usuário não cadastrado no serviço de loyalty',
  })
  @ApiResponse({
    description: 'Serviço indisponível',
    status: HttpStatus.SERVICE_UNAVAILABLE,
  })
  @ApiQuery({
    type: String,
    required: false,
    name: 'redirect_to',
  })
  async createSmartLink(
    @Query() query: SmartLinkQueryDto,
    @CurrentUser() user: FirebaseUser,
  ) {
    return await this.loyaltyService.createSmartLink(
      user.uid,
      query.redirect_to,
    );
  }

  @Post('register-and-create-smartlink')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Registrar usuário no programa de fidelidade e criar SmartLink',
    description:
      'Realiza o registro do usuário autenticado no programa de fidelidade e retorna um SmartLink para autenticação automática na plataforma. O usuário deve estar previamente autenticado via Firebase, e seu ID (uid) será utilizado para o registro no sistema de fidelidade. Caso o usuário já esteja registrado, o sistema apenas retornará um SmartLink.',
  })
  @ApiResponseDecorator({ type: SmartLinkDto })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Requisição inválida',
  })
  @ApiResponse({
    description: 'Serviço indisponível',
    status: HttpStatus.SERVICE_UNAVAILABLE,
  })
  @ApiQuery({
    type: String,
    required: false,
    name: 'redirect_to',
  })
  async registerUserToLoyaltyAndCreateSmartLink(
    @Query() query: SmartLinkQueryDto,
    @CurrentUser() user: FirebaseUser,
  ) {
    return await this.loyaltyService.registerUserToLoyaltyAndCreateSmartLink(
      user.uid,
      query.redirect_to,
    );
  }

  @Get('subscription')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Recuperar inscrição no programa de fidelidade de um usuário',
    description:
      'Recupera os dados da inscrição no programa de fidelidade de um usuário registrado.',
  })
  @ApiResponseDecorator({ type: ActiveSubscriptionResponseDto })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Requisição inválida',
  })
  @ApiResponse({
    description: 'Serviço indisponível',
    status: HttpStatus.SERVICE_UNAVAILABLE,
  })
  async getActiveSubscription(@CurrentUser() user: FirebaseUser) {
    return await this.loyaltyService.getActiveSubscription(user.uid);
  }
}
