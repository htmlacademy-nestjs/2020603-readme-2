import { ApiProperty } from '@nestjs/swagger';
import { Equals } from 'class-validator';
import { PostType } from '@project/shared-types';
import { QuotePostContentDto } from '@project/shared-dto';

export class CreateQuotePostDto extends QuotePostContentDto {
  @ApiProperty({ example: PostType.Quote, enum: PostType })
  @Equals(PostType.Quote)
  public readonly type = PostType.Quote;
}
