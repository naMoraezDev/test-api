import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FormModule } from './modules/form/form.module';
import { OAuthModule } from './modules/oauth/oauth.module';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { HealthModule } from './modules/health/health.module';
import { LoyaltyModule } from './modules/loyalty/loyalty.module';
import { ClientsModule } from './modules/clients/clients.module';
import { ProductsModule } from './modules/products/products.module';
import { NewsletterModule } from './modules/newsletter/newsletter.module';
import { PreferencesModule } from './modules/preferences/preferences.module';
import { GlobalExceptionFilter } from './common/filters/http-exceptions.filter';
import { ApiResponseInterceptor } from './common/interceptors/api-response.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    FormModule,
    OAuthModule,
    HealthModule,
    ClientsModule,
    LoyaltyModule,
    ProductsModule,
    NewsletterModule,
    PreferencesModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ApiResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
