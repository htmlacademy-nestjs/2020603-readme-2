import { ApiProperty } from '@nestjs/swagger';
import { Equals } from 'class-validator';
import { PostType } from '@project/shared-types';
import { LinkPostContentDto } from '@project/shared-dto';

export class CreateLinkPostDto extends LinkPostContentDto {
  @ApiProperty({ example: PostType.Link, enum: PostType })
  @Equals(PostType.Link)
  public readonly type = PostType.Link;
}
