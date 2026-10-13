import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';
import { PostValidation } from '@project/shared-types';
import { ValidateTags } from '@project/shared-helpers';

/** Данные публикации типа «Ссылка» (§2.9). */
export class LinkPostContentDto {
  @ApiProperty({ example: 'https://nestjs.com', description: 'Валидный URL' })
  @IsUrl()
  public link!: string;

  @ApiProperty({
    example: 'Официальный сайт NestJS',
    description: 'Описание ссылки',
    maxLength: PostValidation.LinkDescription.MaxLength,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(PostValidation.LinkDescription.MaxLength)
  public description?: string;

  @ApiProperty({ example: ['nestjs', 'framework'], required: false })
  @ValidateTags()
  public tags?: string[];
}
