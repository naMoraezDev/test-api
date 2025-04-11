import { ApiProperty } from '@nestjs/swagger';

export class ApiSuccessResponseDto<T> {
  @ApiProperty({
    example: true,
    description: 'Indica se a operação foi bem-sucedida',
  })
  success: boolean;

  @ApiProperty({
    description: 'Os dados retornados pela resposta',
    required: false,
  })
  data?: T;

  @ApiProperty({
    description: 'Metadados adicionais da resposta',
    required: false,
    example: {
      timestamp: '2025-03-01T12:00:00.000Z',
      requestId: '123e4567-e89b-12d3-a456-426614174000',
    },
  })
  meta?: {
    timestamp: string;
    requestId?: string;
  };

  constructor(options: {
    success: boolean;
    data?: T;
    errorCode?: string;
    errorMessage?: string;
    errorDetails?: any;
    requestId?: string;
  }) {
    this.success = options.success;

    if (options.data !== undefined) {
      this.data = options.data;
    }

    this.meta = {
      timestamp: new Date().toISOString(),
    };

    if (options.requestId) {
      this.meta.requestId = options.requestId;
    }
  }

  static success<T>(
    data: T,
    options?: {
      requestId?: string;
    },
  ): ApiSuccessResponseDto<T> {
    return new ApiSuccessResponseDto({
      success: true,
      data,
      requestId: options?.requestId,
    });
  }
}
