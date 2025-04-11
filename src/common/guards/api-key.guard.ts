import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private validApiKeys: string[];

  constructor() {
    this.validApiKeys = (process.env.API_KEYS || '')
      .split(',')
      .map((key) => key.trim())
      .filter((key) => key.length > 0);
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const apiKey = this.extractApiKey(request);

    if (!this.isValidApiKey(apiKey)) {
      throw new UnauthorizedException('API key inválida ou ausente');
    }

    return true;
  }

  private extractApiKey(request: Request): string | undefined {
    const apiKeyHeader = request.header('x-api-key');
    if (apiKeyHeader) {
      return apiKeyHeader;
    }

    const authHeader = request.header('authorization');
    if (authHeader && authHeader.startsWith('ApiKey ')) {
      return authHeader.substring(7);
    }

    if (request.query.apiKey) {
      return request.query.apiKey as string;
    }

    return undefined;
  }

  private isValidApiKey(apiKey: string | undefined): boolean {
    if (!apiKey) {
      return false;
    }

    return this.validApiKeys.includes(apiKey);
  }
}
