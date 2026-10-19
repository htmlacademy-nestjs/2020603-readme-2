import { ApiProperty } from '@nestjs/swagger';
import { Equals } from 'class-validator';
import { PostType } from '@project/shared-types';
import { TextPostContentDto } from '@project/shared-dto';

export class CreateTextPostDto extends TextPostContentDto {
  @ApiProperty({ example: PostType.Text, enum: PostType })
  @Equals(PostType.Text)
  public readonly type = PostType.Text;
}
