import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { PostType } from '@project/shared-types';
import { POST_SORT_VALUES } from '../post-query.type';
import type { PostQuery, PostSortBy } from '../post-query.type';

export class GetPostQueryDto implements PostQuery {
  @ApiProperty({ example: 25, description: 'Количество записей на странице', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  public limit?: number;

  @ApiProperty({ example: 1, description: 'Номер страницы', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  public page?: number;

  @ApiProperty({ enum: POST_SORT_VALUES, required: false })
  @IsOptional()
  @IsIn(POST_SORT_VALUES)
  public sortBy?: PostSortBy;

  @ApiProperty({ enum: PostType, required: false })
  @IsOptional()
  @IsEnum(PostType)
  public type?: PostType;

  @ApiProperty({ example: 'nestjs', description: 'Фильтр по тегу', required: false })
  @IsOptional()
  @IsString()
  public tag?: string;

  @ApiProperty({ example: 'user-id-123', description: 'Фильтр по автору', required: false })
  @IsOptional()
  @IsString()
  public authorId?: string;
}
