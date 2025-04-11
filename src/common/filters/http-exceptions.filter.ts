import {
  Catch,
  Logger,
  HttpStatus,
  ArgumentsHost,
  HttpException,
  ExceptionFilter,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response } from 'express';
import { ApiResponseDto } from '../dtos/api-response.dto';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);
  private readonly excludedRoutes = [
    '/v1/health/liveness',
    '/v1/health/readiness',
  ];

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestId = uuidv4();

    if (
      this.excludedRoutes.includes(request.url) &&
      exception instanceof HttpException
    ) {
      response.status(exception.getStatus()).json(exception.getResponse());
    }

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode = 'INTERNAL_SERVER_ERROR';
    let errorMessage = 'Ocorreu um erro interno no servidor';
    let errorDetails = null;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        const exceptionResponseObj = exceptionResponse as Record<string, any>;
        errorMessage = exceptionResponseObj.message || errorMessage;
        errorCode =
          exceptionResponseObj.error || this.getErrorCodeFromStatus(statusCode);
        errorDetails = exceptionResponseObj.details || null;
      } else if (typeof exceptionResponse === 'string') {
        errorMessage = exceptionResponse;
        errorCode = this.getErrorCodeFromStatus(statusCode);
      }
    }

    this.logger.error({
      statusCode,
      path: request.url,
      method: request.method,
      errorCode,
      errorMessage,
      errorDetails,
      requestId,
      exception,
    });

    const apiResponse = ApiResponseDto.error({
      errorCode,
      errorMessage,
      errorDetails,
      requestId,
    });

    response
      .status(statusCode)
      .setHeader('X-Request-ID', requestId)
      .json(apiResponse);
  }

  private getErrorCodeFromStatus(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'BAD_REQUEST';
      case HttpStatus.UNAUTHORIZED:
        return 'UNAUTHORIZED';
      case HttpStatus.FORBIDDEN:
        return 'FORBIDDEN';
      case HttpStatus.NOT_FOUND:
        return 'NOT_FOUND';
      case HttpStatus.CONFLICT:
        return 'CONFLICT';
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'VALIDATION_ERROR';
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'TOO_MANY_REQUESTS';
      default:
        return 'INTERNAL_SERVER_ERROR';
    }
  }
}
