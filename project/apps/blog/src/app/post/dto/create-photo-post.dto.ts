import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { PostType } from '@project/shared-types';

export class CreatePhotoPostDto {
  @ApiProperty({ example: PostType.Photo, enum: PostType })
  public readonly type = PostType.Photo;

  @ApiProperty({ example: 'https://example.com/photo.jpg', description: 'URL фотографии (jpg/png, до 1 МБ)' })
  @IsUrl()
  public photoUrl!: string;

  @ApiProperty({ example: ['photo', 'nature'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(8)
  public tags?: string[];
}
