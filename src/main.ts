import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { setupSwagger } from './config/swagger.config';
import { GlobalExceptionFilter } from './common/filters/http-exceptions.filter';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ApiResponseInterceptor } from './common/interceptors/api-response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const isDevelopment = process.env.NODE_ENV !== 'production';

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalInterceptors(new ApiResponseInterceptor());

  app.useGlobalFilters(new GlobalExceptionFilter());

  app.enableCors({
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    origin: (requestOrigin, callback) => {
      const allowedOriginsStr = process.env.ALLOWED_ORIGINS || '';
      const allowedOrigins = allowedOriginsStr
        .split(',')
        .map((origin) => origin.trim())
        .filter((origin) => origin.length > 0);

      const isLocalOrigin =
        requestOrigin &&
        (requestOrigin.startsWith('http://localhost:') ||
          requestOrigin.startsWith('http://127.0.0.1:') ||
          requestOrigin.startsWith('http://[::1]:') ||
          requestOrigin.includes('.local:'));

      if (
        !requestOrigin ||
        allowedOrigins.includes(requestOrigin) ||
        (isDevelopment && isLocalOrigin)
      ) {
        callback(null, true);
      } else {
        console.warn(`Requisição de origem bloqueada: ${requestOrigin}`);
        callback(new Error(`Origem não autorizada: ${requestOrigin}`), false);
      }
    },
    allowedHeaders: 'Origin,X-Requested-With,Content-Type,Accept,Authorization',
  } as CorsOptions);

  app.setGlobalPrefix('v1');

  if (process.env.NODE_ENV !== 'production') {
    setupSwagger(app);
  }

  await app.listen(process.env.PORT || '3333');
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
