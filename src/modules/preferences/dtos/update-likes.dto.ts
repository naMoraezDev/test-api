import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, ValidateIf } from 'class-validator';

export class UpdateLikesDto {
  @ApiProperty({
    required: false,
    type: [String],
  })
  @IsArray()
  @ValidateIf((o) => o.addLikedPosts !== undefined)
  @IsString({ each: true })
  addLikedPosts?: string[];

  @ApiProperty({
    required: false,
    type: [String],
  })
  @IsArray()
  @ValidateIf((o) => o.deleteLikedPosts !== undefined)
  @IsString({ each: true })
  deleteLikedPosts?: string[];
}
