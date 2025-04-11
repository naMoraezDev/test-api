import { Module } from '@nestjs/common';
import { NewsletterService } from './newsletter.service';
import { NewsletterController } from './newsletter.controller';
import { SendpulseService } from 'src/integrations/sendpulse/sendpulse.service';

@Module({
  exports: [NewsletterService],
  controllers: [NewsletterController],
  providers: [NewsletterService, SendpulseService],
})
export class NewsletterModule {}
