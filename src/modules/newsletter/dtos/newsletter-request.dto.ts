import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class NewsletterRequestDto {
  @ApiProperty({
    example: 'exemplo@gmail.com',
  })
  @IsNotEmpty()
  @IsString()
  readonly email: string;
}
