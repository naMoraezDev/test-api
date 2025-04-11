import { Response } from 'express';
import { HealthService } from './health.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthStatus } from 'src/common/utils/health-helpers';
import { Controller, Get, HttpCode, HttpStatus, Res } from '@nestjs/common';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('liveness')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verificar vivacidade da aplicação',
    description:
      'Verifica se a aplicação está em execução e pode processar solicitações. Este é um endpoint minimalista que não realiza verificações em componentes dependentes. É especialmente útil para probes de liveness do Kubernetes, que determinam se a aplicação deve ser reiniciada em caso de falha.',
  })
  async liveness() {
    return await this.healthService.checkLiveness();
  }

  @Get('readiness')
  @ApiOperation({
    summary: 'Verificar prontidão da aplicação',
    description:
      'Verifica se a aplicação está pronta para receber tráfego, examinando todos os componentes e serviços externos dos quais a aplicação depende. Esta verificação completa garante que a aplicação não apenas está em execução, mas também pode operar normalmente com suas dependências. É especialmente útil para probes de readiness do Kubernetes, que determinam se a aplicação deve receber tráfego.',
  })
  async readiness(
    @Res({ passthrough: true }) res: Response,
  ): Promise<HealthStatus> {
    const healthStatus = await this.healthService.checkReadiness();

    const statusCode =
      healthStatus.status === 'ok'
        ? HttpStatus.OK
        : healthStatus.status === 'degraded'
          ? HttpStatus.SERVICE_UNAVAILABLE
          : HttpStatus.INTERNAL_SERVER_ERROR;

    res.status(statusCode);

    return healthStatus;
  }
}
