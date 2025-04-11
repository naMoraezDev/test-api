import {
  ApiOkResponse,
  getSchemaPath,
  ApiExtraModels,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { applyDecorators, Type } from '@nestjs/common';
import { ApiSuccessResponseDto } from '../dtos/api-success-response.dto';

interface ApiResponseOptions {
  type: Type<any>;
  status?: number;
  isArray?: boolean;
}

export const ApiResponseDecorator = (options: ApiResponseOptions) => {
  const { type, status = 200, isArray = false } = options;

  const ResponseDecorator = status === 201 ? ApiCreatedResponse : ApiOkResponse;

  return applyDecorators(
    ApiExtraModels(ApiSuccessResponseDto, type),
    ResponseDecorator({
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiSuccessResponseDto) },
          {
            properties: {
              data: isArray
                ? {
                    type: 'array',
                    items: { $ref: getSchemaPath(type) },
                  }
                : {
                    $ref: getSchemaPath(type),
                  },
              meta: {
                type: 'object',
                properties: {
                  requestId: {
                    type: 'string',
                    example: '123e4567-e89b-12d3-a456-426614174000',
                  },
                },
              },
            },
          },
        ],
      },
    }),
  );
};
