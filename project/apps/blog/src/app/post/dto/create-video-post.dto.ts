import { ApiProperty } from '@nestjs/swagger';
import { Equals } from 'class-validator';
import { PostType } from '@project/shared-types';
import { VideoPostContentDto } from '@project/shared-dto';

export class CreateVideoPostDto extends VideoPostContentDto {
  @ApiProperty({ example: PostType.Video, enum: PostType })
  @Equals(PostType.Video)
  public readonly type = PostType.Video;
}
