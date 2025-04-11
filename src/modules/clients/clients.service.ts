import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { CreateClientDto } from './dtos/create-client.dto';
import { UpdateClientDto } from './dtos/update-client.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ClientModel, ClientDocument } from './models/client.model';
import { RedisCacheService } from 'src/common/services/redis-cache.service';

@Injectable()
export class ClientsService {
  constructor(private readonly redisCacheService: RedisCacheService) {}

  private generateClientSecret(): string {
    return `sec_${crypto.randomBytes(32).toString('hex')}`;
  }

  private maskClientSecret(
    client: ClientDocument | Partial<ClientDocument>,
  ): ClientDocument | Partial<ClientDocument> {
    if (client && client.clientSecret) {
      const maskedClient = { ...client };
      maskedClient.clientSecret = client.clientSecret.substring(0, 10) + '...';
      return maskedClient;
    }

    return client;
  }

  private maskClientSecrets(clients: ClientDocument[]): ClientDocument[] {
    return clients.map(
      (client) => this.maskClientSecret(client) as ClientDocument,
    );
  }

  async create(createClientDto: CreateClientDto): Promise<ClientDocument> {
    const uuid = uuidv4().replace(/-/g, '');
    const sanitizedClientName = createClientDto.name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    const clientId = `${uuid}_${sanitizedClientName}@lance.com.br`;
    const clientSecret = this.generateClientSecret();
    const client = new ClientModel({
      ...createClientDto,
      clientId,
      clientSecret,
    });

    return await client.save();
  }

  async findAll(): Promise<ClientDocument[]> {
    const clients = await ClientModel.scan().exec();

    return this.maskClientSecrets(clients);
  }

  async findOne(clientId: string): Promise<ClientDocument> {
    const client = await ClientModel.get(clientId);
    if (!client) {
      throw new NotFoundException(`Cliente com ID ${clientId} não encontrado`);
    }

    return this.maskClientSecret(client) as ClientDocument;
  }

  async findActive(): Promise<ClientDocument[]> {
    const clients = await ClientModel.scan('active').eq(true).exec();

    return this.maskClientSecrets(clients);
  }

  async update(
    clientId: string,
    updateClientDto: UpdateClientDto,
  ): Promise<ClientDocument> {
    await this.findOne(clientId);
    const updateObject: Partial<ClientDocument> = {};
    if (updateClientDto.name !== undefined) {
      updateObject.name = updateClientDto.name;
    }
    if (updateClientDto.redirectUri !== undefined) {
      updateObject.redirectUri = updateClientDto.redirectUri;
    }
    if (updateClientDto.active !== undefined) {
      updateObject.active = updateClientDto.active;
    }
    const updated = await ClientModel.update({ ...updateObject, clientId });

    return this.maskClientSecret(updated) as ClientDocument;
  }

  async regenerateSecret(clientId: string): Promise<Partial<ClientDocument>> {
    await this.findOne(clientId);
    const clientSecret = this.generateClientSecret();
    const updated = await ClientModel.update(clientId, {
      clientSecret,
    });

    return {
      clientSecret: updated.clientSecret,
      clientId: updated.clientId,
      updatedAt: updated.updatedAt,
    };
  }

  async activate(clientId: string): Promise<Partial<ClientDocument>> {
    const updated = await this.update(clientId, { active: true });

    return {
      active: updated.active,
      clientId: updated.clientId,
      updatedAt: updated.updatedAt,
    };
  }

  async deactivate(clientId: string): Promise<Partial<ClientDocument>> {
    const updated = await this.update(clientId, { active: false });

    return {
      active: updated.active,
      clientId: updated.clientId,
      updatedAt: updated.updatedAt,
    };
  }

  async remove(clientId: string): Promise<void> {
    await this.findOne(clientId);
    await ClientModel.delete(clientId);
  }

  async validateClient(
    clientId: string,
    redirectUri: string,
  ): Promise<boolean> {
    try {
      const client = await this.redisCacheService.getOrSet<ClientDocument>(
        `valid_client:${clientId}`,
        async () => await ClientModel.get(clientId),
      );

      if (!client) return false;

      if (!client.active) return false;

      if (!client.redirectUri) return false;

      if (!redirectUri.includes(client.redirectUri)) {
        return false;
      }

      return true;
    } catch (error) {
      console.error(`Erro ao validar cliente ${clientId}:`, error);
      return false;
    }
  }
}
