import { Request, Response, NextFunction } from 'express';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { ClientsService } from 'src/modules/clients/clients.service';
import { ClientDocument } from 'src/modules/clients/models/client.model';

@Injectable()
export class DynamicCorsMiddleware implements NestMiddleware {
  constructor(private readonly clientsService: ClientsService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const origin = req.headers.origin;

    if (!origin) {
      return next();
    }

    try {
      const activeClients = await this.clientsService.findActive();

      const allowedOrigins = this.extractOriginsFromRedirectUris(activeClients);

      if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
        res.header(
          'Access-Control-Allow-Methods',
          'GET,HEAD,PUT,PATCH,POST,DELETE',
        );
        res.header(
          'Access-Control-Allow-Headers',
          'Content-Type, Accept, Authorization',
        );
        res.header('Access-Control-Allow-Credentials', 'true');

        if (req.method === 'OPTIONS') {
          return res.status(200).end();
        }
      }

      return next();
    } catch (error) {
      console.error('Erro ao verificar origens CORS:', error);
      return next();
    }
  }

  private extractOriginsFromRedirectUris(clients: ClientDocument[]): string[] {
    const authProviderUrl = process.env.AUTH_PROVIDER_URL;
    const origins = new Set<string>();
    if (authProviderUrl) origins.add(authProviderUrl);

    clients.forEach((client) => {
      if (!client.redirectUri) {
        return;
      }

      origins.add(client.redirectUri);
    });

    return Array.from(origins);
  }
}
