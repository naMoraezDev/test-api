import { NewsletterResponseDto } from './dtos/newsletter-response.dto';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { SendpulseService } from 'src/integrations/sendpulse/sendpulse.service';

@Injectable()
export class NewsletterService {
  constructor(private readonly sendpulseService: SendpulseService) {}

  async subscribe(email: string): Promise<NewsletterResponseDto> {
    try {
      await this.sendpulseService.subscribe(email);
      return { registeredEmail: email };
    } catch (error) {
      console.error('Erro no serviço de newsletter:', error);
      throw new ServiceUnavailableException(
        'Serviço de newsletter indisponível no momento',
      );
    }
  }
}
