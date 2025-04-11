import { IsOptional, IsString } from 'class-validator';

export class SmartLinkQueryDto {
  @IsString()
  @IsOptional()
  redirect_to?: string;
}
