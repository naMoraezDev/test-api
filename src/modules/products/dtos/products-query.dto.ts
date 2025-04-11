import { Transform } from 'class-transformer';
import { IsOptional, IsNumberString } from 'class-validator';

export class ProductsQueryDto {
  @IsNumberString()
  @IsOptional()
  @Transform(({ value }) => value || '1')
  page?: string = '1';

  @IsNumberString()
  @IsOptional()
  @Transform(({ value }) => value || '10')
  limit?: string = '10';
}
