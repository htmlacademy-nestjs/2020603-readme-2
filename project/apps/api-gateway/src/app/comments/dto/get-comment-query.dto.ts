import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { MAX_LIMIT } from '../comments.constant';

export class GetCommentQueryDto {
  @ApiProperty({
    example: 50,
    description: 'Количество комментариев на странице',
    required: false,
    maximum: MAX_LIMIT,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_LIMIT)
  public limit?: number;

  @ApiProperty({
    example: 1,
    description: 'Номер страницы комментариев',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  public page?: number;
}
