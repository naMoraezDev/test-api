import {
  Get,
  Body,
  Post,
  Patch,
  HttpCode,
  UseGuards,
  Controller,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiResponse,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UpdateLikesDto } from './dtos/update-likes.dto';
import { PreferencesService } from './preferences.service';
import { PreferenceDocument } from './models/preferences.model';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { CreatePreferenceDto } from './dtos/create-preferences.dto';
import { UpdatePreferenceDto } from './dtos/update-preferences.dto';
import { PreferencesResponseDto } from './dtos/preferences-response.dto';
import { FirebaseUser } from 'src/integrations/firebase/firebase.interface';
import { FirebaseAuthGuard } from 'src/integrations/firebase/firebase.guard';
import { ApiResponseDecorator } from 'src/common/decorators/api-response.decorator';

@ApiTags('preferences')
@Controller('user/preferences')
@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard)
export class PreferencesController {
  constructor(private readonly preferencesService: PreferencesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Criar preferência de usuário',
    description:
      'Cria um registro de preferência para o usuário proprietário do token fornecido. Se já houver preferência registrada, retorna a preferência existente.',
  })
  @ApiResponseDecorator({ type: PreferencesResponseDto, status: 201 })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'CPF já cadastrado ou inválido',
  })
  @ApiResponse({
    description: 'Não autorizado',
    status: HttpStatus.UNAUTHORIZED,
  })
  async createPreference(
    @CurrentUser() user: FirebaseUser,
    @Body() createPreferenceDto: CreatePreferenceDto,
  ): Promise<Partial<PreferenceDocument>> {
    return this.preferencesService.createPreference(
      user.uid,
      user.email,
      createPreferenceDto,
    );
  }

  @Patch()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Atualizar preferência de usuário',
    description:
      'Atualiza o registro de preferência do usuário proprietário do token fornecido.',
  })
  @ApiResponseDecorator({ type: PreferencesResponseDto })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'CPF já cadastrado ou inválido',
  })
  @ApiResponse({
    description: 'Não autorizado',
    status: HttpStatus.UNAUTHORIZED,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Preferências não encontradas',
  })
  async updatePreference(
    @CurrentUser() user: FirebaseUser,
    @Body() updatePreferenceDto: UpdatePreferenceDto,
  ): Promise<Partial<PreferenceDocument>> {
    return this.preferencesService.updatePreference(
      user.uid,
      user.email,
      user.displayName,
      updatePreferenceDto,
    );
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Buscar preferência de usuário',
    description:
      'Busca o registro de preferência do usuário proprietário do token fornecido.',
  })
  @ApiResponseDecorator({ type: PreferencesResponseDto })
  @ApiResponse({
    description: 'Não autorizado',
    status: HttpStatus.UNAUTHORIZED,
  })
  async getPreference(
    @CurrentUser() user: FirebaseUser,
  ): Promise<Partial<PreferenceDocument>> {
    return this.preferencesService.getPreference(user.uid);
  }

  @Patch('likes')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Atualizar lista de matérias curtidas de usuário',
    description:
      'Adiciona ou remove slugs de matérias da lista de matérias curtidas do usuário proprietário do token fornecido. A lista de addLikedPosts adicionará e a lista de deleteLikedPosts removerá os slugs fornecidos do registro de preferência do usuário.',
  })
  @ApiResponseDecorator({ type: PreferencesResponseDto })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Preferências não encontradas',
  })
  async updateLikes(
    @CurrentUser() user: FirebaseUser,
    @Body() updateLikesDto: UpdateLikesDto,
  ): Promise<Partial<PreferenceDocument>> {
    return this.preferencesService.updateLikes(user.uid, updateLikesDto);
  }
}
