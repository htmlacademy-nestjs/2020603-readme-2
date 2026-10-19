import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { PostValidation, YoutubeUrl } from '@project/shared-types';
import { ValidateTags } from '@project/shared-helpers';

/** Данные публикации типа «Видео» (§2.5). */
export class VideoPostContentDto {
  @ApiProperty({
    example: 'Как выучить TypeScript за 20 минут',
    minLength: PostValidation.Title.MinLength,
    maxLength: PostValidation.Title.MaxLength,
  })
  @IsString()
  @MinLength(PostValidation.Title.MinLength)
  @MaxLength(PostValidation.Title.MaxLength)
  public title!: string;

  @ApiProperty({
    example: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    description:
      'Ссылка на ролик YouTube: youtube.com/watch?v=…, youtu.be/…, /shorts/…, /embed/…, /live/…',
  })
  @IsUrl()
  @Matches(YoutubeUrl.Pattern, { message: YoutubeUrl.ValidationMessage })
  public videoUrl!: string;

  @ApiProperty({ example: ['typescript', 'tutorial'], required: false })
  @ValidateTags()
  public tags?: string[];
}
