import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { ApiKeyGuard } from './api-key.guard';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class ApiKeyOptionalGuard extends ApiKeyGuard implements CanActivate {
  private reflector: Reflector;

  constructor(reflector: Reflector) {
    super();
    this.reflector = reflector;
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const skipApiKey = this.reflector.get<boolean>(
      'skipApiKey',
      context.getHandler(),
    );

    if (skipApiKey) {
      return true;
    }

    return super.canActivate(context);
  }
}
