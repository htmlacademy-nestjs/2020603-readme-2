import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { PostValidation } from '@project/shared-types';

export class SearchPostQueryDto {
  @ApiProperty({
    example: 'nestjs',
    description: 'Строка для поиска по заголовку публикации',
    minLength: PostValidation.SearchQuery.MinLength,
    maxLength: PostValidation.SearchQuery.MaxLength,
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(PostValidation.SearchQuery.MinLength)
  @MaxLength(PostValidation.SearchQuery.MaxLength)
  public title!: string;
}
