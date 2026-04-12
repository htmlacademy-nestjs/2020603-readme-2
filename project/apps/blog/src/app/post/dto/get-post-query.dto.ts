import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PostType } from '@project/shared-types';

export class GetPostQueryDto {
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

  @ApiProperty({ enum: ['publishedAt', 'likes', 'comments'], required: false })
  @IsOptional()
  @IsEnum(['publishedAt', 'likes', 'comments'])
  public sortBy?: 'publishedAt' | 'likes' | 'comments';

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
