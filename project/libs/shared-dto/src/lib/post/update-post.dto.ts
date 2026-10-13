import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { PostStatus, PostValidation, YoutubeUrl } from '@project/shared-types';
import { ValidateTags } from '@project/shared-helpers';

/**
 * Частичное обновление публикации (§1.3, §2.11, §2.12): все поля опциональны,
 * ограничения совпадают с create-DTO соответствующего типа. Поля чужого типа
 * репозиторий не сохраняет — он пишет только колонки типа самой публикации.
 */
export class UpdatePostDto {
  @ApiProperty({
    description: 'Заголовок (video, text)',
    minLength: PostValidation.Title.MinLength,
    maxLength: PostValidation.Title.MaxLength,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(PostValidation.Title.MinLength)
  @MaxLength(PostValidation.Title.MaxLength)
  public title?: string;

  @ApiProperty({
    description:
      'Ссылка на ролик YouTube (video): youtube.com/watch?v=…, youtu.be/…, /shorts/…, /embed/…, /live/…',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  @Matches(YoutubeUrl.Pattern, { message: YoutubeUrl.ValidationMessage })
  public videoUrl?: string;

  @ApiProperty({
    description: 'Анонс (text)',
    minLength: PostValidation.Announce.MinLength,
    maxLength: PostValidation.Announce.MaxLength,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(PostValidation.Announce.MinLength)
  @MaxLength(PostValidation.Announce.MaxLength)
  public announce?: string;

  @ApiProperty({
    description: 'Текст публикации (text)',
    minLength: PostValidation.Text.MinLength,
    maxLength: PostValidation.Text.MaxLength,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(PostValidation.Text.MinLength)
  @MaxLength(PostValidation.Text.MaxLength)
  public text?: string;

  @ApiProperty({
    description: 'Текст цитаты (quote)',
    minLength: PostValidation.QuoteText.MinLength,
    maxLength: PostValidation.QuoteText.MaxLength,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(PostValidation.QuoteText.MinLength)
  @MaxLength(PostValidation.QuoteText.MaxLength)
  public quoteText?: string;

  @ApiProperty({
    description: 'Автор цитаты (quote)',
    minLength: PostValidation.QuoteAuthor.MinLength,
    maxLength: PostValidation.QuoteAuthor.MaxLength,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(PostValidation.QuoteAuthor.MinLength)
  @MaxLength(PostValidation.QuoteAuthor.MaxLength)
  public quoteAuthor?: string;

  @ApiProperty({ description: 'URL фотографии (photo)', required: false })
  @IsOptional()
  @IsUrl({ require_tld: false })
  public photoUrl?: string;

  @ApiProperty({ description: 'Ссылка (link)', required: false })
  @IsOptional()
  @IsUrl({ require_tld: false })
  public link?: string;

  @ApiProperty({
    description: 'Описание ссылки (link)',
    maxLength: PostValidation.LinkDescription.MaxLength,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(PostValidation.LinkDescription.MaxLength)
  public description?: string;

  @ApiProperty({ description: 'Теги публикации', required: false })
  @ValidateTags()
  public tags?: string[];

  @ApiProperty({
    description: 'Дата публикации (§2.11) — влияет на сортировку',
    required: false,
    format: 'date-time',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  public publishedAt?: Date;

  @ApiProperty({
    enum: PostStatus,
    description: 'Статус публикации (§2.12): published | draft',
    required: false,
  })
  @IsOptional()
  @IsEnum(PostStatus)
  public status?: PostStatus;
}
