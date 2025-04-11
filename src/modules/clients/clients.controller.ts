import {
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Controller,
} from '@nestjs/common';
import {
  ApiTags,
  ApiResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dtos/create-client.dto';
import { UpdateClientDto } from './dtos/update-client.dto';
import { ClientResponseDto } from './dtos/client-response.dto';
import { ValidateClientDto } from './dtos/validate-client.dto';
import { ApiKeyAuth } from 'src/common/decorators/api-key.decorator';
import { ClientListResponseDto } from './dtos/client-list-response.dto';
import { CreateClientResponseDto } from './dtos/create-client-response.dto';
import { ApiKeyOptionalGuard } from 'src/common/guards/api-key-optional.guard';
import { ValidateClientResponseDto } from './dtos/validate-client-response.dto';
import { ActivateClientResponseDto } from './dtos/activate-client-response.dto';
import { ApiResponseDecorator } from 'src/common/decorators/api-response.decorator';
import { DeactivateClientResponseDto } from './dtos/deactivate-client-response.dto';
import { RegenerationClientSecretResponseDto } from './dtos/regenerate-client-secret-response.dto';

@ApiTags('oauth clients')
@Controller('oauth/clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @UseGuards(ApiKeyOptionalGuard)
  @ApiKeyAuth()
  @ApiOperation({
    summary: 'Criar um novo cliente OAuth',
    description:
      'Cria um novo cliente OAuth com o nome e URI de redirecionamento especificados. Um clientId único é gerado automaticamente.',
  })
  @ApiResponseDecorator({ type: CreateClientResponseDto, status: 201 })
  @ApiUnauthorizedResponse({ description: 'API key inválida ou ausente' })
  async create(@Body() createClientDto: CreateClientDto) {
    return this.clientsService.create(createClientDto);
  }

  @Get()
  @UseGuards(ApiKeyOptionalGuard)
  @ApiKeyAuth()
  @ApiOperation({
    summary: 'Listar todos os clientes OAuth',
    description:
      'Retorna uma lista de todos os clientes OAuth registrados no sistema.',
  })
  @ApiResponseDecorator({ type: ClientListResponseDto, isArray: true })
  @ApiUnauthorizedResponse({ description: 'API key inválida ou ausente' })
  async findAll() {
    return this.clientsService.findAll();
  }

  @Get('active')
  @UseGuards(ApiKeyOptionalGuard)
  @ApiKeyAuth()
  @ApiOperation({
    summary: 'Listar clientes OAuth ativos',
    description:
      'Retorna uma lista de todos os clientes OAuth ativos registrados no sistema.',
  })
  @ApiResponseDecorator({ type: ClientListResponseDto, isArray: true })
  @ApiUnauthorizedResponse({ description: 'API key inválida ou ausente' })
  async findActive() {
    return this.clientsService.findActive();
  }

  @Get(':id')
  @UseGuards(ApiKeyOptionalGuard)
  @ApiKeyAuth()
  @ApiOperation({
    summary: 'Buscar cliente OAuth por ID',
    description:
      'Retorna os detalhes de um cliente OAuth específico com base no ID fornecido.',
  })
  @ApiResponseDecorator({ type: ClientResponseDto })
  @ApiResponse({ status: 404, description: 'Cliente OAuth não encontrado' })
  @ApiUnauthorizedResponse({ description: 'API key inválida ou ausente' })
  async findOne(@Param('id') id: string) {
    return this.clientsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(ApiKeyOptionalGuard)
  @ApiKeyAuth()
  @ApiOperation({
    summary: 'Atualizar cliente OAuth',
    description:
      'Atualiza as informações de um cliente OAuth existente com base no ID fornecido.',
  })
  @ApiResponseDecorator({ type: ClientResponseDto })
  @ApiResponse({ status: 404, description: 'Cliente OAuth não encontrado' })
  @ApiUnauthorizedResponse({ description: 'API key inválida ou ausente' })
  async update(
    @Param('id') id: string,
    @Body() updateClientDto: UpdateClientDto,
  ) {
    return this.clientsService.update(id, updateClientDto);
  }

  @Post(':id/regenerate-secret')
  @UseGuards(ApiKeyOptionalGuard)
  @ApiKeyAuth()
  @ApiOperation({
    summary: 'Regenerar client secret',
    description:
      'Gera um novo client secret para o cliente OAuth especificado. O client secret anterior será invalidado.',
  })
  @ApiResponseDecorator({ type: RegenerationClientSecretResponseDto })
  @ApiResponse({ status: 404, description: 'Cliente OAuth não encontrado' })
  @ApiUnauthorizedResponse({ description: 'API key inválida ou ausente' })
  async regenerateSecret(@Param('id') id: string) {
    return this.clientsService.regenerateSecret(id);
  }

  @Patch(':id/activate')
  @UseGuards(ApiKeyOptionalGuard)
  @ApiKeyAuth()
  @ApiOperation({
    summary: 'Ativar cliente OAuth',
    description: 'Altera o status de um cliente OAuth para ativo.',
  })
  @ApiResponseDecorator({ type: ActivateClientResponseDto })
  @ApiResponse({ status: 404, description: 'Cliente OAuth não encontrado' })
  @ApiUnauthorizedResponse({ description: 'API key inválida ou ausente' })
  async activate(@Param('id') id: string) {
    return this.clientsService.activate(id);
  }

  @Patch(':id/deactivate')
  @UseGuards(ApiKeyOptionalGuard)
  @ApiKeyAuth()
  @ApiOperation({
    summary: 'Desativar cliente OAuth',
    description:
      'Altera o status de um cliente OAuth para inativo, impedindo seu uso no fluxo de autenticação.',
  })
  @ApiResponseDecorator({ type: DeactivateClientResponseDto })
  @ApiResponse({ status: 404, description: 'Cliente OAuth não encontrado' })
  @ApiUnauthorizedResponse({ description: 'API key inválida ou ausente' })
  async deactivate(@Param('id') id: string) {
    return this.clientsService.deactivate(id);
  }

  @Delete(':id')
  @UseGuards(ApiKeyOptionalGuard)
  @ApiKeyAuth()
  @ApiOperation({
    summary: 'Remover cliente OAuth',
    description: 'Remove permanentemente um cliente OAuth do sistema.',
  })
  @ApiResponseDecorator({ type: class EmptyResponseDto {} })
  @ApiResponse({ status: 404, description: 'Cliente OAuth não encontrado' })
  @ApiUnauthorizedResponse({ description: 'API key inválida ou ausente' })
  async remove(@Param('id') id: string) {
    return this.clientsService.remove(id);
  }

  @Post('validate')
  @ApiOperation({
    summary: 'Validar cliente OAuth',
    description:
      'Verifica se um cliente OAuth é válido com base no clientId e redirectUri fornecidos.',
  })
  @ApiResponseDecorator({
    type: ValidateClientResponseDto,
  })
  async validateClient(@Body() validateClientDto: ValidateClientDto) {
    const { clientId, redirectUri } = validateClientDto;
    const isValid = await this.clientsService.validateClient(
      clientId,
      redirectUri,
    );

    return { valid: isValid };
  }
}
