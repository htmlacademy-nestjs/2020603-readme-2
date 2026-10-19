import { ApiProperty } from '@nestjs/swagger';
import { Equals, IsUrl } from 'class-validator';
import { PostType } from '@project/shared-types';
import { ValidateTags } from '@project/shared-helpers';

export class CreatePhotoPostDto {
  @ApiProperty({ example: PostType.Photo, enum: PostType })
  @Equals(PostType.Photo)
  public readonly type = PostType.Photo;

  @ApiProperty({
    example: 'https://example.com/photo.jpg',
    description: 'URL фотографии (jpg/png, до 1 МБ)',
  })
  @IsUrl({ require_tld: false })
  public photoUrl!: string;

  @ApiProperty({ example: ['photo', 'nature'], required: false })
  @ValidateTags()
  public tags?: string[];
}
