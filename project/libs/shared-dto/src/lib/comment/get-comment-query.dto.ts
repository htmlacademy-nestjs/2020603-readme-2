import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { CommentListLimit, Pagination } from '@project/shared-types';
import type { PaginationQuery } from '@project/shared-types';

export class GetCommentQueryDto implements PaginationQuery {
  @ApiProperty({
    example: CommentListLimit.Default,
    description: 'Количество комментариев на странице',
    required: false,
    maximum: CommentListLimit.Max,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(Pagination.MinLimit)
  @Max(CommentListLimit.Max)
  public limit?: number;

  @ApiProperty({
    example: Pagination.FirstPage,
    description: 'Номер страницы комментариев',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(Pagination.FirstPage)
  public page?: number;
}
