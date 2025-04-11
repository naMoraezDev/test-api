import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ApiResponseDto } from 'src/common/dtos/api-response.dto';

export function setupSwagger(app: INestApplication): void {
  const options = new DocumentBuilder()
    .setTitle('Lance Auth API')
    .setDescription(
      'API para gerenciamento de preferências de usuários e integrações OAuth2, permitindo a configuração de aplicativos cliente com credenciais específicas, armazenanamento de configurações personalizadas dos usuários e integrações com serviços externos.',
    )
    .setVersion('2.0')
    .addBearerAuth()
    .addApiKey(
      {
        in: 'header',
        type: 'apiKey',
        name: 'x-api-key',
        description:
          'Chave de API para autenticação. Pode ser fornecida também via query param ou header Authorization',
      },
      'x-api-key',
    )
    .build();

  const document = SwaggerModule.createDocument(app, options, {
    extraModels: [ApiResponseDto],
  });

  document.tags = [
    { name: 'health' },
    { name: 'oauth flow' },
    { name: 'oauth clients' },
    { name: 'preferences' },
    { name: 'loyalty' },
    { name: 'form' },
    { name: 'products' },
    { name: 'newsletter' },
  ];

  SwaggerModule.setup('docs', app, document);
}
