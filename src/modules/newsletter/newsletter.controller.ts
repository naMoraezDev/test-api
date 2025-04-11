import { NewsletterService } from './newsletter.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NewsletterRequestDto } from './dtos/newsletter-request.dto';
import { NewsletterResponseDto } from './dtos/newsletter-response.dto';
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiResponseDecorator } from 'src/common/decorators/api-response.decorator';

@ApiTags('newsletter')
@Controller('newsletter/email/register')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cadastrar email no serviço de newsletter',
    description:
      'Cadastra o email fornecido no serviço de newsletter (SendPulse).',
  })
  @ApiResponseDecorator({ type: NewsletterResponseDto })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'O email é obrigatório',
  })
  async newsletterSubscribe(
    @Body() newsletterRequestDto: NewsletterRequestDto,
  ): Promise<NewsletterResponseDto> {
    return this.newsletterService.subscribe(newsletterRequestDto.email);
  }
}
