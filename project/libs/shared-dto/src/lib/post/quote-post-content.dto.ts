import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { PostValidation } from '@project/shared-types';
import { ValidateTags } from '@project/shared-helpers';

/** Данные публикации типа «Цитата» (§2.7). */
export class QuotePostContentDto {
  @ApiProperty({
    example: 'Любая достаточно продвинутая технология неотличима от магии',
    minLength: PostValidation.QuoteText.MinLength,
    maxLength: PostValidation.QuoteText.MaxLength,
  })
  @IsString()
  @MinLength(PostValidation.QuoteText.MinLength)
  @MaxLength(PostValidation.QuoteText.MaxLength)
  public quoteText!: string;

  @ApiProperty({
    example: 'Артур Кларк',
    minLength: PostValidation.QuoteAuthor.MinLength,
    maxLength: PostValidation.QuoteAuthor.MaxLength,
  })
  @IsString()
  @MinLength(PostValidation.QuoteAuthor.MinLength)
  @MaxLength(PostValidation.QuoteAuthor.MaxLength)
  public quoteAuthor!: string;

  @ApiProperty({ example: ['science'], required: false })
  @ValidateTags()
  public tags?: string[];
}
