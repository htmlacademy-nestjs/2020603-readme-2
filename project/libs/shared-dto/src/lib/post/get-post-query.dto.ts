import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import {
  Pagination,
  PostListLimit,
  PostSortBy,
  PostType,
} from '@project/shared-types';
import type { PostQuery } from '@project/shared-types';

export class GetPostQueryDto implements PostQuery {
  @ApiProperty({
    example: PostListLimit.Default,
    description: 'Количество записей на странице',
    required: false,
    maximum: PostListLimit.Max,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(Pagination.MinLimit)
  @Max(PostListLimit.Max)
  public limit?: number;

  @ApiProperty({
    example: Pagination.FirstPage,
    description: 'Номер страницы',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(Pagination.FirstPage)
  public page?: number;

  @ApiProperty({ enum: PostSortBy, required: false })
  @IsOptional()
  @IsEnum(PostSortBy)
  public sortBy?: PostSortBy;

  @ApiProperty({ enum: PostType, required: false })
  @IsOptional()
  @IsEnum(PostType)
  public type?: PostType;

  @ApiProperty({
    example: 'nestjs',
    description: 'Фильтр по тегу',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toLowerCase() : value,
  )
  @IsString()
  public tag?: string;

  @ApiProperty({
    example: 'user-id-123',
    description: 'Фильтр по автору',
    required: false,
  })
  @IsOptional()
  @IsString()
  public authorId?: string;
}
