import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { PostValidation } from '@project/shared-types';
import { ValidateTags } from '@project/shared-helpers';

/** Данные публикации типа «Текст» (§2.6). */
export class TextPostContentDto {
  @ApiProperty({
    example: 'Мой первый пост о TypeScript разработке',
    minLength: PostValidation.Title.MinLength,
    maxLength: PostValidation.Title.MaxLength,
  })
  @IsString()
  @MinLength(PostValidation.Title.MinLength)
  @MaxLength(PostValidation.Title.MaxLength)
  public title!: string;

  @ApiProperty({
    example: 'Краткий анонс публикации, который заинтересует читателя',
    minLength: PostValidation.Announce.MinLength,
    maxLength: PostValidation.Announce.MaxLength,
  })
  @IsString()
  @MinLength(PostValidation.Announce.MinLength)
  @MaxLength(PostValidation.Announce.MaxLength)
  public announce!: string;

  @ApiProperty({
    example: 'Полный текст публикации...',
    minLength: PostValidation.Text.MinLength,
    maxLength: PostValidation.Text.MaxLength,
  })
  @IsString()
  @MinLength(PostValidation.Text.MinLength)
  @MaxLength(PostValidation.Text.MaxLength)
  public text!: string;

  @ApiProperty({ example: ['typescript'], required: false })
  @ValidateTags()
  public tags?: string[];
}
