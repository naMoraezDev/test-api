import { ApiProperty } from '@nestjs/swagger';

export class NewsletterResponseDto {
  @ApiProperty({
    example: 'exemplo@gmail.com',
  })
  registeredEmail: string;
}
