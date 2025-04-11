import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ApiSecurity, ApiUnauthorizedResponse } from '@nestjs/swagger';

export const SkipApiKey = () => SetMetadata('skipApiKey', true);

export const ApiKeyAuth = () => {
  return applyDecorators(
    ApiSecurity('x-api-key'),
    ApiUnauthorizedResponse({ description: 'API key inválida ou ausente' }),
  );
};
